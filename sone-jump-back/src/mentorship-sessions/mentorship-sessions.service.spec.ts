import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MentorshipStatus } from '../../generated/prisma/enums';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { MentorshipSessionsService } from './mentorship-sessions.service';

const MENTOR = 10;
const MENTEE = 20;
const ESTRANHO = 30;

interface MockSession {
  id: number;
  mentorId: number;
  menteeId: number;
  status: MentorshipStatus;
  scheduledAt: Date;
  durationMinutes: number;
  topic: string;
  meetingUrl?: string | null;
}

function buildService(sessions: MockSession[] = []) {
  const rows = [...sessions];
  const mentores = new Map([[MENTOR, { userId: MENTOR, sessionsCount: 0 }]]);
  let nextId = rows.length + 1;

  const prisma = {
    mentor: {
      findUnique: jest.fn(({ where }: { where: { userId: number } }) =>
        Promise.resolve(mentores.get(where.userId) ?? null),
      ),
      update: jest.fn(({ where }: { where: { userId: number } }) => {
        const m = mentores.get(where.userId)!;
        m.sessionsCount += 1;
        return Promise.resolve(m);
      }),
    },
    mentorshipSession: {
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(rows.find((s) => s.id === where.id) ?? null),
      ),
      findUniqueOrThrow: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(rows.find((s) => s.id === where.id)!),
      ),
      create: jest.fn(
        ({ data }: { data: Omit<MockSession, 'id' | 'status'> }) => {
          const row = {
            id: nextId++,
            status: MentorshipStatus.SOLICITADA,
            ...data,
          };
          rows.push(row);
          return Promise.resolve(row);
        },
      ),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: number };
          data: Partial<MockSession>;
        }) => {
          const row = rows.find((s) => s.id === where.id)!;
          Object.assign(row, data);
          return Promise.resolve(row);
        },
      ),
    },
  };

  const xp = { award: jest.fn(() => Promise.resolve()) };
  const service = new MentorshipSessionsService(
    prisma as unknown as PrismaService,
    xp as unknown as XpService,
  );

  return { service, rows, xp, mentores };
}

function sessao(over: Partial<MockSession> = {}): MockSession {
  return {
    id: 1,
    mentorId: MENTOR,
    menteeId: MENTEE,
    status: MentorshipStatus.SOLICITADA,
    scheduledAt: new Date('2026-10-01T14:00:00.000Z'),
    durationMinutes: 60,
    topic: 'Revisão de código',
    meetingUrl: null,
    ...over,
  };
}

describe('MentorshipSessionsService.request', () => {
  it('cria a solicitação com 60 min por padrão', async () => {
    const { service } = buildService();

    const criada = await service.request(MENTEE, {
      mentorId: MENTOR,
      scheduledAt: '2026-10-01T14:00:00.000Z',
      topic: 'Revisão de código',
    });

    expect(criada.durationMinutes).toBe(60);
    expect(criada.status).toBe(MentorshipStatus.SOLICITADA);
  });

  it('mentor inexistente é 404', async () => {
    const { service } = buildService();
    await expect(
      service.request(MENTEE, {
        mentorId: 999,
        scheduledAt: '2026-10-01T14:00:00.000Z',
        topic: 'x',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('não dá para marcar mentoria consigo mesmo', async () => {
    const { service, rows } = buildService();

    await expect(
      service.request(MENTOR, {
        mentorId: MENTOR,
        scheduledAt: '2026-10-01T14:00:00.000Z',
        topic: 'x',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(rows).toHaveLength(0);
  });
});

describe('MentorshipSessionsService — fluxo de status', () => {
  it('só o mentor da sessão confirma', async () => {
    const { service } = buildService([sessao()]);
    await expect(service.confirm(ESTRANHO, 1, {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('confirmar guarda o link da reunião', async () => {
    const { service } = buildService([sessao()]);

    const confirmada = await service.confirm(MENTOR, 1, {
      meetingUrl: 'https://meet.example/abc',
    });

    expect(confirmada.status).toBe(MentorshipStatus.CONFIRMADA);
    expect(confirmada.meetingUrl).toBe('https://meet.example/abc');
  });

  it('confirmar duas vezes é 409', async () => {
    const { service } = buildService([
      sessao({ status: MentorshipStatus.CONFIRMADA }),
    ]);
    await expect(service.confirm(MENTOR, 1, {})).rejects.toThrow(
      'Sessão não está mais aguardando confirmação.',
    );
  });

  it('concluir exige sessão confirmada', async () => {
    const { service, xp } = buildService([
      sessao({ status: MentorshipStatus.SOLICITADA }),
    ]);

    await expect(service.complete(MENTOR, 1)).rejects.toThrow(
      'Sessão precisa estar confirmada antes de concluir.',
    );
    expect(xp.award).not.toHaveBeenCalled();
  });

  it('concluir dá XP ao mentorado e conta a sessão para o mentor', async () => {
    const { service, xp, mentores } = buildService([
      sessao({ status: MentorshipStatus.CONFIRMADA }),
    ]);

    const concluida = await service.complete(MENTOR, 1);

    expect(concluida.status).toBe(MentorshipStatus.CONCLUIDA);
    // O XP vai para quem recebeu a mentoria, não para quem deu.
    expect(xp.award).toHaveBeenCalledWith(MENTEE, 50);
    expect(mentores.get(MENTOR)!.sessionsCount).toBe(1);
  });
});

describe('MentorshipSessionsService.cancel', () => {
  it('mentorado pode cancelar', async () => {
    const { service } = buildService([sessao()]);
    expect((await service.cancel(MENTEE, 1)).status).toBe(
      MentorshipStatus.CANCELADA,
    );
  });

  it('mentor pode cancelar', async () => {
    const { service } = buildService([sessao()]);
    expect((await service.cancel(MENTOR, 1)).status).toBe(
      MentorshipStatus.CANCELADA,
    );
  });

  it('quem não é parte da sessão não cancela', async () => {
    const { service, rows } = buildService([sessao()]);

    await expect(service.cancel(ESTRANHO, 1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(rows[0].status).toBe(MentorshipStatus.SOLICITADA);
  });

  it('sessão concluída não volta atrás', async () => {
    const { service } = buildService([
      sessao({ status: MentorshipStatus.CONCLUIDA }),
    ]);
    await expect(service.cancel(MENTEE, 1)).rejects.toThrow(
      'Sessão já concluída.',
    );
  });

  it('sessão inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.cancel(MENTEE, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
