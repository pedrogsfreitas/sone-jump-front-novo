import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlanKey, SubscriptionStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralsService } from '../referrals/referrals.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

const OPEN_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.ATIVA,
  SubscriptionStatus.PENDENTE,
];

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly referrals: ReferralsService,
  ) {}

  async getMine(userId: number) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: OPEN_STATUSES } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
    if (subscription) return subscription;

    const freePlan = await this.prisma.plan.findUniqueOrThrow({
      where: { key: PlanKey.FREE },
    });
    return {
      id: null,
      status: SubscriptionStatus.ATIVA,
      plan: freePlan,
      billingCycle: null,
      currentPeriodEnd: null,
    };
  }

  async checkout(userId: number, dto: CreateCheckoutDto) {
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: OPEN_STATUSES } },
    });
    if (existing) {
      throw new ConflictException(
        'Você já tem uma assinatura ativa ou um checkout pendente.',
      );
    }

    const plan = await this.prisma.plan.findUniqueOrThrow({
      where: { key: dto.planKey },
    });
    const amountCents =
      dto.billingCycle === 'ANUAL'
        ? plan.priceAnnualCents
        : plan.priceMonthlyCents;

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        billingCycle: dto.billingCycle,
        status: SubscriptionStatus.PENDENTE,
        currentPeriodEnd: new Date(), // placeholder, replaced once the payment is confirmed
      },
    });
    const payment = await this.prisma.payment.create({
      data: { subscriptionId: subscription.id, amountCents },
    });

    return {
      subscriptionId: subscription.id,
      paymentId: payment.id,
      amountCents,
      // Single integration seam: once a real provider is chosen, this is where its
      // checkout/preference URL gets returned instead of null.
      checkoutUrl: null,
      note:
        'Nenhum provedor de pagamento configurado ainda. Fora de produção, confirme com ' +
        'POST /api/subscriptions/payments/:id/simulate.',
    };
  }

  async simulatePayment(
    userId: number,
    paymentId: number,
    outcome: 'PAGO' | 'FALHOU',
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { subscription: true },
    });
    if (!payment) throw new NotFoundException('Pagamento não encontrado.');
    if (payment.subscription.userId !== userId) {
      throw new ForbiddenException('Pagamento não pertence a este usuário.');
    }
    if (payment.status !== 'PENDENTE')
      throw new ConflictException('Pagamento já processado.');

    return this.confirmPayment(paymentId, outcome);
  }

  /** Shared by the dev-only simulate endpoint and, later, the real provider's webhook. */
  async confirmPayment(paymentId: number, outcome: 'PAGO' | 'FALHOU') {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: outcome, paidAt: outcome === 'PAGO' ? new Date() : null },
      include: { subscription: true },
    });

    if (outcome === 'PAGO') {
      const periodDays =
        payment.subscription.billingCycle === 'ANUAL' ? 365 : 30;
      await this.prisma.subscription.update({
        where: { id: payment.subscription.id },
        data: {
          status: SubscriptionStatus.ATIVA,
          currentPeriodEnd: new Date(
            Date.now() + periodDays * 24 * 60 * 60 * 1000,
          ),
        },
      });
      await this.referrals.registerConversion(
        payment.subscription.userId,
        payment.amountCents,
      );
    } else {
      await this.prisma.subscription.update({
        where: { id: payment.subscription.id },
        data: { status: SubscriptionStatus.INADIMPLENTE },
      });
    }

    return payment;
  }

  async cancel(userId: number) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ATIVA },
    });
    if (!subscription) throw new NotFoundException('Nenhuma assinatura ativa.');

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.CANCELADA },
    });
  }
}
