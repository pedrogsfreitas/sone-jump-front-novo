import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class AdminJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  list() {
    return this.prisma.job.findMany({
      include: {
        skills: { include: { skill: true } },
        partner: { select: { id: true, name: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async create(adminUserId: number, dto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        title: dto.title,
        companyName: dto.companyName,
        companyLogoUrl: dto.companyLogoUrl,
        location: dto.location,
        remoteType: dto.remoteType,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        description: dto.description,
        partnerId: dto.partnerId,
        skills: dto.skillIds
          ? { create: dto.skillIds.map((skillId) => ({ skillId })) }
          : undefined,
      },
    });
    await this.auditLog.record(adminUserId, 'create_job', 'Job', job.id);
    return job;
  }

  async update(adminUserId: number, jobId: number, dto: UpdateJobDto) {
    await this.assertExists(jobId);

    if (dto.skillIds) {
      await this.prisma.jobSkillRequirement.deleteMany({ where: { jobId } });
    }

    const job = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        title: dto.title,
        companyName: dto.companyName,
        companyLogoUrl: dto.companyLogoUrl,
        location: dto.location,
        remoteType: dto.remoteType,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        description: dto.description,
        partnerId: dto.partnerId,
        skills: dto.skillIds
          ? { create: dto.skillIds.map((skillId) => ({ skillId })) }
          : undefined,
      },
    });
    await this.auditLog.record(adminUserId, 'update_job', 'Job', jobId);
    return job;
  }

  async remove(adminUserId: number, jobId: number): Promise<void> {
    await this.assertExists(jobId);
    await this.prisma.job.delete({ where: { id: jobId } });
    await this.auditLog.record(adminUserId, 'delete_job', 'Job', jobId);
  }

  private async assertExists(jobId: number) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Vaga não encontrada.');
    return job;
  }
}
