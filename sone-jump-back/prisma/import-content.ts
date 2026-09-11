/**
 * Importa a curadoria de conteúdo de `prisma/content/*.json` para o banco.
 *
 * Por que um arquivo em vez de código no seed: a curadoria é editorial, não é
 * lógica. Num arquivo de dados ela vira revisável em PR (dá para ver exatamente
 * que links entram, sem ler TypeScript) e qualquer pessoa do grupo consegue
 * contribuir sem mexer no back.
 *
 * A biblioteca é GLOBAL, os vínculos são por carreira. Todos os arquivos são
 * lidos sempre, e um arquivo pode referenciar conteúdo declarado em outro — é o
 * que permite o mesmo curso de lógica servir a backend e mobile sem virar duas
 * linhas no catálogo. Só os vínculos da carreira pedida são reconstruídos.
 *
 * A importação é idempotente por `key`: rodar de novo atualiza a linha existente
 * em vez de duplicar. Isso é o que permite corrigir um link quebrado editando o
 * JSON e reimportando.
 *
 * Uso:
 *   npm run db:import-content              importa tudo
 *   npm run db:import-content -- frontend  só reconstrói os vínculos do frontend
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
  /** Chave estável e global. Nunca mude depois de importada: é a identidade da linha. */
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

/** Uma pergunta do quiz de validação da etapa. */
interface QuizSeed {
  prompt: string;
  options: string[];
  /** Índice da alternativa correta em `options`. Nunca chega ao cliente. */
  correctIndex: number;
}

/** Amarra conteúdos da biblioteca a uma etapa do roadmap. */
interface NodeLink {
  /** `externalKey` da etapa (RoadmapNode.externalKey), dentro da carreira do arquivo. */
  node: string;
  /** Chaves de qualquer arquivo, na ordem em que devem aparecer na tela. */
  resources: string[];
  /**
   * Substitui o quiz da etapa quando presente. Fica aqui, junto do conteúdo, porque
   * a pergunta só faz sentido em relação ao material que a etapa indica — e porque
   * no seed o quiz só era criado junto com o nó, sem forma de corrigir depois.
   */
  quiz?: QuizSeed[];
}

interface ContentFile {
  /** Slug da carreira: frontend, backend, data-science, devops, mobile, ux-ui. */
  career: string;
  content: ContentSeed[];
  nodes: NodeLink[];
}

interface Arquivo {
  nome: string;
  dados: ContentFile;
}

function carregarArquivos(): Arquivo[] {
  let nomes: string[];
  try {
    nomes = readdirSync(CONTENT_DIR).filter((n) => n.endsWith('.json')).sort();
  } catch {
    return [];
  }
  return nomes.map((nome) => ({
    nome,
    dados: JSON.parse(readFileSync(join(CONTENT_DIR, nome), 'utf-8')) as ContentFile,
  }));
}

/**
 * Falha cedo e com mensagem útil. Um erro de digitação numa chave produziria, sem
 * isto, um recurso silenciosamente sem conteúdo.
 */
function validar(arquivos: Arquivo[]): { erros: string[]; biblioteca: Map<string, ContentSeed> } {
  const erros: string[] = [];
  const biblioteca = new Map<string, ContentSeed>();
  const origemDaChave = new Map<string, string>();
  const chavePorUrl = new Map<string, string>();

  for (const { nome, dados } of arquivos) {
    for (const c of dados.content) {
      const jaVisto = origemDaChave.get(c.key);
      if (jaVisto) {
        erros.push(`${nome}: chave "${c.key}" já declarada em ${jaVisto}`);
        continue;
      }
      if (!/^https?:\/\//.test(c.url)) {
        erros.push(`${nome}: ${c.key} tem url inválida (${c.url})`);
      }
      // Duas chaves para a mesma URL viram dois itens no catálogo apontando para o
      // mesmo lugar. Se o conteúdo serve a duas carreiras, a segunda deve
      // referenciar a chave da primeira em vez de declarar de novo.
      const mesmoUrl = chavePorUrl.get(c.url);
      if (mesmoUrl) {
        erros.push(`${nome}: ${c.key} repete a url de "${mesmoUrl}" — referencie a chave existente`);
      } else {
        chavePorUrl.set(c.url, c.key);
      }
      origemDaChave.set(c.key, nome);
      biblioteca.set(c.key, c);
    }
  }

  for (const { nome, dados } of arquivos) {
    for (const n of dados.nodes) {
      for (const r of n.resources) {
        if (!biblioteca.has(r)) {
          erros.push(`${nome}: etapa ${n.node} referencia "${r}", que não existe em nenhum arquivo`);
        }
      }
      if (n.quiz) {
        // A aprovação é por nota mínima, então uma etapa com poucas perguntas
        // deixa o resultado no ruído: com 2 perguntas e 70% de corte, errar uma
        // já reprova, o que equivale a exigir 100%.
        if (n.quiz.length < 3) {
          erros.push(`${nome}: etapa ${n.node} tem ${n.quiz.length} pergunta(s); o mínimo é 3`);
        }
        n.quiz.forEach((q, i) => {
          if (q.options.length < 3) {
            erros.push(`${nome}: ${n.node} pergunta ${i + 1} tem menos de 3 alternativas`);
          }
          if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
            erros.push(`${nome}: ${n.node} pergunta ${i + 1} tem correctIndex fora do intervalo`);
          }
          if (new Set(q.options).size !== q.options.length) {
            erros.push(`${nome}: ${n.node} pergunta ${i + 1} tem alternativas repetidas`);
          }
        });
      }
    }
  }

  // Se a resposta certa cair sempre na mesma posição, o quiz vira decoração:
  // escolher sempre a primeira alternativa aprova em tudo. Aconteceu de verdade na
  // primeira redação das perguntas, então a checagem fica.
  for (const { nome, dados } of arquivos) {
    const posicoes = dados.nodes.flatMap((n) => n.quiz?.map((q) => q.correctIndex) ?? []);
    if (posicoes.length >= 5 && new Set(posicoes).size === 1) {
      erros.push(
        `${nome}: todas as ${posicoes.length} respostas certas estão na posição ${posicoes[0]} — ` +
          `embaralhe as alternativas`,
      );
    }
  }

  return { erros, biblioteca };
}

async function main() {
  const filtro = process.argv[2];
  // Todos os arquivos são lidos sempre: a biblioteca é global e um arquivo pode
  // referenciar conteúdo declarado em outro.
  const todos = carregarArquivos();
  if (todos.length === 0) {
    console.log(`Nenhum arquivo em ${CONTENT_DIR}. Nada a importar.`);
    return;
  }

  const alvos = filtro ? todos.filter((a) => a.nome === `${filtro}.json`) : todos;
  if (alvos.length === 0) {
    console.error(`Arquivo ${filtro}.json não encontrado.`);
    process.exitCode = 1;
    return;
  }

  const { erros, biblioteca } = validar(todos);
  if (erros.length > 0) {
    console.error('Curadoria inválida:');
    for (const e of erros) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  // 1. Biblioteca global: cria ou atualiza cada conteúdo pela chave estável.
  const idPorChave = new Map<string, number>();
  for (const c of biblioteca.values()) {
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
    // do que casar item a item, e o volume é pequeno.
    await prisma.contentPrerequisite.deleteMany({ where: { contentId: item.id } });
    if (c.prerequisites?.length) {
      await prisma.contentPrerequisite.createMany({
        data: c.prerequisites.map((label) => ({ contentId: item.id, label })),
      });
    }
    await prisma.contentSyllabusItem.deleteMany({ where: { contentId: item.id } });
    if (c.syllabus?.length) {
      await prisma.contentSyllabusItem.createMany({
        data: c.syllabus.map((title, i) => ({ contentId: item.id, title, orderIndex: i })),
      });
    }
  }
  console.log(`biblioteca: ${biblioteca.size} conteúdos (${todos.length} arquivo(s) lido(s)).`);

  // Conteúdo que saiu da curadoria precisa sair do catálogo, senão ele acumula
  // lixo a cada revisão. Só entram na poda linhas com `externalKey` — as sem chave
  // foram criadas à mão pelo admin e não são geridas por aqui.
  //
  // Deletar um ContentItem apaga em cascata os favoritos de quem o salvou, então
  // um órfão ainda referenciado é apenas relatado. Perder o favorito de alguém em
  // silêncio, durante uma importação de conteúdo, seria um efeito colateral que
  // ninguém pediu.
  const orfaos = await prisma.contentItem.findMany({
    where: { NOT: { externalKey: null }, externalKey: { notIn: [...biblioteca.keys()] } },
    select: {
      id: true,
      externalKey: true,
      _count: { select: { roadmapResources: true, bookmarks: true } },
    },
  });
  const removiveis = orfaos.filter(
    (o) => o._count.roadmapResources === 0 && o._count.bookmarks === 0,
  );
  const retidos = orfaos.filter(
    (o) => o._count.roadmapResources > 0 || o._count.bookmarks > 0,
  );
  if (removiveis.length > 0) {
    await prisma.contentItem.deleteMany({ where: { id: { in: removiveis.map((o) => o.id) } } });
    console.log(`  removidos ${removiveis.length} órfão(s): ${removiveis.map((o) => o.externalKey).join(', ')}`);
  }
  for (const o of retidos) {
    console.log(
      `  mantido "${o.externalKey}" (fora da curadoria, mas usado em ` +
        `${o._count.roadmapResources} recurso(s) e ${o._count.bookmarks} favorito(s))`,
    );
  }

  // 2. Vínculos, só das carreiras pedidas.
  for (const { nome, dados } of alvos) {
    const career = await prisma.career.findUnique({ where: { slug: dados.career } });
    if (!career) {
      console.error(`${nome}: carreira "${dados.career}" não existe. Rode o seed antes.`);
      process.exitCode = 1;
      continue;
    }

    let vinculados = 0;
    let perguntas = 0;
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
        where: { nodeId: node.id, OR: [{ NOT: { contentItemId: null } }, { url: null }] },
      });

      for (const [i, chave] of n.resources.entries()) {
        const c = biblioteca.get(chave)!;
        await prisma.roadmapNodeResource.create({
          data: {
            nodeId: node.id,
            contentItemId: idPorChave.get(chave)!,
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

      // O quiz é substituído por inteiro quando o arquivo traz um. Recriar é
      // correto aqui: as opções são filhas da pergunta e o progresso de quem já
      // passou fica em UserRoadmapProgress, não nas perguntas — ninguém perde
      // aprovação por causa de uma reimportação.
      if (n.quiz) {
        await prisma.roadmapNodeQuizQuestion.deleteMany({ where: { nodeId: node.id } });
        for (const [qi, q] of n.quiz.entries()) {
          await prisma.roadmapNodeQuizQuestion.create({
            data: {
              nodeId: node.id,
              prompt: q.prompt,
              orderIndex: qi,
              options: {
                create: q.options.map((text, oi) => ({
                  text,
                  orderIndex: oi,
                  // A resposta certa fica só aqui e no banco; o endpoint de
                  // roadmap nunca seleciona esta coluna.
                  correct: oi === q.correctIndex,
                })),
              },
            },
          });
        }
        perguntas += n.quiz.length;
      }

      // Os curados vêm primeiro; os avulsos que restaram vão para o fim, em ordem
      // estável. Sem isto os orderIndex colidem e a ordem na tela fica arbitrária.
      const avulsos = await prisma.roadmapNodeResource.findMany({
        where: { nodeId: node.id, contentItemId: null },
        orderBy: { orderIndex: 'asc' },
        select: { id: true },
      });
      for (const [i, r] of avulsos.entries()) {
        await prisma.roadmapNodeResource.update({
          where: { id: r.id },
          data: { orderIndex: n.resources.length + i },
        });
      }
    }

    const quiz = perguntas > 0 ? `, ${perguntas} perguntas de quiz` : '';
    console.log(`${nome}: ${vinculados} vínculos em ${dados.nodes.length} etapas${quiz}.`);
    if (nosAusentes.length > 0) {
      console.error(`  etapas não encontradas em "${dados.career}": ${nosAusentes.join(', ')}`);
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
