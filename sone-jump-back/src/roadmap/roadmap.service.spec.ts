import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RoadmapNodeStatus } from '../../generated/prisma/enums';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoadmapService } from './roadmap.service';

const USER_ID = 1;
const FRONTEND = {
  id: 'career-fe',
  slug: 'frontend-developer',
  title: 'Frontend Developer',
};
const BACKEND = {
  id: 'career-be',
  slug: 'backend-developer',
  title: 'Backend Developer',
};

interface MockNode {
  id: string;
  careerId: string;
  name: string;
  orderIndex: number;
  prerequisites: Array<{ prerequisiteNodeId: string }>;
}

interface MockProgress {
  userId: number;
  nodeId: string;
  status: RoadmapNodeStatus;
  completedAt: Date | null;
}

function node(
  id: string,
  careerId: string,
  orderIndex: number,
  prerequisites: string[] = [],
): MockNode {
  return {
    id,
    careerId,
    name: id,
    orderIndex,
    prerequisites: prerequisites.map((prerequisiteNodeId) => ({
      prerequisiteNodeId,
    })),
  };
}

/**
 * Dois roadmaps independentes, um por carreira — cada carreira tem as suas próprias
 * cópias de nó, que é o modelo adotado na Fase 8.
 */
const NODES: MockNode[] = [
  node('fe-html', FRONTEND.id, 0),
  node('fe-js', FRONTEND.id, 1, ['fe-html']),
  node('fe-react', FRONTEND.id, 2, ['fe-js']),
  // nó com DOIS pré-requisitos: só abre quando ambos estiverem concluídos
  node('fe-portfolio', FRONTEND.id, 3, ['fe-react', 'fe-html']),
  node('be-node', BACKEND.id, 0),
];

function buildService(careerId: string | null, progress: MockProgress[] = []) {
  const rows = [...progress];

  const prisma = {
    user: {
      findUnique: jest.fn(() =>
        Promise.resolve({
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
              category: 'CORE',
              estimatedHours: 10,
              description: n.name,
              resources: [],
            })),
        ),
      ),
    },
    userRoadmapProgress: {
      findMany: jest.fn(({ where }: { where: { userId: number } }) =>
        Promise.resolve(rows.filter((r) => r.userId === where.userId)),
      ),
      upsert: jest.fn(
        ({
          where,
          create,
        }: {
          where: { userId_nodeId: { userId: number; nodeId: string } };
          create: MockProgress;
        }) => {
          const existing = rows.find(
            (r) =>
              r.userId === where.userId_nodeId.userId &&
              r.nodeId === where.userId_nodeId.nodeId,
          );
          if (existing) Object.assign(existing, create);
          else rows.push(create);
          return Promise.resolve(create);
        },
      ),
    },
  };

  const xp = { award: jest.fn(() => Promise.resolve()) };
  const service = new RoadmapService(
    prisma as unknown as PrismaService,
    xp as unknown as XpService,
  );

  return { service, rows, xp };
}

function done(nodeId: string): MockProgress {
  return {
    userId: USER_ID,
    nodeId,
    status: RoadmapNodeStatus.COMPLETED,
    completedAt: new Date('2026-08-20T12:00:00.000Z'),
  };
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
