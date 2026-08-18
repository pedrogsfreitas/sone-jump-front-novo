import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { LogStudySessionDto } from './dto/log-study-session.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

/** 1 XP per minute studied — deliberately server-computed, never trusts a client-supplied value. */
const XP_PER_MINUTE = 1;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000,
  );
}

function startOfWeek(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - diffToMonday,
    ),
  );
  return monday;
}

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async logSession(userId: number, dto: LogStudySessionDto) {
    const occurredOn = dto.occurredOn ? new Date(dto.occurredOn) : new Date();
    const xpEarned = Math.round(dto.durationMinutes * XP_PER_MINUTE);

    const session = await this.prisma.studySession.create({
      data: {
        userId,
        topic: dto.topic,
        durationMinutes: dto.durationMinutes,
        subjectTag: dto.subjectTag,
        occurredOn,
        xpEarned,
      },
    });

    await this.applyStreak(userId, occurredOn);
    await this.xp.award(userId, xpEarned);

    return session;
  }

  listSessions(userId: number) {
    return this.prisma.studySession.findMany({
      where: { userId },
      orderBy: { occurredOn: 'desc' },
      take: 50,
    });
  }

  async summary(userId: number) {
    const [user, sessionsThisWeek, skillProgress] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.studySession.count({
        where: { userId, occurredOn: { gte: startOfWeek() } },
      }),
      this.prisma.userSkillProgress.findMany({
        where: { userId },
        include: { skill: true },
      }),
    ]);

    return {
      xpTotal: user.xpTotal,
      level: user.level,
      streakCurrentDays: user.streakCurrentDays,
      streakLongestDays: user.streakLongestDays,
      sessionsThisWeek,
      skills: skillProgress.map((s) => ({ name: s.skill.name, pct: s.pct })),
    };
  }

  createGoal(userId: number, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        targetPct: dto.targetPct ?? 100,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  listGoals(userId: number) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateGoal(userId: number, goalId: number, dto: UpdateGoalDto) {
    const goal = await this.assertOwnedGoal(userId, goalId);
    const completedAt = dto.currentPct >= goal.targetPct ? new Date() : null;
    return this.prisma.goal.update({
      where: { id: goalId },
      data: { currentPct: dto.currentPct, completedAt },
    });
  }

  async deleteGoal(userId: number, goalId: number): Promise<void> {
    await this.assertOwnedGoal(userId, goalId);
    await this.prisma.goal.delete({ where: { id: goalId } });
  }

  private async assertOwnedGoal(userId: number, goalId: number) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Meta não encontrada.');
    if (goal.userId !== userId)
      throw new ForbiddenException('Meta não pertence a este usuário.');
    return goal;
  }

  private async applyStreak(userId: number, occurredOn: Date) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const day = dateKey(occurredOn);
    const last = user.lastStudyDate ? dateKey(user.lastStudyDate) : null;

    if (last === day) return; // already logged a session today, streak unchanged

    const isConsecutiveDay = last !== null && daysBetween(last, day) === 1;
    const streakCurrentDays = isConsecutiveDay ? user.streakCurrentDays + 1 : 1;
    const streakLongestDays = Math.max(
      user.streakLongestDays,
      streakCurrentDays,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { streakCurrentDays, streakLongestDays, lastStudyDate: occurredOn },
    });
  }
}
