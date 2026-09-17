import { PrismaService } from '../../prisma/prisma.service';
import { AdminReportsService } from './admin-reports.service';

/** Fixado para que "mês atual" não dependa de quando a suíte roda. */
const NOW = new Date('2026-09-16T12:00:00.000Z');

interface Cenario {
  users?: number;
  cohortUsersByMonth?: Record<string, number[]>;
  sessionsByMonth?: Record<string, number[]>;
  activeSubs?: number;
  funnelCounts?: number[];
}

function buildService(cenario: Cenario = {}) {
  const funnel = [...(cenario.funnelCounts ?? [])];

  const prisma = {
    user: {
      count: jest.fn(() =>
        Promise.resolve(
          funnel.length ? (funnel.shift() ?? 0) : (cenario.users ?? 0),
        ),
      ),
      // `cohorts` filtra por mês de cadastro; `recentActivity` chama sem `where`.
      findMany: jest.fn(
        ({ where }: { where?: { createdAt: { gte: Date } } } = {}) => {
          if (!where) return Promise.resolve([]);
          const mes = where.createdAt.gte.toISOString().slice(0, 7);
          const ids = cenario.cohortUsersByMonth?.[mes] ?? [];
          return Promise.resolve(ids.map((id) => ({ id })));
        },
      ),
    },
    career: { count: jest.fn(() => Promise.resolve(3)) },
    subscription: {
      count: jest.fn(() => Promise.resolve(cenario.activeSubs ?? 0)),
    },
    payment: {
      aggregate: jest.fn(() =>
        Promise.resolve({ _sum: { amountCents: 25000 } }),
      ),
    },
    post: { findMany: jest.fn(() => Promise.resolve([])) },
    userChallengeCompletion: { findMany: jest.fn(() => Promise.resolve([])) },
    studySession: {
      findMany: jest.fn(
        ({ where }: { where: { occurredOn: { gte: Date } } }) => {
          const mes = where.occurredOn.gte.toISOString().slice(0, 7);
          const ids = cenario.sessionsByMonth?.[mes] ?? [];
          return Promise.resolve(ids.map((userId) => ({ userId })));
        },
      ),
    },
    userRoadmapProgress: {
      count: jest.fn(() => Promise.resolve(4)),
      findMany: jest.fn(() => Promise.resolve([])),
    },
    contentItem: {
      aggregate: jest.fn(() => Promise.resolve({ _avg: { rating: null } })),
    },
  };

  return {
    service: new AdminReportsService(prisma as unknown as PrismaService),
    prisma,
  };
}

beforeAll(() => {
  jest.useFakeTimers({ doNotFake: ['nextTick'] }).setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('AdminReportsService.dashboard — taxa de conversão', () => {
  it('converte assinantes ativos em porcentagem com uma casa decimal', async () => {
    const { service } = buildService({ users: 300, activeSubs: 7 });

    const painel = await service.dashboard();

    // 7/300 = 2,333...% → arredondado para 2,3
    expect(painel.conversionRate).toBe(2.3);
  });

  /** Divisão por zero apareceria como NaN no painel do admin. */
  it('base vazia devolve 0, não NaN', async () => {
    const { service } = buildService({ users: 0, activeSubs: 0 });
    expect((await service.dashboard()).conversionRate).toBe(0);
  });
});

describe('AdminReportsService.funnel', () => {
  it('percentuais são relativos ao topo do funil', async () => {
    const { service } = buildService({ funnelCounts: [200, 150, 40, 10] });

    const etapas = await service.funnel(new Date('2026-09-01'), NOW);

    expect(etapas.map((e) => [e.label, e.value, e.percent])).toEqual([
      ['Cadastros', 200, 100],
      ['Ativações', 150, 75],
      ['Assinantes', 40, 20],
      ['Premium', 10, 5],
    ]);
  });

  it('sem cadastros no período, tudo zera sem divisão por zero', async () => {
    const { service } = buildService({ funnelCounts: [0, 0, 0, 0] });

    const etapas = await service.funnel(new Date('2026-09-01'), NOW);

    expect(etapas.every((e) => e.value === 0)).toBe(true);
    expect(etapas[1].percent).toBe(0);
  });
});

describe('AdminReportsService.cohorts — retenção', () => {
  it('mês sem nenhum cadastro vira linha de nulos, não de zeros', async () => {
    const { service } = buildService({ cohortUsersByMonth: {} });

    const linhas = await service.cohorts(3);

    // Zero significaria "ninguém voltou"; nulo é "não havia ninguém para voltar".
    expect(linhas).toHaveLength(3);
    expect(linhas[0].values).toEqual([null, null, null]);
  });

  it('calcula o % do grupo que voltou a estudar em cada mês seguinte', async () => {
    const { service } = buildService({
      cohortUsersByMonth: { '2026-07': [1, 2, 3, 4] },
      sessionsByMonth: {
        '2026-07': [1, 2, 3, 4],
        '2026-08': [1, 2],
        '2026-09': [1],
      },
    });

    const linhas = await service.cohorts(3);
    const julho = linhas.find((l) => l.label === '2026-07')!;

    expect(julho.values).toEqual([100, 50, 25]);
  });

  it('meses futuros da coorte ficam nulos, não zerados', async () => {
    const { service } = buildService({
      cohortUsersByMonth: { '2026-09': [1, 2] },
      sessionsByMonth: { '2026-09': [1] },
    });

    const linhas = await service.cohorts(3);
    const setembro = linhas.find((l) => l.label === '2026-09')!;

    // Coorte do mês atual: só o primeiro mês existe; os dois seguintes ainda não chegaram.
    expect(setembro.values).toEqual([50, null, null]);
  });
});
