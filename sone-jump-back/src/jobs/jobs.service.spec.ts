import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from './jobs.service';

const USER_ID = 1;

interface MockJob {
  id: number;
  title: string;
  skills: string[];
  remoteType: string;
}

function buildService(
  jobs: MockJob[] = [],
  skillPct: Record<string, number> = {},
) {
  const applications: { jobId: number; userId: number }[] = [];

  const prisma = {
    job: {
      findMany: jest.fn(({ where }: { where: { remoteType?: string } }) =>
        Promise.resolve(
          jobs
            .filter(
              (j) => !where.remoteType || j.remoteType === where.remoteType,
            )
            .map((j) => ({
              ...j,
              companyName: 'ACME',
              companyLogoUrl: null,
              location: 'SP',
              salaryMin: null,
              salaryMax: null,
              description: '',
              partner: null,
              skills: j.skills.map((name) => ({ skill: { name } })),
            })),
        ),
      ),
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(jobs.find((j) => j.id === where.id) ?? null),
      ),
    },
    userSkillProgress: {
      findMany: jest.fn(() =>
        Promise.resolve(
          Object.entries(skillPct).map(([name, pct]) => ({
            skill: { name },
            pct,
          })),
        ),
      ),
    },
    jobApplication: {
      findUnique: jest.fn(
        ({
          where,
        }: {
          where: { jobId_userId: { jobId: number; userId: number } };
        }) =>
          Promise.resolve(
            applications.find(
              (a) =>
                a.jobId === where.jobId_userId.jobId &&
                a.userId === where.jobId_userId.userId,
            ) ?? null,
          ),
      ),
      create: jest.fn(
        ({ data }: { data: { jobId: number; userId: number } }) => {
          applications.push(data);
          return Promise.resolve(data);
        },
      ),
    },
  };

  return {
    service: new JobsService(prisma as unknown as PrismaService),
    applications,
    prisma,
  };
}

function job(id: number, skills: string[], remoteType = 'REMOTO'): MockJob {
  return { id, title: `Vaga ${id}`, skills, remoteType };
}

describe('JobsService.list — cálculo de match', () => {
  it('match é a média do domínio do candidato nas skills exigidas', async () => {
    const { service } = buildService([job(1, ['React', 'SQL'])], {
      React: 80,
      SQL: 40,
    });

    const [vaga] = await service.list(USER_ID, {});

    expect(vaga.match).toBe(60);
  });

  it('skill exigida que o candidato não tem conta como zero', async () => {
    const { service } = buildService([job(1, ['React', 'Kubernetes'])], {
      React: 100,
    });
    expect((await service.list(USER_ID, {}))[0].match).toBe(50);
  });

  /** Sem skill declarada não existe match calculável — `null` é diferente de 0%. */
  it('vaga sem skills declaradas devolve match nulo, não zero', async () => {
    const { service } = buildService([job(1, [])], { React: 100 });
    expect((await service.list(USER_ID, {}))[0].match).toBeNull();
  });

  it('candidato sem progresso nenhum tem match 0', async () => {
    const { service } = buildService([job(1, ['React'])], {});
    expect((await service.list(USER_ID, {}))[0].match).toBe(0);
  });

  it('filtro de modelo de trabalho é repassado para a consulta', async () => {
    const { service } = buildService([
      job(1, ['React'], 'REMOTO'),
      job(2, ['SQL'], 'PRESENCIAL'),
    ]);

    const vagas = await service.list(USER_ID, { remoteType: 'PRESENCIAL' });

    expect(vagas.map((v) => v.id)).toEqual([2]);
  });
});

describe('JobsService.apply', () => {
  it('registra a candidatura', async () => {
    const { service, applications } = buildService([job(1, ['React'])]);

    await service.apply(USER_ID, 1);

    expect(applications).toEqual([{ jobId: 1, userId: USER_ID }]);
  });

  it('candidatar-se duas vezes é 409', async () => {
    const { service, applications } = buildService([job(1, ['React'])]);
    await service.apply(USER_ID, 1);

    await expect(service.apply(USER_ID, 1)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(applications).toHaveLength(1);
  });

  it('vaga inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.apply(USER_ID, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
