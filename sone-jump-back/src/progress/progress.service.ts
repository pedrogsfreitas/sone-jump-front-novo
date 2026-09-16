import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  dayKeyFromInput,
  daysBetween,
  fromDateColumn,
  startOfMonth,
  startOfWeek,
  toDateColumn,
  today,
  weekdayOf,
} from '../common/time/calendar';
import { computeStreak, currentStreakAsOf } from '../common/time/streak';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { LogStudySessionDto } from './dto/log-study-session.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import {
  MAX_BACKDATE_DAYS,
  MAX_DAILY_MINUTES,
  XP_PER_MINUTE,
} from './progress.constants';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async logSession(userId: number, dto: LogStudySessionDto) {
    const todayKey = today();
    const day = dto.occurredOn ? dayKeyFromInput(dto.occurredOn) : todayKey;
    const daysAgo = daysBetween(day, todayKey);
    const xpEarned = Math.round(dto.durationMinutes * XP_PER_MINUTE);

    if (daysAgo < 0)
      throw new BadRequestException('Data da sessão não pode estar no futuro.');
    if (daysAgo > MAX_BACKDATE_DAYS)
      throw new BadRequestException(
        `Data da sessão não pode ser anterior a ${MAX_BACKDATE_DAYS} dias.`,
      );

    const occurredOn = toDateColumn(day);
    const { _sum } = await this.prisma.studySession.aggregate({
      where: { userId, occurredOn },
      _sum: { durationMinutes: true },
    });
    const minutesAlreadyLogged = _sum.durationMinutes ?? 0;
    if (minutesAlreadyLogged + dto.durationMinutes > MAX_DAILY_MINUTES)
      throw new ConflictException(
        `Limite de ${MAX_DAILY_MINUTES} minutos de estudo por dia atingido. ` +
          `Já registrados ${minutesAlreadyLogged} min neste dia.`,
      );

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

    await this.refreshStreak(userId);
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
    const todayKey = today();
    const [user, weekByDay, month, skillProgress] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.studySession.groupBy({
        by: ['occurredOn'],
        where: {
          userId,
          occurredOn: { gte: toDateColumn(startOfWeek(todayKey)) },
        },
        _count: { _all: true },
      }),
      // Agregado aqui, e não somado no front: a tela só recebe as 50 sessões mais
      // recentes, e quem registra várias por dia passa disso dentro do mesmo mês.
      this.prisma.studySession.aggregate({
        where: {
          userId,
          occurredOn: { gte: toDateColumn(startOfMonth(todayKey)) },
        },
        _sum: { durationMinutes: true },
      }),
      this.prisma.userSkillProgress.findMany({
        where: { userId },
        include: { skill: true },
      }),
    ]);

    // Índice 0 = domingo, a mesma ordem dos rótulos do gráfico no front.
    const sessionsByWeekday = [0, 0, 0, 0, 0, 0, 0];
    for (const row of weekByDay) {
      sessionsByWeekday[weekdayOf(fromDateColumn(row.occurredOn))] +=
        row._count._all;
    }

    return {
      xpTotal: user.xpTotal,
      level: user.level,
      streakCurrentDays: currentStreakAsOf(
        user.streakCurrentDays,
        user.lastStudyDate,
        todayKey,
      ),
      streakLongestDays: user.streakLongestDays,
      sessionsThisWeek: sessionsByWeekday.reduce((sum, n) => sum + n, 0),
      sessionsByWeekday,
      minutesThisMonth: month._sum.durationMinutes ?? 0,
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

  /** Ver `computeStreak` para por que a sequência é recalculada, e não incrementada. */
  private async refreshStreak(userId: number) {
    const [days, user] = await Promise.all([
      this.prisma.studySession.findMany({
        where: { userId },
        distinct: ['occurredOn'],
        select: { occurredOn: true },
      }),
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { streakLongestDays: true },
      }),
    ]);
    const streak = computeStreak(days.map((d) => fromDateColumn(d.occurredOn)));

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streakCurrentDays: streak.current,
        // O recorde nunca diminui: pode ter sido registrado antes deste cálculo
        // existir, quando não havia sessão guardada para cada dia contado.
        streakLongestDays: Math.max(user.streakLongestDays, streak.longest),
        lastStudyDate: streak.lastDay ? toDateColumn(streak.lastDay) : null,
      },
    });
  }
}
