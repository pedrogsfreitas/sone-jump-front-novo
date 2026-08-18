import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListJobsDto } from './dto/list-jobs.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number, filters: ListJobsDto) {
    const [jobs, userSkills] = await Promise.all([
      this.prisma.job.findMany({
        where: { remoteType: filters.remoteType },
        include: {
          skills: { include: { skill: true } },
          partner: { select: { id: true, name: true, logoUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userSkillProgress.findMany({
        where: { userId },
        include: { skill: true },
      }),
    ]);

    const pctBySkillName = new Map(
      userSkills.map((s) => [s.skill.name, s.pct]),
    );

    return jobs.map((job) => {
      const requiredSkills = job.skills.map((s) => s.skill.name);
      // Average of the applicant's mastery % across the job's required skills — null
      // (no match shown) when the job doesn't declare any.
      const match =
        requiredSkills.length === 0
          ? null
          : Math.round(
              requiredSkills.reduce(
                (sum, name) => sum + (pctBySkillName.get(name) ?? 0),
                0,
              ) / requiredSkills.length,
            );

      return {
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        companyLogoUrl: job.companyLogoUrl,
        location: job.location,
        remoteType: job.remoteType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        description: job.description,
        skills: requiredSkills,
        partner: job.partner,
        match,
      };
    });
  }

  async apply(userId: number, jobId: number) {
    await this.assertJobExists(jobId);
    const already = await this.prisma.jobApplication.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });
    if (already)
      throw new ConflictException('Você já se candidatou a esta vaga.');
    return this.prisma.jobApplication.create({ data: { jobId, userId } });
  }

  listMyApplications(userId: number) {
    return this.prisma.jobApplication.findMany({
      where: { userId },
      include: {
        job: { select: { id: true, title: true, companyName: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  private async assertJobExists(jobId: number) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Vaga não encontrada.');
    return job;
  }
}
