/**
 * Verifica se os links da curadoria ainda respondem.
 *
 * Conteúdo gratuito some: vídeo é despublicado, blog sai do ar, documentação muda
 * de endereço. Sem esta checagem o catálogo apodrece em silêncio e o aluno é quem
 * descobre, clicando.
 *
 * Só relata — nunca edita arquivo nem banco. Sai com código 1 se algo quebrou,
 * para poder virar um passo de CI depois.
 *
 * Uso:
 *   npm run content:check            verifica os arquivos de curadoria
 *   npm run content:check -- --db    verifica também o que já está no banco
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'prisma', 'content');
const TIMEOUT_MS = 15000;

/**
 * HEAD primeiro por ser barato; muito servidor responde 405 a HEAD e 200 a GET,
 * então cai para GET antes de declarar quebrado. Sem esse fallback, o relatório
 * viria cheio de falso positivo.
 */
async function verificar(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const r = await fetch(url, {
        method,
        redirect: 'follow',
        signal: ctrl.signal,
        headers: {
          // Sem User-Agent de navegador, vários sites devolvem 403 para script.
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
        },
      });
      clearTimeout(t);
      if (r.ok) return { ok: true, status: r.status };
      if (method === 'GET') return { ok: false, status: r.status };
    } catch (e) {
      if (method === 'GET') return { ok: false, status: e.name === 'AbortError' ? 'timeout' : 'erro de rede' };
    }
  }
  return { ok: false, status: 'desconhecido' };
}

function urlsDosArquivos() {
  let nomes;
  try {
    nomes = readdirSync(CONTENT_DIR).filter((n) => n.endsWith('.json'));
  } catch {
    return [];
  }
  const urls = [];
  for (const nome of nomes) {
    const dados = JSON.parse(readFileSync(join(CONTENT_DIR, nome), 'utf-8'));
    for (const c of dados.content ?? []) urls.push({ origem: nome, rotulo: c.key, url: c.url });
  }
  return urls;
}

async function urlsDoBanco() {
  const { config } = await import('dotenv');
  config();
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { PrismaClient } = await import('../generated/prisma/client.js');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const itens = await prisma.contentItem.findMany({
    where: { NOT: { url: null } },
    select: { title: true, url: true },
  });
  const recursos = await prisma.roadmapNodeResource.findMany({
    where: { NOT: { url: null }, contentItemId: null },
    select: { label: true, url: true },
  });
  await prisma.$disconnect();
  return [
    ...itens.map((i) => ({ origem: 'banco/catalogo', rotulo: i.title, url: i.url })),
    ...recursos.map((r) => ({ origem: 'banco/roadmap', rotulo: r.label, url: r.url })),
  ];
}

async function main() {
  const alvos = [...urlsDosArquivos()];
  if (process.argv.includes('--db')) alvos.push(...(await urlsDoBanco()));

  if (alvos.length === 0) {
    console.log('Nenhuma URL para verificar.');
    return;
  }

  console.log(`Verificando ${alvos.length} links...\n`);
  const quebrados = [];
  // Em blocos, para não disparar tudo de uma vez contra os mesmos domínios.
  const LOTE = 8;
  for (let i = 0; i < alvos.length; i += LOTE) {
    const lote = alvos.slice(i, i + LOTE);
    const res = await Promise.all(lote.map((a) => verificar(a.url)));
    lote.forEach((a, j) => {
      const r = res[j];
      if (r.ok) {
        console.log(`  ok    ${a.rotulo}`);
      } else {
        console.log(`  QUEBRADO [${r.status}]  ${a.rotulo}  ${a.url}`);
        quebrados.push({ ...a, status: r.status });
      }
    });
  }

  console.log(`\n${alvos.length - quebrados.length}/${alvos.length} responderam.`);
  if (quebrados.length > 0) {
    console.log('\nQuebrados:');
    for (const q of quebrados) console.log(`  [${q.origem}] ${q.rotulo} -> ${q.url} (${q.status})`);
    process.exitCode = 1;
  }
}

void main();
