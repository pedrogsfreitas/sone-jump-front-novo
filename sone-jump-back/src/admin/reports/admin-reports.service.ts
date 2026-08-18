import { Injectable } from '@nestjs/common';
import {
  PlanKey,
  RoadmapNodeStatus,
  SubscriptionStatus,
} from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

function percentOf(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}

function monthStart(year: number, monthIndex: number): Date {
  return new Date(Date.UTC(year, monthIndex, 1));
}

export interface ActivityEvent {
  type: 'post' | 'completion' | 'registration';
  text: string;
  at: Date;
}

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const now = new Date();
    const [
      totalUsers,
      activeTrails,
      monthlyRevenueCents,
      activeSubs,
      monthlyGrowth,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.trail.count({ where: { active: true } }),
      this.revenueBetween(
        monthStart(now.getUTCFullYear(), now.getUTCMonth()),
        now,
      ),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ATIVA },
      }),
      this.monthlyGrowth(6),
      this.recentActivity(10),
    ]);

    return {
      totalUsers,
      activeTrails,
      monthlyRevenueCents,
      conversionRate: percentOf(activeSubs, totalUsers),
      monthlyGrowth,
      recentActivity,
    };
  }

  async overview(from: Date, to: Date) {
    const [newUsers, revenueCents, courseCompletions, ratingAgg] =
      await Promise.all([
        this.prisma.user.count({
          where: { createdAt: { gte: from, lte: to } },
        }),
        this.revenueBetween(from, to),
        this.prisma.userRoadmapProgress.count({
          where: {
            status: RoadmapNodeStatus.COMPLETED,
            completedAt: { gte: from, lte: to },
          },
        }),
        this.prisma.contentItem.aggregate({ _avg: { rating: true } }),
      ]);

    return {
      newUsers,
      revenueCents,
      courseCompletions,
      avgContentRating: ratingAgg._avg.rating ?? 0,
    };
  }

  async funnel(from: Date, to: Date) {
    const [cadastros, ativacoes, assinantes, premium] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: from, lte: to } } }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: from, lte: to },
          studySessions: { some: {} },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: from, lte: to },
          subscriptions: {
            some: {
              status: {
                in: [
                  SubscriptionStatus.ATIVA,
                  SubscriptionStatus.CANCELADA,
                  SubscriptionStatus.INADIMPLENTE,
                ],
              },
            },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: from, lte: to },
          subscriptions: {
            some: {
              status: SubscriptionStatus.ATIVA,
              plan: { key: PlanKey.PREMIUM },
            },
          },
        },
      }),
    ]);

    return [
      { label: 'Cadastros', value: cadastros, percent: 100 },
      {
        label: 'Ativações',
        value: ativacoes,
        percent: percentOf(ativacoes, cadastros),
      },
      {
        label: 'Assinantes',
        value: assinantes,
        percent: percentOf(assinantes, cadastros),
      },
      {
        label: 'Premium',
        value: premium,
        percent: percentOf(premium, cadastros),
      },
    ];
  }

  /**
   * Simplified retention: for each signup-month cohort, the % of that cohort with at
   * least one study session in each subsequent month. Real product analytics would
   * track broader activity signals — this is what's derivable from data we track today.
   */
  async cohorts(months = 6) {
    const now = new Date();
    const cohortStarts = Array.from({ length: months }, (_, i) =>
      monthStart(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - i)),
    );

    const rows: Array<{ label: string; values: Array<number | null> }> = [];
    for (const cohortStart of cohortStarts) {
      const cohortEnd = new Date(
        Date.UTC(
          cohortStart.getUTCFullYear(),
          cohortStart.getUTCMonth() + 1,
          1,
        ),
      );
      const cohortUsers = await this.prisma.user.findMany({
        where: { createdAt: { gte: cohortStart, lt: cohortEnd } },
        select: { id: true },
      });
      const userIds = cohortUsers.map((u) => u.id);
      const label = cohortStart.toISOString().slice(0, 7);

      if (userIds.length === 0) {
        rows.push({ label, values: Array<number | null>(months).fill(null) });
        continue;
      }

      const values: Array<number | null> = [];
      for (let m = 0; m < months; m++) {
        const mStart = new Date(
          Date.UTC(
            cohortStart.getUTCFullYear(),
            cohortStart.getUTCMonth() + m,
            1,
          ),
        );
        if (mStart > now) {
          values.push(null);
          continue;
        }
        const mEnd = new Date(
          Date.UTC(mStart.getUTCFullYear(), mStart.getUTCMonth() + 1, 1),
        );
        const retained = await this.prisma.studySession.findMany({
          where: {
            userId: { in: userIds },
            occurredOn: { gte: mStart, lt: mEnd },
          },
          select: { userId: true },
          distinct: ['userId'],
        });
        values.push(percentOf(retained.length, userIds.length));
      }
      rows.push({ label, values });
    }
    return rows;
  }

  private async revenueBetween(from: Date, to: Date): Promise<number> {
    const agg = await this.prisma.payment.aggregate({
      where: { status: 'PAGO', paidAt: { gte: from, lte: to } },
      _sum: { amountCents: true },
    });
    return agg._sum.amountCents ?? 0;
  }

  private async monthlyGrowth(months: number) {
    const now = new Date();
    const rows: Array<{ month: string; users: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = monthStart(now.getUTCFullYear(), now.getUTCMonth() - i);
      const end = monthStart(now.getUTCFullYear(), now.getUTCMonth() - i + 1);
      const users = await this.prisma.user.count({
        where: { createdAt: { gte: start, lt: end } },
      });
      rows.push({ month: start.toISOString().slice(0, 7), users });
    }
    return rows;
  }

  private async recentActivity(limit: number): Promise<ActivityEvent[]> {
    const [posts, completions, registrations] = await Promise.all([
      this.prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { username: true } } },
      }),
      this.prisma.userRoadmapProgress.findMany({
        where: { status: RoadmapNodeStatus.COMPLETED },
        take: limit,
        orderBy: { completedAt: 'desc' },
        include: {
          user: { select: { username: true } },
          node: { select: { name: true } },
        },
      }),
      this.prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { username: true, createdAt: true },
      }),
    ]);

    const events: ActivityEvent[] = [
      ...posts.map((p) => ({
        type: 'post' as const,
        text: `${p.author.username} publicou na comunidade`,
        at: p.createdAt,
      })),
      ...completions
        .filter((c) => c.completedAt !== null)
        .map((c) => ({
          type: 'completion' as const,
          text: `${c.user.username} completou ${c.node.name}`,
          at: c.completedAt!,
        })),
      ...registrations.map((r) => ({
        type: 'registration' as const,
        text: `${r.username} se cadastrou`,
        at: r.createdAt,
      })),
    ];

    return events
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, limit);
  }
}
