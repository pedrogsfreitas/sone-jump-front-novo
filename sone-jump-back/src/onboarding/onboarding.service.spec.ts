import {
  OnboardingArea,
  OnboardingGoal,
  OnboardingLevel,
  OnboardingWeeklyTime,
} from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingService } from './onboarding.service';

const USER_ID = 1;

function buildService() {
  const perfis = new Map<number, Record<string, unknown>>();

  const prisma = {
    career: {
      findUnique: jest.fn(({ where }: { where: { slug: string } }) =>
        Promise.resolve(where.slug === 'front-end' ? { id: 'c1' } : null),
      ),
    },
    onboardingProfile: {
      upsert: jest.fn(
        ({
          where,
          update,
          create,
        }: {
          where: { userId: number };
          update: Record<string, unknown>;
          create: Record<string, unknown>;
        }) => {
          const existente = perfis.get(where.userId);
          const row = existente ? { ...existente, ...update } : { ...create };
          perfis.set(where.userId, row);
          return Promise.resolve(row);
        },
      ),
      findUnique: jest.fn(({ where }: { where: { userId: number } }) =>
        Promise.resolve(perfis.get(where.userId) ?? null),
      ),
    },
  };

  return {
    service: new OnboardingService(prisma as unknown as PrismaService),
    perfis,
  };
}

const respostas = {
  goal: OnboardingGoal.PRIMEIRO_EMPREGO,
  area: OnboardingArea.FRONTEND,
  level: OnboardingLevel.INICIANTE,
  weeklyTime: OnboardingWeeklyTime.H5_8,
};

describe('OnboardingService.save', () => {
  it('guarda as respostas e resolve o id da carreira pelo slug', async () => {
    const { service } = buildService();

    const salvo = await service.save(USER_ID, {
      ...respostas,
      careerSlug: 'front-end',
    });

    expect(salvo).toMatchObject({
      goal: OnboardingGoal.PRIMEIRO_EMPREGO,
      careerId: 'c1',
    });
  });

  /** `userId` é a PK: refazer o questionário substitui, não acumula linha nova. */
  it('responder de novo sobrescreve o perfil anterior', async () => {
    const { service, perfis } = buildService();
    await service.save(USER_ID, { ...respostas, careerSlug: 'front-end' });

    const segundo = await service.save(USER_ID, {
      ...respostas,
      goal: OnboardingGoal.TRANSICAO,
      careerSlug: 'front-end',
    });

    expect(perfis.size).toBe(1);
    expect(segundo.goal).toBe(OnboardingGoal.TRANSICAO);
  });

  it('slug desconhecido não quebra o salvamento — fica sem carreira', async () => {
    const { service } = buildService();
    const salvo = await service.save(USER_ID, {
      ...respostas,
      careerSlug: 'nao-existe',
    });
    expect(salvo.careerId).toBeNull();
  });

  it('sem slug nenhum, também salva sem carreira', async () => {
    const { service } = buildService();
    expect((await service.save(USER_ID, respostas)).careerId).toBeNull();
  });
});

describe('OnboardingService.find', () => {
  it('devolve null para quem nunca respondeu', async () => {
    const { service } = buildService();
    expect(await service.find(USER_ID)).toBeNull();
  });

  it('devolve o perfil salvo', async () => {
    const { service } = buildService();
    await service.save(USER_ID, respostas);
    expect(await service.find(USER_ID)).toMatchObject({
      area: OnboardingArea.FRONTEND,
    });
  });
});
