import { BadRequestException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { addDays, dayKeyOf, toDateColumn } from '../common/time/calendar';
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

/** Dia de São Paulo N dias antes do "agora" fixado — o mesmo critério do service. */
function utcDay(daysAgo: number): string {
  return addDays(dayKeyOf(new Date()), -daysAgo);
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
        ({
          where,
        }: {
          where: { userId: number; occurredOn: Date | { gte: Date } };
        }) => {
          const total = sessions
            .filter(
              (s) =>
                s.userId === where.userId &&
                (where.occurredOn instanceof Date
                  ? dayOf(s.occurredOn) === dayOf(where.occurredOn)
                  : s.occurredOn >= where.occurredOn.gte),
            )
            .reduce((sum, s) => sum + s.durationMinutes, 0);
          // Prisma returns null, not 0, when nothing matches.
          return Promise.resolve({
            _sum: { durationMinutes: total === 0 ? null : total },
          });
        },
      ),
      // `distinct: ['occurredOn']` — um registro por dia estudado.
      findMany: jest.fn(({ where }: { where: { userId: number } }) => {
        const days = new Map<string, Date>();
        for (const s of sessions.filter((x) => x.userId === where.userId))
          days.set(dayOf(s.occurredOn), s.occurredOn);
        return Promise.resolve(
          [...days.values()].map((occurredOn) => ({ occurredOn })),
        );
      }),
      groupBy: jest.fn(
        ({
          where,
        }: {
          where: { userId: number; occurredOn: { gte: Date } };
        }) => {
          const counts = new Map<string, number>();
          for (const s of sessions) {
            if (
              s.userId !== where.userId ||
              s.occurredOn < where.occurredOn.gte
            )
              continue;
            counts.set(
              dayOf(s.occurredOn),
              (counts.get(dayOf(s.occurredOn)) ?? 0) + 1,
            );
          }
          return Promise.resolve(
            [...counts].map(([day, n]) => ({
              occurredOn: toDateColumn(day),
              _count: { _all: n },
            })),
          );
        },
      ),
    },
    userSkillProgress: {
      findMany: jest.fn(() => Promise.resolve([])),
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

describe('ProgressService — dia no calendário de São Paulo', () => {
  afterEach(() => {
    jest.setSystemTime(NOW);
  });

  it('sessão registrada às 22h30 conta para o dia de hoje, não para amanhã', async () => {
    // 2026-08-19T01:30Z = 18/08 às 22h30 em São Paulo
    jest.setSystemTime(new Date('2026-08-19T01:30:00.000Z'));
    const { service, sessions } = buildService();

    await service.logSession(USER_ID, dto());

    expect(dayOf(sessions[0].occurredOn)).toBe('2026-08-18');
  });

  it('às 22h30, a data mais antiga oferecida pelo front (3 dias) é aceita', async () => {
    jest.setSystemTime(new Date('2026-08-19T01:30:00.000Z'));
    const { service } = buildService();

    await expect(
      service.logSession(USER_ID, dto({ occurredOn: '2026-08-15' })),
    ).resolves.toBeDefined();
  });

  it('às 22h30, o DTO também aceita a data de 3 dias atrás', async () => {
    jest.setSystemTime(new Date('2026-08-19T01:30:00.000Z'));
    const instance = plainToInstance(LogStudySessionDto, {
      topic: 'Estudo',
      durationMinutes: 60,
      occurredOn: '2026-08-15',
    });
    expect(await validate(instance)).toHaveLength(0);
  });
});

describe('ProgressService — sequência', () => {
  it('sessão retroativa registrada depois da de hoje não quebra a sequência', async () => {
    const { service, user } = buildService();
    await service.logSession(USER_ID, dto({ occurredOn: utcDay(0) }));
    await service.logSession(USER_ID, dto({ occurredOn: utcDay(1) }));

    expect(user().streakCurrentDays).toBe(2);
    expect(dayOf(user().lastStudyDate!)).toBe(utcDay(0));
  });

  it('o recorde guardado nunca diminui', async () => {
    const { service, user } = buildService();
    user().streakLongestDays = 12;

    await service.logSession(USER_ID, dto());

    expect(user().streakCurrentDays).toBe(1);
    expect(user().streakLongestDays).toBe(12);
  });

  it('resumo mostra 0 quando o último estudo foi anteontem', async () => {
    const { service, user } = buildService();
    Object.assign(user(), {
      streakCurrentDays: 5,
      lastStudyDate: toDateColumn(utcDay(2)),
    });

    const summary = await service.summary(USER_ID);

    expect(summary.streakCurrentDays).toBe(0);
  });

  it('resumo mantém a sequência quando o último estudo foi ontem', async () => {
    const { service, user } = buildService();
    Object.assign(user(), {
      streakCurrentDays: 5,
      lastStudyDate: toDateColumn(utcDay(1)),
    });

    expect((await service.summary(USER_ID)).streakCurrentDays).toBe(5);
  });
});

describe('ProgressService.summary — semana e mês', () => {
  afterEach(() => {
    jest.setSystemTime(NOW);
  });

  it('minutos do mês ignoram o mês anterior', async () => {
    // 02/09 em São Paulo: dias 30 e 31/08 ainda estão na janela de 3 dias.
    jest.setSystemTime(new Date('2026-09-02T15:00:00.000Z'));
    const { service } = buildService();
    await service.logSession(
      USER_ID,
      dto({ durationMinutes: 100, occurredOn: '2026-08-31' }),
    );
    await service.logSession(
      USER_ID,
      dto({ durationMinutes: 40, occurredOn: '2026-09-01' }),
    );
    await service.logSession(
      USER_ID,
      dto({ durationMinutes: 20, occurredOn: '2026-09-02' }),
    );

    expect((await service.summary(USER_ID)).minutesThisMonth).toBe(60);
  });

  it('sessões por dia da semana contam só a semana atual, a partir de segunda', async () => {
    // Quarta, 16/09. A semana começa na segunda, 14/09.
    jest.setSystemTime(new Date('2026-09-16T15:00:00.000Z'));
    const { service } = buildService();
    await service.logSession(USER_ID, dto({ occurredOn: '2026-09-13' })); // domingo anterior
    await service.logSession(USER_ID, dto({ occurredOn: '2026-09-14' })); // segunda
    await service.logSession(USER_ID, dto({ occurredOn: '2026-09-16' })); // quarta
    await service.logSession(USER_ID, dto({ occurredOn: '2026-09-16' }));

    const summary = await service.summary(USER_ID);

    expect(summary.sessionsByWeekday).toEqual([0, 1, 0, 2, 0, 0, 0]);
    expect(summary.sessionsThisWeek).toBe(3);
  });
});
