import { BadRequestException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { LogStudySessionDto } from './dto/log-study-session.dto';
import { ProgressService } from './progress.service';

/** Pinned so "today" is stable regardless of when the suite runs. */
const NOW = new Date('2026-08-19T12:00:00.000Z');

const USER_ID = 1;

interface MockSession {
  id: number;
  userId: number;
  topic: string;
  durationMinutes: number;
  subjectTag?: string;
  occurredOn: Date;
  xpEarned: number;
}

interface MockUser {
  id: number;
  xpTotal: number;
  level: number;
  streakCurrentDays: number;
  streakLongestDays: number;
  lastStudyDate: Date | null;
}

/** UTC day key N days before NOW — same criterion the service uses. */
function utcDay(daysAgo: number): string {
  return new Date(NOW.getTime() - daysAgo * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

function dayOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildService() {
  const sessions: MockSession[] = [];
  const users = new Map<number, MockUser>();
  let nextId = 1;

  const userOf = (id: number): MockUser => {
    let u = users.get(id);
    if (!u) {
      u = {
        id,
        xpTotal: 0,
        level: 1,
        streakCurrentDays: 0,
        streakLongestDays: 0,
        lastStudyDate: null,
      };
      users.set(id, u);
    }
    return u;
  };

  const prisma = {
    studySession: {
      create: jest.fn(({ data }: { data: Omit<MockSession, 'id'> }) => {
        const created = { id: nextId++, ...data };
        sessions.push(created);
        return Promise.resolve(created);
      }),
      aggregate: jest.fn(
        ({ where }: { where: { userId: number; occurredOn: Date } }) => {
          const total = sessions
            .filter(
              (s) =>
                s.userId === where.userId &&
                dayOf(s.occurredOn) === dayOf(where.occurredOn),
            )
            .reduce((sum, s) => sum + s.durationMinutes, 0);
          // Prisma returns null, not 0, when nothing matches.
          return Promise.resolve({
            _sum: { durationMinutes: total === 0 ? null : total },
          });
        },
      ),
    },
    user: {
      findUniqueOrThrow: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve({ ...userOf(where.id) }),
      ),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: number };
          data: Partial<MockUser>;
        }) => {
          const u = Object.assign(userOf(where.id), data);
          return Promise.resolve({ ...u });
        },
      ),
    },
  };

  const xp = { award: jest.fn(() => Promise.resolve()) };
  const service = new ProgressService(
    prisma as unknown as PrismaService,
    xp as unknown as XpService,
  );

  return { service, sessions, xp, user: () => userOf(USER_ID) };
}

function dto(over: Partial<LogStudySessionDto> = {}): LogStudySessionDto {
  return {
    topic: 'Estudo',
    durationMinutes: 60,
    ...over,
  };
}

function totalMinutes(sessions: MockSession[]): number {
  return sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
}

beforeAll(() => {
  jest.useFakeTimers({ doNotFake: ['nextTick'] }).setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('ProgressService.logSession — teto diário de 720 min', () => {
  it('aceita uma sessão normal de hoje', async () => {
    const { service, sessions, xp } = buildService();
    const created = await service.logSession(
      USER_ID,
      dto({ durationMinutes: 90 }),
    );

    expect(created.durationMinutes).toBe(90);
    expect(created.xpEarned).toBe(90);
    expect(sessions).toHaveLength(1);
    expect(xp.award).toHaveBeenCalledWith(USER_ID, 90);
  });

  it('aceita exatamente 720 min no dia (borda)', async () => {
    const { service, sessions } = buildService();
    await service.logSession(USER_ID, dto({ durationMinutes: 600 }));
    await service.logSession(USER_ID, dto({ durationMinutes: 120 }));

    expect(sessions).toHaveLength(2);
    expect(totalMinutes(sessions)).toBe(720);
  });

  it('rejeita o minuto 721 no dia (borda)', async () => {
    const { service, sessions, xp } = buildService();
    await service.logSession(USER_ID, dto({ durationMinutes: 600 }));
    await service.logSession(USER_ID, dto({ durationMinutes: 120 }));

    await expect(
      service.logSession(USER_ID, dto({ durationMinutes: 1 })),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(sessions).toHaveLength(2);
    expect(xp.award).toHaveBeenCalledTimes(2);
  });

  it('erro traz o teto e o total já registrado, em português', async () => {
    const { service } = buildService();
    await service.logSession(USER_ID, dto({ durationMinutes: 600 }));
    await service.logSession(USER_ID, dto({ durationMinutes: 120 }));

    await expect(
      service.logSession(USER_ID, dto({ durationMinutes: 30 })),
    ).rejects.toThrow(
      'Limite de 720 minutos de estudo por dia atingido. Já registrados 720 min neste dia.',
    );
  });

  it('ataque: 20 sessões de 600 min em sequência param no teto', async () => {
    const { service, sessions, user } = buildService();
    let aceitas = 0;
    let rejeitadas = 0;

    for (let i = 0; i < 20; i++) {
      try {
        await service.logSession(USER_ID, dto({ durationMinutes: 600 }));
        aceitas++;
      } catch {
        rejeitadas++;
      }
    }

    expect(aceitas).toBe(1);
    expect(rejeitadas).toBe(19);
    expect(totalMinutes(sessions)).toBe(600);
    expect(user().streakCurrentDays).toBe(1);
  });

  it('o teto é por dia — outro dia tem orçamento próprio', async () => {
    const { service, sessions } = buildService();
    await service.logSession(
      USER_ID,
      dto({ durationMinutes: 600, occurredOn: utcDay(1) }),
    );
    await service.logSession(
      USER_ID,
      dto({ durationMinutes: 600, occurredOn: utcDay(0) }),
    );

    expect(sessions).toHaveLength(2);
  });

  it('o teto é por usuário — outro usuário não consome o orçamento', async () => {
    const { service, sessions } = buildService();
    await service.logSession(USER_ID, dto({ durationMinutes: 600 }));
    await service.logSession(2, dto({ durationMinutes: 600 }));

    expect(sessions).toHaveLength(2);
  });
});

describe('ProgressService.logSession — janela de datas', () => {
  it('aceita sessão de hoje', async () => {
    const { service } = buildService();
    await expect(
      service.logSession(USER_ID, dto({ occurredOn: utcDay(0) })),
    ).resolves.toBeDefined();
  });

  it('aceita sessão de ontem', async () => {
    const { service } = buildService();
    await expect(
      service.logSession(USER_ID, dto({ occurredOn: utcDay(1) })),
    ).resolves.toBeDefined();
  });

  it('aceita exatamente 3 dias atrás (borda)', async () => {
    const { service } = buildService();
    await expect(
      service.logSession(USER_ID, dto({ occurredOn: utcDay(3) })),
    ).resolves.toBeDefined();
  });

  it('rejeita 4 dias atrás (borda)', async () => {
    const { service, sessions } = buildService();
    await expect(
      service.logSession(USER_ID, dto({ occurredOn: utcDay(4) })),
    ).rejects.toThrow('Data da sessão não pode ser anterior a 3 dias.');
    expect(sessions).toHaveLength(0);
  });

  it('rejeita amanhã (borda do futuro)', async () => {
    const { service, sessions, xp } = buildService();
    await expect(
      service.logSession(USER_ID, dto({ occurredOn: utcDay(-1) })),
    ).rejects.toThrow('Data da sessão não pode estar no futuro.');
    expect(sessions).toHaveLength(0);
    expect(xp.award).not.toHaveBeenCalled();
  });

  it('ataque: data de 2030 é rejeitada e não move lastStudyDate', async () => {
    const { service, sessions, user } = buildService();
    await expect(
      service.logSession(USER_ID, dto({ occurredOn: '2030-01-01' })),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(sessions).toHaveLength(0);
    expect(user().lastStudyDate).toBeNull();
    expect(user().streakCurrentDays).toBe(0);
  });

  it('ataque: streak fabricado com datas antigas para na janela de 3 dias', async () => {
    const { service, user } = buildService();
    let aceitas = 0;

    // Uma sessão por dia, de 30 dias atrás até hoje.
    for (let d = 30; d >= 0; d--) {
      try {
        await service.logSession(
          USER_ID,
          dto({ durationMinutes: 10, occurredOn: utcDay(d) }),
        );
        aceitas++;
      } catch {
        /* fora da janela de retroatividade */
      }
    }

    expect(aceitas).toBe(4); // d = 3, 2, 1, 0
    expect(user().streakLongestDays).toBe(4);
  });

  it('sem occurredOn, usa hoje e passa', async () => {
    const { service, sessions } = buildService();
    await service.logSession(USER_ID, dto());
    expect(dayOf(sessions[0].occurredOn)).toBe(utcDay(0));
  });
});

describe('LogStudySessionDto — validação de occurredOn', () => {
  function erros(occurredOn?: string) {
    const instance = plainToInstance(LogStudySessionDto, {
      topic: 'Estudo',
      durationMinutes: 60,
      ...(occurredOn === undefined ? {} : { occurredOn }),
    });
    return validate(instance);
  }

  it('aceita hoje', async () => {
    expect(await erros(utcDay(0))).toHaveLength(0);
  });

  it('aceita exatamente 3 dias atrás (borda)', async () => {
    expect(await erros(utcDay(3))).toHaveLength(0);
  });

  it('rejeita 4 dias atrás (borda)', async () => {
    const [erro] = await erros(utcDay(4));
    expect(erro.constraints?.isRecentPastDate).toBe(
      'Data da sessão deve estar entre hoje e 3 dias atrás.',
    );
  });

  it('rejeita amanhã', async () => {
    expect(await erros(utcDay(-1))).toHaveLength(1);
  });

  it('rejeita 2030', async () => {
    expect(await erros('2030-01-01')).toHaveLength(1);
  });

  it('aceita ausência do campo (é opcional)', async () => {
    expect(await erros()).toHaveLength(0);
  });
});
