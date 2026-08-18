import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReferralStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

/** Matches the "30% de comissão recorrente" copy already in the frontend's Planos.tsx. */
const COMMISSION_RATE = 0.3;

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCode(userId: number) {
    const existing = await this.prisma.referralCode.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return this.prisma.referralCode.create({
      data: { userId, code: user.username },
    });
  }

  async claim(userId: number, code: string) {
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code },
    });
    if (!referralCode)
      throw new NotFoundException('Código de indicação inválido.');
    if (referralCode.userId === userId) {
      throw new ConflictException(
        'Você não pode usar seu próprio código de indicação.',
      );
    }

    const alreadyReferred = await this.prisma.referral.findUnique({
      where: { referredUserId: userId },
    });
    if (alreadyReferred)
      throw new ConflictException('Este usuário já foi indicado por alguém.');

    return this.prisma.referral.create({
      data: { referrerUserId: referralCode.userId, referredUserId: userId },
    });
  }

  /** Called from SubscriptionsService whenever a payment for `referredUserId` is confirmed. */
  async registerConversion(
    referredUserId: number,
    paymentAmountCents: number,
  ): Promise<void> {
    const referral = await this.prisma.referral.findUnique({
      where: { referredUserId },
    });
    if (!referral) return;

    const commission = Math.round(paymentAmountCents * COMMISSION_RATE);
    await this.prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: ReferralStatus.CONVERTIDO,
        commissionCents: { increment: commission },
      },
    });
  }

  async myStats(userId: number) {
    const [code, referrals] = await Promise.all([
      this.getOrCreateCode(userId),
      this.prisma.referral.findMany({ where: { referrerUserId: userId } }),
    ]);

    const conversions = referrals.filter(
      (r) => r.status === ReferralStatus.CONVERTIDO,
    );
    const totalEarningsCents = referrals.reduce(
      (sum, r) => sum + r.commissionCents,
      0,
    );

    return {
      code: code.code,
      referralsCount: referrals.length,
      conversionsCount: conversions.length,
      totalEarningsCents,
    };
  }
}
