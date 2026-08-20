import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { XpService } from '../common/xp/xp.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioProjectDto } from './dto/create-portfolio-project.dto';

/** Each challenge tag bumps that skill's mastery % by this much, capped at 100. */
const SKILL_PCT_BUMP_PER_CHALLENGE = 10;

/** Portfolio size feeds the employability score, so it needs a ceiling. */
const MAX_PORTFOLIO_PROJECTS = 20;

@Injectable()
export class SkillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async listChallenges(userId: number) {
    const [challenges, completions] = await Promise.all([
      this.prisma.challenge.findMany({
        include: { tags: { include: { skill: true } } },
        orderBy: { id: 'asc' },
      }),
      this.prisma.userChallengeCompletion.findMany({ where: { userId } }),
    ]);
    const completedIds = new Set(completions.map((c) => c.challengeId));

    return challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      difficulty: challenge.difficulty,
      xpReward: challenge.xpReward,
      timeLabel: challenge.timeLabel,
      description: challenge.description,
      tags: challenge.tags.map((t) => t.skill.name),
      completed: completedIds.has(challenge.id),
    }));
  }

  async completeChallenge(userId: number, challengeId: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { tags: true },
    });
    if (!challenge) throw new NotFoundException('Desafio não encontrado.');

    const already = await this.prisma.userChallengeCompletion.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
    });
    if (already) throw new ConflictException('Desafio já concluído.');

    await this.prisma.userChallengeCompletion.create({
      data: { userId, challengeId },
    });
    await this.xp.award(userId, challenge.xpReward);

    for (const tag of challenge.tags) {
      const existing = await this.prisma.userSkillProgress.findUnique({
        where: { userId_skillId: { userId, skillId: tag.skillId } },
      });
      const pct = Math.min(
        100,
        (existing?.pct ?? 0) + SKILL_PCT_BUMP_PER_CHALLENGE,
      );
      await this.prisma.userSkillProgress.upsert({
        where: { userId_skillId: { userId, skillId: tag.skillId } },
        update: { pct },
        create: { userId, skillId: tag.skillId, pct },
      });
    }

    return { completed: true };
  }

  listPortfolio(userId: number) {
    return this.prisma.portfolioProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPortfolioProject(userId: number, dto: CreatePortfolioProjectDto) {
    const existing = await this.prisma.portfolioProject.count({
      where: { userId },
    });
    if (existing >= MAX_PORTFOLIO_PROJECTS)
      throw new ConflictException(
        `Limite de ${MAX_PORTFOLIO_PROJECTS} projetos no portfólio atingido.`,
      );
    return this.prisma.portfolioProject.create({ data: { userId, ...dto } });
  }

  async deletePortfolioProject(
    userId: number,
    projectId: number,
  ): Promise<void> {
    const project = await this.prisma.portfolioProject.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Projeto não encontrado.');
    if (project.userId !== userId)
      throw new ForbiddenException('Projeto não pertence a este usuário.');
    await this.prisma.portfolioProject.delete({ where: { id: projectId } });
  }

  async listCertifications(userId: number) {
    const [certifications, earned] = await Promise.all([
      this.prisma.certification.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.userCertification.findMany({ where: { userId } }),
    ]);
    const earnedByCertId = new Map(earned.map((e) => [e.certificationId, e]));

    return certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      description: cert.description,
      earned: earnedByCertId.has(cert.id),
      earnedAt: earnedByCertId.get(cert.id)?.earnedAt ?? null,
    }));
  }

  listSkillProgress(userId: number) {
    return this.prisma.userSkillProgress
      .findMany({ where: { userId }, include: { skill: true } })
      .then((rows) => rows.map((r) => ({ name: r.skill.name, pct: r.pct })));
  }

  async employabilityScore(userId: number) {
    const [
      certifications,
      challengesCompleted,
      portfolioProjects,
      roadmapCompleted,
    ] = await Promise.all([
      this.prisma.userCertification.count({
        where: { userId, earnedAt: { not: null } },
      }),
      this.prisma.userChallengeCompletion.count({ where: { userId } }),
      this.prisma.portfolioProject.count({ where: { userId } }),
      this.prisma.userRoadmapProgress.count({
        where: { userId, status: 'COMPLETED' },
      }),
    ]);

    // Simple deterministic heuristic, not a market-driven score — good enough to
    // gamify progress until there's real hiring-outcome data to calibrate against.
    const score = Math.min(
      100,
      certifications * 10 +
        challengesCompleted * 5 +
        portfolioProjects * 8 +
        roadmapCompleted * 3,
    );

    return {
      score,
      certifications,
      challengesCompleted,
      portfolioProjects,
      roadmapCompleted,
    };
  }
}
