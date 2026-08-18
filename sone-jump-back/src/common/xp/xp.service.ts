import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Every 500 XP = one level. Arbitrary but consistent across every place that awards XP. */
export function calculateLevel(xpTotal: number): number {
  return Math.floor(xpTotal / 500) + 1;
}

@Injectable()
export class XpService {
  constructor(private readonly prisma: PrismaService) {}

  async award(userId: number, amount: number): Promise<void> {
    if (amount <= 0) return;
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const xpTotal = user.xpTotal + amount;
    await this.prisma.user.update({
      where: { id: userId },
      data: { xpTotal, level: calculateLevel(xpTotal) },
    });
  }
}
