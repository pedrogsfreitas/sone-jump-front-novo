/**
 * Importa a curadoria de conteúdo de `prisma/content/*.json` para o banco.
 *
 * Por que um arquivo em vez de código no seed: a curadoria é editorial, não é
 * lógica. Num arquivo de dados ela vira revisável em PR (dá para ver exatamente
 * que links entram, sem ler TypeScript) e qualquer pessoa do grupo consegue
 * contribuir sem mexer no back.
 *
 * A importação é idempotente por `externalKey`: rodar de novo atualiza a linha
 * existente em vez de duplicar. Isso é o que permite corrigir um link quebrado
 * editando o JSON e reimportando.
 *
 * Uso:
 *   npm run db:import-content              importa tudo
 *   npm run db:import-content -- frontend  importa só prisma/content/frontend.json
 */
import 'dotenv/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import type {
  ContentLevel,
  ContentPlatform,
  ContentType,
} from '../generated/prisma/enums';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const CONTENT_DIR = join(__dirname, 'content');

/** Um conteúdo da biblioteca. Vira uma linha em ContentItem. */
interface ContentSeed {
  /** Chave estável. Nunca mude depois de importada: é a identidade da linha. */
  key: string;
  title: string;
  platform: ContentPlatform;
  type: ContentType;
  level: ContentLevel;
  description: string;
  url: string;
  /** Ausente quando não significa nada — uma página de documentação, por exemplo. */
  durationMinutes?: number;
  thumbnailEmoji?: string;
  prerequisites?: string[];
  syllabus?: string[];
}

/** Amarra conteúdos já definidos acima a um nó do roadmap. */
interface NodeLink {
  /** `externalKey` do nó (RoadmapNode.externalKey), dentro da carreira do arquivo. */
  node: string;
  /** Chaves de `content`, na ordem em que devem aparecer na tela. */
  resources: string[];
}

interface ContentFile {
  /** Slug da carreira: frontend, backend, data-science, devops, mobile, ux-ui. */
  career: string;
  content: ContentSeed[];
  nodes: NodeLink[];
}

function carregarArquivos(filtro?: string): { nome: string; dados: ContentFile }[] {
  let nomes: string[];
  try {
    nomes = readdirSync(CONTENT_DIR).filter((n) => n.endsWith('.json'));
  } catch {
    console.log(`Nenhum arquivo em ${CONTENT_DIR}. Nada a importar.`);
    return [];
  }
  if (filtro) nomes = nomes.filter((n) => n === `${filtro}.json`);
  return nomes.map((nome) => ({
    nome,
    dados: JSON.parse(readFileSync(join(CONTENT_DIR, nome), 'utf-8')) as ContentFile,
  }));
}

/**
 * Falha cedo e com mensagem útil. Um arquivo de curadoria com erro de digitação
 * numa chave produziria, sem isto, um recurso silenciosamente sem conteúdo.
 */
function validar(nome: string, dados: ContentFile): string[] {
  const erros: string[] = [];
  const chaves = new Set<string>();
  for (const c of dados.content) {
    if (chaves.has(c.key)) erros.push(`chave duplicada: ${c.key}`);
    chaves.add(c.key);
    if (!/^https?:\/\//.test(c.url)) erros.push(`${c.key}: url inválida (${c.url})`);
  }
  for (const n of dados.nodes) {
    for (const r of n.resources) {
      if (!chaves.has(r)) erros.push(`nó ${n.node}: recurso "${r}" não existe em content`);
    }
  }
  return erros.map((e) => `${nome}: ${e}`);
}

async function main() {
  const filtro = process.argv[2];
  const arquivos = carregarArquivos(filtro);
  if (arquivos.length === 0) {
    if (filtro) console.error(`Arquivo ${filtro}.json não encontrado.`);
    return;
  }

  const erros = arquivos.flatMap(({ nome, dados }) => validar(nome, dados));
  if (erros.length > 0) {
    console.error('Curadoria inválida:');
    for (const e of erros) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  for (const { nome, dados } of arquivos) {
    const career = await prisma.career.findUnique({ where: { slug: dados.career } });
    if (!career) {
      console.error(`${nome}: carreira "${dados.career}" não existe. Rode o seed antes.`);
      process.exitCode = 1;
      continue;
    }

    // 1. Biblioteca: cria ou atualiza cada conteúdo pela chave estável.
    const idPorChave = new Map<string, number>();
    for (const c of dados.content) {
      const dadosItem = {
        title: c.title,
        platform: c.platform,
        type: c.type,
        level: c.level,
        description: c.description,
        url: c.url,
        durationMinutes: c.durationMinutes ?? null,
        thumbnailEmoji: c.thumbnailEmoji ?? null,
      };
      const item = await prisma.contentItem.upsert({
        where: { externalKey: c.key },
        update: dadosItem,
        create: { externalKey: c.key, ...dadosItem },
      });
      idPorChave.set(c.key, item.id);

      // Pré-requisitos e ementa são listas: recriar é mais simples e mais correto
      // do que tentar casar item a item, e o volume é pequeno.
      await prisma.contentPrerequisite.deleteMany({ where: { contentId: item.id } });
      if (c.prerequisites?.length) {
        await prisma.contentPrerequisite.createMany({
          data: c.prerequisites.map((label) => ({ contentId: item.id, label })),
        });
      }
      await prisma.contentSyllabusItem.deleteMany({ where: { contentId: item.id } });
      if (c.syllabus?.length) {
        await prisma.contentSyllabusItem.createMany({
          data: c.syllabus.map((title, i) => ({
            contentId: item.id,
            title,
            orderIndex: i,
          })),
        });
      }
    }

    // 2. Amarra os conteúdos aos nós do roadmap.
    let vinculados = 0;
    const nosAusentes: string[] = [];
    for (const n of dados.nodes) {
      const node = await prisma.roadmapNode.findUnique({
        where: { careerId_externalKey: { careerId: career.id, externalKey: n.node } },
      });
      if (!node) {
        nosAusentes.push(n.node);
        continue;
      }
      // Sai o que esta importação gerencia (contentItemId preenchido) e também os
      // rótulos sem link: um recurso sem URL aparece na tela como texto que não dá
      // para clicar, o que é pior do que não aparecer. Link avulso que funciona
      // sobrevive — é curadoria manual legítima.
      await prisma.roadmapNodeResource.deleteMany({
        where: {
          nodeId: node.id,
          OR: [{ NOT: { contentItemId: null } }, { url: null }],
        },
      });
      // Os curados vêm primeiro; os avulsos que restaram vão para o fim, em ordem
      // estável. Sem isto os orderIndex colidem e a ordem na tela fica arbitrária.
      const avulsos = await prisma.roadmapNodeResource.findMany({
        where: { nodeId: node.id },
        orderBy: { orderIndex: 'asc' },
        select: { id: true },
      });
      for (const [i, r] of avulsos.entries()) {
        await prisma.roadmapNodeResource.update({
          where: { id: r.id },
          data: { orderIndex: n.resources.length + i },
        });
      }
      for (const [i, chave] of n.resources.entries()) {
        const contentItemId = idPorChave.get(chave)!;
        const c = dados.content.find((x) => x.key === chave)!;
        await prisma.roadmapNodeResource.create({
          data: {
            nodeId: node.id,
            contentItemId,
            label: c.title,
            url: c.url,
            platform: c.platform,
            type: c.type,
            durationMinutes: c.durationMinutes ?? null,
            free: true,
            orderIndex: i,
          },
        });
        vinculados++;
      }
    }

    console.log(
      `${nome}: ${dados.content.length} conteúdos, ${vinculados} vínculos em ${dados.nodes.length} nós.`,
    );
    if (nosAusentes.length > 0) {
      console.error(`  nós não encontrados em "${dados.career}": ${nosAusentes.join(', ')}`);
      process.exitCode = 1;
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
