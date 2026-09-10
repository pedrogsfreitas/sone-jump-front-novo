import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PlanKey, SubscriptionStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralsService } from '../referrals/referrals.service';
import { SubscriptionsService } from './subscriptions.service';

const USER = 1;
const OUTRO_USER = 2;

const PLANS = [
  {
    id: 1,
    key: PlanKey.FREE,
    name: 'Grátis',
    priceMonthlyCents: 0,
    priceAnnualCents: 0,
  },
  {
    id: 2,
    key: PlanKey.PRO,
    name: 'Pro',
    priceMonthlyCents: 4900,
    priceAnnualCents: 46800,
  },
];

interface MockSubscription {
  id: number;
  userId: number;
  planId: number;
  billingCycle: 'MENSAL' | 'ANUAL';
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  createdAt: Date;
}

interface MockPayment {
  id: number;
  subscriptionId: number;
  amountCents: number;
  status: 'PENDENTE' | 'PAGO' | 'FALHOU';
  paidAt: Date | null;
}

function buildService(
  subscriptions: MockSubscription[] = [],
  payments: MockPayment[] = [],
) {
  const subs = [...subscriptions];
  const pays = [...payments];
  let nextSub = subs.length + 1;
  let nextPay = pays.length + 1;

  const prisma = {
    plan: {
      findUniqueOrThrow: jest.fn(({ where }: { where: { key: PlanKey } }) => {
        const plan = PLANS.find((p) => p.key === where.key);
        if (!plan) return Promise.reject(new Error('plano inexistente'));
        return Promise.resolve(plan);
      }),
    },
    subscription: {
      findFirst: jest.fn(
        ({
          where,
        }: {
          where: {
            userId: number;
            status: SubscriptionStatus | { in: SubscriptionStatus[] };
          };
        }) =>
          Promise.resolve(
            subs.find((s) => {
              if (s.userId !== where.userId) return false;
              const st = where.status;
              return typeof st === 'object' && 'in' in st
                ? st.in.includes(s.status)
                : s.status === st;
            }) ?? null,
          ),
      ),
      create: jest.fn(
        ({ data }: { data: Omit<MockSubscription, 'id' | 'createdAt'> }) => {
          const row = { id: nextSub++, createdAt: new Date(), ...data };
          subs.push(row);
          return Promise.resolve(row);
        },
      ),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: number };
          data: { status?: SubscriptionStatus; currentPeriodEnd?: Date };
        }) => {
          const row = subs.find((s) => s.id === where.id)!;
          Object.assign(row, data);
          return Promise.resolve(row);
        },
      ),
    },
    payment: {
      create: jest.fn(
        ({
          data,
        }: {
          data: { subscriptionId: number; amountCents: number };
        }) => {
          const row: MockPayment = {
            id: nextPay++,
            ...data,
            status: 'PENDENTE',
            paidAt: null,
          };
          pays.push(row);
          return Promise.resolve(row);
        },
      ),
      findUnique: jest.fn(({ where }: { where: { id: number } }) => {
        const p = pays.find((x) => x.id === where.id);
        if (!p) return Promise.resolve(null);
        return Promise.resolve({
          ...p,
          subscription: subs.find((s) => s.id === p.subscriptionId)!,
        });
      }),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: number };
          data: { status: 'PAGO' | 'FALHOU'; paidAt: Date | null };
        }) => {
          const p = pays.find((x) => x.id === where.id)!;
          Object.assign(p, data);
          return Promise.resolve({
            ...p,
            subscription: subs.find((s) => s.id === p.subscriptionId)!,
          });
        },
      ),
    },
  };

  const referrals = { registerConversion: jest.fn(() => Promise.resolve()) };
  const service = new SubscriptionsService(
    prisma as unknown as PrismaService,
    referrals as unknown as ReferralsService,
  );

  return { service, subs, pays, referrals };
}

function assinaturaAtiva(): MockSubscription {
  return {
    id: 1,
    userId: USER,
    planId: 2,
    billingCycle: 'MENSAL',
    status: SubscriptionStatus.ATIVA,
    currentPeriodEnd: new Date('2026-12-01'),
    createdAt: new Date('2026-09-01'),
  };
}

describe('SubscriptionsService — assinatura atual', () => {
  it('sem assinatura, devolve o plano Grátis em vez de vazio', async () => {
    const { service } = buildService();
    const atual = await service.getMine(USER);

    expect(atual.plan.key).toBe(PlanKey.FREE);
    expect(atual.status).toBe(SubscriptionStatus.ATIVA);
  });

  it('assinatura cancelada não conta como atual', async () => {
    const { service } = buildService([
      { ...assinaturaAtiva(), status: SubscriptionStatus.CANCELADA },
    ]);

    const atual = await service.getMine(USER);
    expect(atual.plan.key).toBe(PlanKey.FREE);
  });
});

describe('SubscriptionsService — checkout', () => {
  it('cobra o preço mensal do plano no ciclo mensal', async () => {
    const { service, pays } = buildService();

    const resultado = await service.checkout(USER, {
      planKey: PlanKey.PRO,
      billingCycle: 'MENSAL',
    });

    expect(resultado.amountCents).toBe(4900);
    expect(pays[0].status).toBe('PENDENTE');
  });

  it('cobra o preço anual no ciclo anual — não 12x o mensal', async () => {
    const { service } = buildService();

    const resultado = await service.checkout(USER, {
      planKey: PlanKey.PRO,
      billingCycle: 'ANUAL',
    });

    expect(resultado.amountCents).toBe(46800);
  });

  /** Sem isso, dois cliques no botão gerariam duas cobranças. */
  it('com assinatura ativa, novo checkout é 409', async () => {
    const { service } = buildService([assinaturaAtiva()]);

    await expect(
      service.checkout(USER, { planKey: PlanKey.PRO, billingCycle: 'MENSAL' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('com checkout pendente, outro checkout é 409', async () => {
    const { service } = buildService([
      { ...assinaturaAtiva(), status: SubscriptionStatus.PENDENTE },
    ]);

    await expect(
      service.checkout(USER, { planKey: PlanKey.PRO, billingCycle: 'MENSAL' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('SubscriptionsService — confirmação de pagamento', () => {
  async function comCheckoutPendente() {
    const ctx = buildService();
    await ctx.service.checkout(USER, {
      planKey: PlanKey.PRO,
      billingCycle: 'MENSAL',
    });
    return ctx;
  }

  it('pagamento aprovado ativa a assinatura e credita a indicação', async () => {
    const { service, subs, referrals } = await comCheckoutPendente();

    await service.confirmPayment(1, 'PAGO');

    expect(subs[0].status).toBe(SubscriptionStatus.ATIVA);
    expect(referrals.registerConversion).toHaveBeenCalledWith(USER, 4900);
  });

  it('pagamento recusado deixa INADIMPLENTE e não credita ninguém', async () => {
    const { service, subs, referrals } = await comCheckoutPendente();

    await service.confirmPayment(1, 'FALHOU');

    expect(subs[0].status).toBe(SubscriptionStatus.INADIMPLENTE);
    expect(referrals.registerConversion).not.toHaveBeenCalled();
  });

  it('ciclo mensal estende o período por 30 dias; anual, por 365', async () => {
    const mensal = await comCheckoutPendente();
    await mensal.service.confirmPayment(1, 'PAGO');
    const diasMensal = Math.round(
      (mensal.subs[0].currentPeriodEnd.getTime() - Date.now()) / 86_400_000,
    );

    const anual = buildService();
    await anual.service.checkout(USER, {
      planKey: PlanKey.PRO,
      billingCycle: 'ANUAL',
    });
    await anual.service.confirmPayment(1, 'PAGO');
    const diasAnual = Math.round(
      (anual.subs[0].currentPeriodEnd.getTime() - Date.now()) / 86_400_000,
    );

    expect(diasMensal).toBe(30);
    expect(diasAnual).toBe(365);
  });
});

describe('SubscriptionsService — simulação (rota de desenvolvimento)', () => {
  async function comCheckoutPendente() {
    const ctx = buildService();
    await ctx.service.checkout(USER, {
      planKey: PlanKey.PRO,
      billingCycle: 'MENSAL',
    });
    return ctx;
  }

  /**
   * A verificação de dono é a parte que importa: sem ela, qualquer usuário
   * autenticado poderia confirmar o pagamento de outra pessoa informando o id.
   */
  it('confirmar pagamento de outro usuário é 403', async () => {
    const { service } = await comCheckoutPendente();

    await expect(
      service.simulatePayment(OUTRO_USER, 1, 'PAGO'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('pagamento inexistente é 404', async () => {
    const { service } = await comCheckoutPendente();
    await expect(
      service.simulatePayment(USER, 999, 'PAGO'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('confirmar duas vezes o mesmo pagamento é 409', async () => {
    const { service } = await comCheckoutPendente();

    await service.simulatePayment(USER, 1, 'PAGO');
    await expect(
      service.simulatePayment(USER, 1, 'PAGO'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('SubscriptionsService — cancelamento', () => {
  it('cancela a assinatura ativa', async () => {
    const { service, subs } = buildService([assinaturaAtiva()]);

    await service.cancel(USER);
    expect(subs[0].status).toBe(SubscriptionStatus.CANCELADA);
  });

  it('sem assinatura ativa, cancelar é 404', async () => {
    const { service } = buildService();
    await expect(service.cancel(USER)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
