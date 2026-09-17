import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LivesService } from './lives.service';

const HOST = 1;
const OUTRO = 2;
const LIVE_ID = 7;

function buildService() {
  const lives = [{ id: LIVE_ID, hostId: HOST, status: 'AGENDADA' as string }];
  const questions = [
    {
      id: 100,
      liveSessionId: LIVE_ID,
      userId: OUTRO,
      text: 'Dúvida',
      votes: 0,
    },
  ];
  const votes: { userId: number; questionId: number }[] = [];

  const prisma = {
    liveSession: {
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(lives.find((l) => l.id === where.id) ?? null),
      ),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: number };
          data: { status: string };
        }) => {
          const live = lives.find((l) => l.id === where.id)!;
          live.status = data.status;
          return Promise.resolve(live);
        },
      ),
    },
    liveQuestion: {
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(questions.find((q) => q.id === where.id) ?? null),
      ),
      create: jest.fn(
        ({
          data,
        }: {
          data: { liveSessionId: number; userId: number; text: string };
        }) => {
          const row = { id: 200, votes: 0, ...data };
          questions.push(row);
          return Promise.resolve(row);
        },
      ),
      update: jest.fn(({ where }: { where: { id: number } }) => {
        const q = questions.find((x) => x.id === where.id)!;
        q.votes += 1;
        return Promise.resolve(q);
      }),
    },
    liveQuestionVote: {
      findUnique: jest.fn(
        ({
          where,
        }: {
          where: { userId_questionId: { userId: number; questionId: number } };
        }) =>
          Promise.resolve(
            votes.find(
              (v) =>
                v.userId === where.userId_questionId.userId &&
                v.questionId === where.userId_questionId.questionId,
            ) ?? null,
          ),
      ),
      create: jest.fn(
        ({ data }: { data: { userId: number; questionId: number } }) => {
          votes.push(data);
          return Promise.resolve(data);
        },
      ),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };

  return {
    service: new LivesService(prisma as unknown as PrismaService),
    lives,
    questions,
    votes,
    prisma,
  };
}

describe('LivesService.updateStatus — quem pode mexer na live', () => {
  it('o host muda o status', async () => {
    const { service } = buildService();
    expect(
      (await service.updateStatus(HOST, false, LIVE_ID, 'AO_VIVO')).status,
    ).toBe('AO_VIVO');
  });

  it('um admin muda o status mesmo sem ser host', async () => {
    const { service } = buildService();
    expect(
      (await service.updateStatus(OUTRO, true, LIVE_ID, 'ENCERRADA')).status,
    ).toBe('ENCERRADA');
  });

  it('quem não é host nem admin recebe 403 e nada muda', async () => {
    const { service, lives } = buildService();

    await expect(
      service.updateStatus(OUTRO, false, LIVE_ID, 'AO_VIVO'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(lives[0].status).toBe('AGENDADA');
  });

  it('live inexistente é 404', async () => {
    const { service } = buildService();
    await expect(
      service.updateStatus(HOST, true, 999, 'AO_VIVO'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('LivesService — perguntas e votos', () => {
  it('pergunta em live inexistente é 404', async () => {
    const { service } = buildService();
    await expect(
      service.addQuestion(OUTRO, 999, { text: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('votar incrementa o contador da pergunta', async () => {
    const { service, questions } = buildService();

    await service.upvote(HOST, 100);

    expect(questions[0].votes).toBe(1);
  });

  /** Sem essa trava, uma pergunta subiria no ranking com um voto repetido em loop. */
  it('votar duas vezes na mesma pergunta é 409 e não conta de novo', async () => {
    const { service, questions } = buildService();
    await service.upvote(HOST, 100);

    await expect(service.upvote(HOST, 100)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(questions[0].votes).toBe(1);
  });

  it('o voto e o incremento vão na mesma transação', async () => {
    const { service, prisma } = buildService();

    await service.upvote(HOST, 100);

    // Se fossem escritas soltas, uma falha no meio deixaria voto sem contador.
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('pergunta inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.upvote(HOST, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
