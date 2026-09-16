import { ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteChallengeDto } from './dto/complete-challenge.dto';
import { SkillsService } from './skills.service';

const USER_ID = 1;
const LINK = 'https://github.com/aluno/desafio-api';

interface Completion {
  userId: number;
  challengeId: number;
  submissionUrl: string | null;
}

function buildService() {
  const completions: Completion[] = [];
  const prisma = {
    challenge: {
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(
          where.id === 7 ? { id: 7, xpReward: 50, tags: [] } : null,
        ),
      ),
      findMany: jest.fn(() =>
        Promise.resolve([
          {
            id: 7,
            title: 'API',
            difficulty: 'INICIANTE',
            xpReward: 50,
            timeLabel: '1h',
            description: '',
            tags: [],
          },
          {
            id: 8,
            title: 'CLI',
            difficulty: 'INICIANTE',
            xpReward: 30,
            timeLabel: '1h',
            description: '',
            tags: [],
          },
        ]),
      ),
    },
    userChallengeCompletion: {
      findUnique: jest.fn(
        ({
          where,
        }: {
          where: { userId_challengeId: Omit<Completion, 'submissionUrl'> };
        }) =>
          Promise.resolve(
            completions.find(
              (c) =>
                c.userId === where.userId_challengeId.userId &&
                c.challengeId === where.userId_challengeId.challengeId,
            ) ?? null,
          ),
      ),
      findMany: jest.fn(({ where }: { where: { userId: number } }) =>
        Promise.resolve(completions.filter((c) => c.userId === where.userId)),
      ),
      create: jest.fn(({ data }: { data: Completion }) => {
        completions.push(data);
        return Promise.resolve(data);
      }),
    },
  };
  const xp = { award: jest.fn(() => Promise.resolve()) };
  const service = new SkillsService(
    prisma as unknown as PrismaService,
    xp as unknown as XpService,
  );
  return { service, completions, xp };
}

describe('SkillsService.completeChallenge — link da resolução', () => {
  it('guarda o link junto com a conclusão', async () => {
    const { service, completions, xp } = buildService();

    const result = await service.completeChallenge(USER_ID, 7, {
      submissionUrl: LINK,
    });

    expect(result).toEqual({ completed: true, submissionUrl: LINK });
    expect(completions).toEqual([
      { userId: USER_ID, challengeId: 7, submissionUrl: LINK },
    ]);
    expect(xp.award).toHaveBeenCalledWith(USER_ID, 50);
  });

  it('segunda conclusão do mesmo desafio é recusada e não troca o link', async () => {
    const { service, completions, xp } = buildService();
    await service.completeChallenge(USER_ID, 7, { submissionUrl: LINK });

    await expect(
      service.completeChallenge(USER_ID, 7, {
        submissionUrl: 'https://outro.dev/x',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(completions[0].submissionUrl).toBe(LINK);
    expect(xp.award).toHaveBeenCalledTimes(1);
  });

  it('a listagem devolve o link de quem concluiu, e null no que falta', async () => {
    const { service } = buildService();
    await service.completeChallenge(USER_ID, 7, { submissionUrl: LINK });

    const lista = await service.listChallenges(USER_ID, {
      limit: 100,
      offset: 0,
    });

    expect(lista.map((c) => [c.id, c.completed, c.submissionUrl])).toEqual([
      [7, true, LINK],
      [8, false, null],
    ]);
  });
});

describe('CompleteChallengeDto', () => {
  async function erros(submissionUrl?: unknown) {
    return validate(plainToInstance(CompleteChallengeDto, { submissionUrl }));
  }

  it('aceita https', async () => {
    expect(await erros(LINK)).toHaveLength(0);
  });

  it.each([
    ['sem o campo', undefined],
    ['http sem TLS', 'http://github.com/aluno/x'],
    ['javascript:', 'javascript:alert(1)'],
    ['sem protocolo', 'github.com/aluno/x'],
    ['texto solto', 'fiz no meu pc'],
    ['acima de 500 caracteres', `https://github.com/${'a'.repeat(500)}`],
  ])('recusa %s', async (_caso, valor) => {
    expect(await erros(valor)).not.toHaveLength(0);
  });

  it('mensagem em português para link inválido', async () => {
    const [erro] = await erros('http://github.com/aluno/x');
    expect(erro.constraints?.isUrl).toBe(
      'Informe o link da resolução começando com https://.',
    );
  });
});
