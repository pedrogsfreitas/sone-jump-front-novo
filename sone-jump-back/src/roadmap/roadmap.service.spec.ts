import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  OnboardingLevel,
  RoadmapNodeStatus,
} from '../../generated/prisma/enums';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoadmapService } from './roadmap.service';

const USER_ID = 1;
const FRONTEND = {
  id: 'career-fe',
  slug: 'frontend',
  title: 'Frontend Developer',
};
const BACKEND = {
  id: 'career-be',
  slug: 'backend',
  title: 'Backend Developer',
};

interface MockQuizOption {
  id: string;
  text: string;
  correct: boolean;
}

interface MockQuizQuestion {
  id: string;
  prompt: string;
  orderIndex: number;
  options: MockQuizOption[];
}

interface MockNode {
  id: string;
  careerId: string;
  name: string;
  orderIndex: number;
  /** Define qual certificação o nó ajuda a conquistar. */
  category: string;
  prerequisites: Array<{ prerequisiteNodeId: string }>;
  quizQuestions: MockQuizQuestion[];
}

interface MockCertification {
  id: number;
  careerId: string;
  category: string;
}

interface MockUserCertification {
  userId: number;
  certificationId: number;
  earnedAt: Date;
}

interface MockProgress {
  userId: number;
  nodeId: string;
  status: RoadmapNodeStatus;
  completedAt: Date | null;
  studyConfirmedAt?: Date | null;
  quizPassedAt?: Date | null;
}

/** Uma pergunta com duas alternativas, sendo `<id>-ok` a correta. */
function quiz(nodeId: string): MockQuizQuestion[] {
  return [
    {
      id: `${nodeId}-q1`,
      prompt: `pergunta de ${nodeId}`,
      orderIndex: 0,
      options: [
        { id: `${nodeId}-ok`, text: 'certa', correct: true },
        { id: `${nodeId}-no`, text: 'errada', correct: false },
      ],
    },
  ];
}

function node(
  id: string,
  careerId: string,
  orderIndex: number,
  prerequisites: string[] = [],
  quizQuestions: MockQuizQuestion[] = [],
  category = 'CORE',
): MockNode {
  return {
    id,
    careerId,
    name: id,
    orderIndex,
    category,
    prerequisites: prerequisites.map((prerequisiteNodeId) => ({
      prerequisiteNodeId,
    })),
    quizQuestions,
  };
}

/**
 * Dois roadmaps independentes, um por carreira — cada carreira tem as suas próprias
 * cópias de nó, que é o modelo adotado na Fase 8.
 */
const NODES: MockNode[] = [
  node('fe-html', FRONTEND.id, 0, [], quiz('fe-html')),
  node('fe-js', FRONTEND.id, 1, ['fe-html'], quiz('fe-js')),
  node('fe-react', FRONTEND.id, 2, ['fe-js']),
  // nó com DOIS pré-requisitos: só abre quando ambos estiverem concluídos
  node('fe-portfolio', FRONTEND.id, 3, ['fe-react', 'fe-html']),
  node('be-node', BACKEND.id, 0),
];

function buildService(
  careerId: string | null,
  progress: MockProgress[] = [],
  experienceLevel: OnboardingLevel | null = null,
  certifications: MockCertification[] = [],
) {
  const rows = [...progress];
  const certRows = [...certifications];
  const earned: MockUserCertification[] = [];

  const prisma = {
    user: {
      findUnique: jest.fn(() =>
        Promise.resolve({
          experienceLevel,
          career:
            careerId === null
              ? null
              : ([FRONTEND, BACKEND].find((c) => c.id === careerId) ?? null),
        }),
      ),
    },
    roadmapNode: {
      findMany: jest.fn(({ where }: { where: { careerId: string } }) =>
        Promise.resolve(
          NODES.filter((n) => n.careerId === where.careerId)
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((n) => ({
              ...n,
              estimatedHours: 10,
              description: n.name,
              resources: [],
              // O serviço faz `select` sem `correct` nesta consulta; o mock reproduz
              // isso para que um vazamento da resposta apareça como teste quebrado.
              quizQuestions: n.quizQuestions.map((q) => ({
                ...q,
                options: q.options.map(({ id, text }) => ({ id, text })),
              })),
            })),
        ),
      ),
      findUnique: jest.fn(({ where }: { where: { id: string } }) => {
        const n = NODES.find((x) => x.id === where.id);
        return Promise.resolve(
          n ? { careerId: n.careerId, category: n.category } : null,
        );
      }),
      count: jest.fn(
        ({ where }: { where: { careerId: string; category: string } }) =>
          Promise.resolve(
            NODES.filter(
              (n) =>
                n.careerId === where.careerId && n.category === where.category,
            ).length,
          ),
      ),
    },
    roadmapNodeQuizQuestion: {
      findMany: jest.fn(({ where }: { where: { nodeId: string } }) =>
        Promise.resolve(
          NODES.find((n) => n.id === where.nodeId)?.quizQuestions ?? [],
        ),
      ),
    },
    certification: {
      findFirst: jest.fn(
        ({ where }: { where: { careerId: string; category: string } }) =>
          Promise.resolve(
            certRows.find(
              (c) =>
                c.careerId === where.careerId && c.category === where.category,
            ) ?? null,
          ),
      ),
    },
    userCertification: {
      upsert: jest.fn(
        ({
          where,
          create,
        }: {
          where: {
            userId_certificationId: {
              userId: number;
              certificationId: number;
            };
          };
          create: MockUserCertification;
        }) => {
          const { userId, certificationId } = where.userId_certificationId;
          const existente = earned.find(
            (e) => e.userId === userId && e.certificationId === certificationId,
          );
          // `update: {}` no serviço: reconquistar não sobrescreve a data original.
          if (!existente) earned.push({ ...create });
          return Promise.resolve(existente ?? create);
        },
      ),
    },
    userRoadmapProgress: {
      findMany: jest.fn(({ where }: { where: { userId: number } }) =>
        Promise.resolve(rows.filter((r) => r.userId === where.userId)),
      ),
      count: jest.fn(
        ({
          where,
        }: {
          where: {
            userId: number;
            status: RoadmapNodeStatus;
            node: { careerId: string; category: string };
          };
        }) =>
          Promise.resolve(
            rows.filter((r) => {
              if (r.userId !== where.userId || r.status !== where.status)
                return false;
              const n = NODES.find((x) => x.id === r.nodeId);
              return (
                n?.careerId === where.node.careerId &&
                n?.category === where.node.category
              );
            }).length,
          ),
      ),
      upsert: jest.fn(
        ({
          where,
          create,
          update,
        }: {
          where: { userId_nodeId: { userId: number; nodeId: string } };
          create: MockProgress;
          update: Partial<MockProgress>;
        }) => {
          const existing = rows.find(
            (r) =>
              r.userId === where.userId_nodeId.userId &&
              r.nodeId === where.userId_nodeId.nodeId,
          );
          // Linha existente recebe `update` (parcial), linha nova recebe `create` —
          // usar `create` nos dois casos apagaria campos já gravados, e é justamente
          // isso que o fluxo de duas etapas (estudo + quiz) não pode fazer.
          if (existing) Object.assign(existing, update);
          else rows.push({ ...create });
          return Promise.resolve(existing ?? create);
        },
      ),
    },
  };

  const xp = { award: jest.fn(() => Promise.resolve()) };
  const service = new RoadmapService(
    prisma as unknown as PrismaService,
    xp as unknown as XpService,
  );

  return { service, rows, xp, earned, certRows };
}

function done(nodeId: string): MockProgress {
  return {
    userId: USER_ID,
    nodeId,
    status: RoadmapNodeStatus.COMPLETED,
    completedAt: new Date('2026-08-20T12:00:00.000Z'),
    studyConfirmedAt: new Date('2026-08-20T11:00:00.000Z'),
    quizPassedAt: new Date('2026-08-20T11:30:00.000Z'),
  };
}

/** Cumpre os dois portões (estudo + quiz) de um nó antes de tentar concluí-lo. */
async function liberarConclusao(
  service: RoadmapService,
  nodeId: string,
): Promise<void> {
  await service.confirmStudy(USER_ID, nodeId);
  const temQuiz =
    (NODES.find((n) => n.id === nodeId)?.quizQuestions ?? []).length > 0;
  if (temQuiz) {
    await service.gradeQuiz(USER_ID, nodeId, {
      [`${nodeId}-q1`]: `${nodeId}-ok`,
    });
  }
}

function statusOf(
  nodes: Array<{ id: string; status: RoadmapNodeStatus }>,
  id: string,
) {
  return nodes.find((n) => n.id === id)?.status;
}

describe('RoadmapService — usuário sem carreira', () => {
  it('devolve career null e lista vazia, não erro', async () => {
    const { service } = buildService(null);
    await expect(service.listForUser(USER_ID)).resolves.toEqual({
      career: null,
      nodes: [],
    });
  });

  it('rejeita avançar etapa com 409', async () => {
    const { service } = buildService(null);
    await expect(
      service.updateStatus(USER_ID, 'fe-html', 'IN_PROGRESS'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('RoadmapService — grafo filtrado pela carreira', () => {
  it('devolve só os nós da carreira do usuário', async () => {
    const { service } = buildService(FRONTEND.id);
    const roadmap = await service.listForUser(USER_ID);

    expect(roadmap.career).toEqual(FRONTEND);
    expect(roadmap.nodes.map((n) => n.id)).toEqual([
      'fe-html',
      'fe-js',
      'fe-react',
      'fe-portfolio',
    ]);
  });

  it('nó de outra carreira é 404, não atualização silenciosa', async () => {
    const { service, rows } = buildService(FRONTEND.id);
    await expect(
      service.updateStatus(USER_ID, 'be-node', 'IN_PROGRESS'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(rows).toHaveLength(0);
  });

  it('o mesmo usuário em outra carreira vê outro grafo', async () => {
    const { service } = buildService(BACKEND.id);
    const roadmap = await service.listForUser(USER_ID);
    expect(roadmap.nodes.map((n) => n.id)).toEqual(['be-node']);
  });
});

describe('RoadmapService — pré-requisitos N:N', () => {
  it('nó sem pré-requisito nasce AVAILABLE e o resto LOCKED', async () => {
    const { service } = buildService(FRONTEND.id);
    const { nodes } = await service.listForUser(USER_ID);

    expect(statusOf(nodes, 'fe-html')).toBe(RoadmapNodeStatus.AVAILABLE);
    expect(statusOf(nodes, 'fe-js')).toBe(RoadmapNodeStatus.LOCKED);
    expect(statusOf(nodes, 'fe-portfolio')).toBe(RoadmapNodeStatus.LOCKED);
  });

  it('nó de dois pré-requisitos continua LOCKED com só um concluído', async () => {
    const { service } = buildService(FRONTEND.id, [done('fe-html')]);
    const { nodes } = await service.listForUser(USER_ID);

    expect(statusOf(nodes, 'fe-js')).toBe(RoadmapNodeStatus.AVAILABLE);
    expect(statusOf(nodes, 'fe-portfolio')).toBe(RoadmapNodeStatus.LOCKED);
  });

  it('abre quando TODOS os pré-requisitos estão concluídos', async () => {
    const { service } = buildService(FRONTEND.id, [
      done('fe-html'),
      done('fe-react'),
    ]);
    const { nodes } = await service.listForUser(USER_ID);

    expect(statusOf(nodes, 'fe-portfolio')).toBe(RoadmapNodeStatus.AVAILABLE);
  });

  it('avançar em nó bloqueado continua 403', async () => {
    const { service } = buildService(FRONTEND.id);
    await expect(
      service.updateStatus(USER_ID, 'fe-portfolio', 'COMPLETED'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('concluir nó concede XP e destrava o seguinte', async () => {
    const { service, xp } = buildService(FRONTEND.id);
    await liberarConclusao(service, 'fe-html');
    const { nodes } = await service.updateStatus(
      USER_ID,
      'fe-html',
      'COMPLETED',
    );

    expect(xp.award).toHaveBeenCalledWith(USER_ID, 50);
    expect(statusOf(nodes, 'fe-html')).toBe(RoadmapNodeStatus.COMPLETED);
    expect(statusOf(nodes, 'fe-js')).toBe(RoadmapNodeStatus.AVAILABLE);
  });

  it('concluir duas vezes é 409', async () => {
    const { service } = buildService(FRONTEND.id, [done('fe-html')]);
    await expect(
      service.updateStatus(USER_ID, 'fe-html', 'COMPLETED'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('RoadmapService — portões de conclusão (estudo + quiz)', () => {
  it('não conclui sem confirmar estudo', async () => {
    const { service, xp } = buildService(FRONTEND.id);
    await expect(
      service.updateStatus(USER_ID, 'fe-html', 'COMPLETED'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(xp.award).not.toHaveBeenCalled();
  });

  it('não conclui com estudo confirmado mas quiz não aprovado', async () => {
    const { service, xp } = buildService(FRONTEND.id);
    await service.confirmStudy(USER_ID, 'fe-html');

    await expect(
      service.updateStatus(USER_ID, 'fe-html', 'COMPLETED'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(xp.award).not.toHaveBeenCalled();
  });

  it('conclui quando os dois portões estão cumpridos', async () => {
    const { service, xp } = buildService(FRONTEND.id);
    await liberarConclusao(service, 'fe-html');

    const { nodes } = await service.updateStatus(
      USER_ID,
      'fe-html',
      'COMPLETED',
    );
    expect(statusOf(nodes, 'fe-html')).toBe(RoadmapNodeStatus.COMPLETED);
    expect(xp.award).toHaveBeenCalledWith(USER_ID, 50);
  });

  it('nó sem quiz cadastrado exige só a confirmação de estudo', async () => {
    // Sem esta exceção, um nó sem perguntas seria impossível de concluir: não há
    // como ser aprovado num quiz que não existe.
    const { service } = buildService(FRONTEND.id, [
      done('fe-html'),
      done('fe-js'),
    ]);
    await service.confirmStudy(USER_ID, 'fe-react');

    const { nodes } = await service.updateStatus(
      USER_ID,
      'fe-react',
      'COMPLETED',
    );
    expect(statusOf(nodes, 'fe-react')).toBe(RoadmapNodeStatus.COMPLETED);
  });

  it('confirmar estudo não conclui a etapa sozinho', async () => {
    const { service, xp } = buildService(FRONTEND.id);
    const { nodes } = await service.confirmStudy(USER_ID, 'fe-html');

    const node = nodes.find((n) => n.id === 'fe-html');
    expect(node?.studyConfirmed).toBe(true);
    expect(node?.status).not.toBe(RoadmapNodeStatus.COMPLETED);
    expect(xp.award).not.toHaveBeenCalled();
  });
});

describe('RoadmapService — correção do quiz no servidor', () => {
  it('a alternativa correta nunca sai na listagem', async () => {
    const { service } = buildService(FRONTEND.id);
    const { nodes } = await service.listForUser(USER_ID);

    const opcoes = nodes.find((n) => n.id === 'fe-html')!.quiz[0].options;
    expect(opcoes).toHaveLength(2);
    for (const opcao of opcoes) {
      expect(Object.keys(opcao).sort()).toEqual(['id', 'text']);
    }
  });

  it('resposta certa aprova e grava', async () => {
    const { service } = buildService(FRONTEND.id);
    const { passed, roadmap } = await service.gradeQuiz(USER_ID, 'fe-html', {
      'fe-html-q1': 'fe-html-ok',
    });

    expect(passed).toBe(true);
    expect(roadmap.nodes.find((n) => n.id === 'fe-html')?.quizPassed).toBe(
      true,
    );
  });

  it('resposta errada reprova e não grava', async () => {
    const { service } = buildService(FRONTEND.id);
    const { passed, roadmap } = await service.gradeQuiz(USER_ID, 'fe-html', {
      'fe-html-q1': 'fe-html-no',
    });

    expect(passed).toBe(false);
    expect(roadmap.nodes.find((n) => n.id === 'fe-html')?.quizPassed).toBe(
      false,
    );
  });

  it('resposta ausente reprova — não dá para passar deixando em branco', async () => {
    const { service } = buildService(FRONTEND.id);
    const { passed } = await service.gradeQuiz(USER_ID, 'fe-html', {});
    expect(passed).toBe(false);
  });

  it('nó sem quiz responde 409 em vez de aprovar em branco', async () => {
    const { service } = buildService(FRONTEND.id, [
      done('fe-html'),
      done('fe-js'),
    ]);
    await expect(
      service.gradeQuiz(USER_ID, 'fe-react', {}),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('RoadmapService — certificação por categoria', () => {
  // `fe-html` e `fe-js` são CORE junto com `fe-react` e `fe-portfolio`: a categoria
  // só fecha quando os quatro estiverem concluídos.
  const CERT_CORE_FRONTEND = {
    id: 10,
    careerId: FRONTEND.id,
    category: 'CORE',
  };

  it('não concede enquanto faltar alguma etapa da categoria', async () => {
    const { service, earned } = buildService(FRONTEND.id, [], null, [
      CERT_CORE_FRONTEND,
    ]);

    await liberarConclusao(service, 'fe-html');
    await service.updateStatus(USER_ID, 'fe-html', 'COMPLETED');

    expect(earned).toHaveLength(0);
  });

  it('concede ao concluir a última etapa da categoria', async () => {
    const { service, earned } = buildService(
      FRONTEND.id,
      [done('fe-html'), done('fe-js'), done('fe-react')],
      null,
      [CERT_CORE_FRONTEND],
    );

    await service.confirmStudy(USER_ID, 'fe-portfolio');
    await service.updateStatus(USER_ID, 'fe-portfolio', 'COMPLETED');

    expect(earned).toHaveLength(1);
    expect(earned[0]).toMatchObject({
      userId: USER_ID,
      certificationId: CERT_CORE_FRONTEND.id,
    });
    expect(earned[0].earnedAt).toBeInstanceOf(Date);
  });

  /** Carreira sem certificação cadastrada não pode quebrar a conclusão da etapa. */
  it('sem certificação para a categoria, apenas não concede nada', async () => {
    const { service, earned } = buildService(FRONTEND.id, [
      done('fe-html'),
      done('fe-js'),
      done('fe-react'),
    ]);

    await service.confirmStudy(USER_ID, 'fe-portfolio');
    const { nodes } = await service.updateStatus(
      USER_ID,
      'fe-portfolio',
      'COMPLETED',
    );

    expect(statusOf(nodes, 'fe-portfolio')).toBe(RoadmapNodeStatus.COMPLETED);
    expect(earned).toHaveLength(0);
  });

  it('a certificação é de outra carreira: não conta', async () => {
    const { service, earned } = buildService(
      FRONTEND.id,
      [done('fe-html'), done('fe-js'), done('fe-react')],
      null,
      [{ id: 20, careerId: BACKEND.id, category: 'CORE' }],
    );

    await service.confirmStudy(USER_ID, 'fe-portfolio');
    await service.updateStatus(USER_ID, 'fe-portfolio', 'COMPLETED');

    expect(earned).toHaveLength(0);
  });
});

describe('RoadmapService — nível declarado libera etapas iniciais', () => {
  it('sem nível informado, só o primeiro nó abre', async () => {
    const { service } = buildService(FRONTEND.id);
    const { nodes } = await service.listForUser(USER_ID);

    expect(statusOf(nodes, 'fe-js')).toBe(RoadmapNodeStatus.LOCKED);
  });

  it('EXPERIENTE libera as duas primeiras etapas', async () => {
    const { service } = buildService(
      FRONTEND.id,
      [],
      OnboardingLevel.EXPERIENTE,
    );
    const { nodes } = await service.listForUser(USER_ID);

    expect(statusOf(nodes, 'fe-html')).toBe(RoadmapNodeStatus.AVAILABLE);
    expect(statusOf(nodes, 'fe-js')).toBe(RoadmapNodeStatus.AVAILABLE);
    // A terceira continua dependendo dos pré-requisitos.
    expect(statusOf(nodes, 'fe-react')).toBe(RoadmapNodeStatus.LOCKED);
  });

  /**
   * A regra que a decisão de produto define: nível é autodeclaração e por isso
   * DESBLOQUEIA, mas nunca marca como concluído nem concede XP — senão bastaria dizer
   * "sou sênior" para ganhar centenas de XP sem estudar.
   */
  it('liberar por nível não marca como concluído nem dá XP', async () => {
    const { service, xp, rows } = buildService(
      FRONTEND.id,
      [],
      OnboardingLevel.SENIOR,
    );
    const { nodes } = await service.listForUser(USER_ID);

    expect(nodes.every((n) => n.status !== RoadmapNodeStatus.COMPLETED)).toBe(
      true,
    );
    expect(xp.award).not.toHaveBeenCalled();
    expect(rows).toHaveLength(0);
  });
});
