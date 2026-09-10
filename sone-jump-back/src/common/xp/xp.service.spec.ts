import { PrismaService } from '../../prisma/prisma.service';
import { calculateLevel, XpService } from './xp.service';

const USER_ID = 1;

interface UpdateCall {
  where: { id: number };
  data: { xpTotal?: number | { increment: number }; level?: number };
  select?: unknown;
}

/**
 * O banco simulado aceita as duas formas de escrita que o Prisma permite:
 * `xpTotal: n` (o valor calculado fora e sobrescrito) e `xpTotal: { increment: n }`
 * (a soma feita pelo próprio banco). Suportar as duas é o que dá sentido ao teste de
 * concorrência: contra uma implementação que lê-soma-escreve ele acusa o total errado,
 * e não apenas um formato de argumento inesperado.
 *
 * A leitura devolve uma cópia do estado no instante da chamada — como faria um SELECT
 * concorrente —, então duas concessões em voo enxergam o mesmo total inicial.
 */
function buildService(initial: { xpTotal: number; level: number }) {
  const row = { ...initial };
  const calls: UpdateCall[] = [];

  const prisma = {
    user: {
      update: jest.fn((args: UpdateCall) => {
        calls.push(args);
        const { xpTotal, level } = args.data;
        if (typeof xpTotal === 'number') row.xpTotal = xpTotal;
        else if (xpTotal) row.xpTotal += xpTotal.increment;
        if (level !== undefined) row.level = level;
        return Promise.resolve({ xpTotal: row.xpTotal, level: row.level });
      }),
      findUniqueOrThrow: jest.fn(() => Promise.resolve({ ...row })),
    },
  };

  const service = new XpService(prisma as unknown as PrismaService);
  return { service, row, calls, raw: prisma };
}

describe('calculateLevel', () => {
  it('sobe um nível a cada 500 XP, começando no nível 1', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(499)).toBe(1);
    expect(calculateLevel(500)).toBe(2);
    expect(calculateLevel(1250)).toBe(3);
  });
});

describe('XpService.award', () => {
  it('não toca no banco quando a quantidade não é positiva', async () => {
    const { service, raw } = buildService({ xpTotal: 100, level: 1 });

    await service.award(USER_ID, 0);
    await service.award(USER_ID, -50);

    expect(raw.user.update).not.toHaveBeenCalled();
  });

  it('soma o XP com increment, e não lendo-somando-escrevendo', async () => {
    const { service, row, calls } = buildService({ xpTotal: 100, level: 1 });

    await service.award(USER_ID, 30);

    expect(row.xpTotal).toBe(130);
    expect(calls[0].data.xpTotal).toEqual({ increment: 30 });
  });

  it('não reescreve o nível quando ele não mudou', async () => {
    const { service, calls } = buildService({ xpTotal: 100, level: 1 });

    await service.award(USER_ID, 30);

    expect(calls).toHaveLength(1);
  });

  it('atualiza o nível quando o total cruza a faixa', async () => {
    const { service, row, calls } = buildService({ xpTotal: 480, level: 1 });

    await service.award(USER_ID, 40);

    expect(row.xpTotal).toBe(520);
    expect(row.level).toBe(2);
    expect(calls[1].data.level).toBe(2);
  });

  /**
   * É o caso que a implementação anterior perdia: duas concessões em voo ao mesmo
   * tempo (concluir uma etapa do roadmap e um desafio, por exemplo) liam os dois o
   * mesmo total e a segunda escrita sobrescrevia a primeira, sumindo com um dos
   * prêmios sem erro nenhum.
   */
  it('não perde XP quando duas concessões acontecem em paralelo', async () => {
    const { service, row } = buildService({ xpTotal: 0, level: 1 });

    await Promise.all([service.award(USER_ID, 50), service.award(USER_ID, 75)]);

    expect(row.xpTotal).toBe(125);
  });
});
