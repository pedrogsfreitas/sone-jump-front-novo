import { ConflictException, NotFoundException } from '@nestjs/common';
import { ReferralStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralsService } from './referrals.service';

const INDICADOR = 1;
const INDICADO = 2;
const TERCEIRO = 3;

interface MockReferral {
  id: number;
  referrerUserId: number;
  referredUserId: number;
  status: ReferralStatus;
  commissionCents: number;
}

/**
 * O banco simulado precisa aplicar `increment` de verdade: a comissão é recorrente
 * (soma a cada pagamento), então tratar o incremento como atribuição esconderia
 * justamente o comportamento que estes testes verificam.
 */
function buildService(
  codes: Array<{ userId: number; code: string }> = [],
  referrals: MockReferral[] = [],
) {
  const codeRows = [...codes];
  const referralRows = [...referrals];
  let nextId = referralRows.length + 1;

  const prisma = {
    referralCode: {
      findUnique: jest.fn(
        ({ where }: { where: { userId?: number; code?: string } }) =>
          Promise.resolve(
            codeRows.find(
              (c) =>
                (where.userId !== undefined && c.userId === where.userId) ||
                (where.code !== undefined && c.code === where.code),
            ) ?? null,
          ),
      ),
      create: jest.fn(
        ({ data }: { data: { userId: number; code: string } }) => {
          codeRows.push(data);
          return Promise.resolve(data);
        },
      ),
    },
    user: {
      findUniqueOrThrow: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve({ id: where.id, username: `user${where.id}` }),
      ),
    },
    referral: {
      findUnique: jest.fn(({ where }: { where: { referredUserId: number } }) =>
        Promise.resolve(
          referralRows.find((r) => r.referredUserId === where.referredUserId) ??
            null,
        ),
      ),
      findMany: jest.fn(({ where }: { where: { referrerUserId: number } }) =>
        Promise.resolve(
          referralRows.filter((r) => r.referrerUserId === where.referrerUserId),
        ),
      ),
      create: jest.fn(
        ({
          data,
        }: {
          data: { referrerUserId: number; referredUserId: number };
        }) => {
          const row: MockReferral = {
            id: nextId++,
            ...data,
            status: ReferralStatus.CADASTRADO,
            commissionCents: 0,
          };
          referralRows.push(row);
          return Promise.resolve(row);
        },
      ),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: number };
          data: {
            status?: ReferralStatus;
            commissionCents?: { increment: number };
          };
        }) => {
          const row = referralRows.find((r) => r.id === where.id)!;
          if (data.status) row.status = data.status;
          if (data.commissionCents) {
            row.commissionCents += data.commissionCents.increment;
          }
          return Promise.resolve(row);
        },
      ),
    },
  };

  const service = new ReferralsService(prisma as unknown as PrismaService);
  return { service, codeRows, referralRows };
}

describe('ReferralsService — código', () => {
  it('cria o código na primeira vez e reaproveita depois', async () => {
    const { service, codeRows } = buildService();

    const primeiro = await service.getOrCreateCode(INDICADOR);
    const segundo = await service.getOrCreateCode(INDICADOR);

    expect(primeiro.code).toBe('user1');
    expect(segundo.code).toBe(primeiro.code);
    expect(codeRows).toHaveLength(1);
  });
});

describe('ReferralsService — reivindicar indicação', () => {
  it('código inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.claim(INDICADO, 'nao-existe')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  /** Sem esta regra, qualquer pessoa geraria comissão para si mesma. */
  it('usar o próprio código é 409', async () => {
    const { service } = buildService([{ userId: INDICADOR, code: 'user1' }]);
    await expect(service.claim(INDICADOR, 'user1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('ser indicado duas vezes é 409', async () => {
    const { service } = buildService(
      [
        { userId: INDICADOR, code: 'user1' },
        { userId: TERCEIRO, code: 'user3' },
      ],
      [
        {
          id: 1,
          referrerUserId: INDICADOR,
          referredUserId: INDICADO,
          status: ReferralStatus.CADASTRADO,
          commissionCents: 0,
        },
      ],
    );

    await expect(service.claim(INDICADO, 'user3')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('indicação válida nasce CADASTRADO e sem comissão', async () => {
    const { service } = buildService([{ userId: INDICADOR, code: 'user1' }]);

    const referral = await service.claim(INDICADO, 'user1');

    expect(referral.status).toBe(ReferralStatus.CADASTRADO);
    expect(referral.commissionCents).toBe(0);
  });
});

describe('ReferralsService — conversão e comissão', () => {
  function comIndicacao() {
    return buildService(
      [{ userId: INDICADOR, code: 'user1' }],
      [
        {
          id: 1,
          referrerUserId: INDICADOR,
          referredUserId: INDICADO,
          status: ReferralStatus.CADASTRADO,
          commissionCents: 0,
        },
      ],
    );
  }

  it('credita 30% do valor pago e marca como CONVERTIDO', async () => {
    const { service, referralRows } = comIndicacao();

    // R$ 49,00 → R$ 14,70, o número que a tela de Planos promete.
    await service.registerConversion(INDICADO, 4900);

    expect(referralRows[0].status).toBe(ReferralStatus.CONVERTIDO);
    expect(referralRows[0].commissionCents).toBe(1470);
  });

  /** A tela promete "comissão recorrente": o segundo pagamento também paga. */
  it('acumula a comissão a cada pagamento, não sobrescreve', async () => {
    const { service, referralRows } = comIndicacao();

    await service.registerConversion(INDICADO, 4900);
    await service.registerConversion(INDICADO, 4900);

    expect(referralRows[0].commissionCents).toBe(2940);
  });

  it('arredonda a comissão para centavos inteiros', async () => {
    const { service, referralRows } = comIndicacao();

    // 30% de 3333 = 999,9 — centavo fracionado não existe.
    await service.registerConversion(INDICADO, 3333);

    expect(referralRows[0].commissionCents).toBe(1000);
    expect(Number.isInteger(referralRows[0].commissionCents)).toBe(true);
  });

  it('pagamento de quem não foi indicado não credita ninguém', async () => {
    const { service, referralRows } = comIndicacao();

    await service.registerConversion(TERCEIRO, 4900);

    expect(referralRows[0].commissionCents).toBe(0);
    expect(referralRows[0].status).toBe(ReferralStatus.CADASTRADO);
  });
});

describe('ReferralsService — estatísticas', () => {
  it('conta indicações, conversões e soma os ganhos', async () => {
    const { service } = buildService(
      [{ userId: INDICADOR, code: 'user1' }],
      [
        {
          id: 1,
          referrerUserId: INDICADOR,
          referredUserId: 2,
          status: ReferralStatus.CONVERTIDO,
          commissionCents: 1470,
        },
        {
          id: 2,
          referrerUserId: INDICADOR,
          referredUserId: 3,
          status: ReferralStatus.CADASTRADO,
          commissionCents: 0,
        },
        // De outro indicador: não pode entrar na conta deste.
        {
          id: 3,
          referrerUserId: 99,
          referredUserId: 4,
          status: ReferralStatus.CONVERTIDO,
          commissionCents: 9999,
        },
      ],
    );

    const stats = await service.myStats(INDICADOR);

    expect(stats).toEqual({
      code: 'user1',
      referralsCount: 2,
      conversionsCount: 1,
      totalEarningsCents: 1470,
    });
  });
});
