import { Injectable, NotFoundException } from '@nestjs/common';
import { JobApplicationStatus } from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FullListQueryDto } from '../../common/pagination/pagination.dto';

@Injectable()
export class AdminJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Candidatos de uma vaga. Sem isto, o status da candidatura era um campo que
   * ninguém conseguia enxergar nem alterar: toda candidatura nascia `APLICADO` e
   * ficava assim para sempre, apesar de o enum prever o funil inteiro.
   */
  async listApplications(jobId: number, query: FullListQueryDto) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Vaga não encontrada.');

    return this.prisma.jobApplication.findMany({
      where: { jobId },
      // Nunca incluir o usuário inteiro: a resposta vai direto para a API, e a linha
      // do `User` carrega `passwordHash` e o CPF cifrado.
      select: {
        id: true,
        status: true,
        appliedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            avatarColor: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    });
  }

  async updateApplicationStatus(
    adminUserId: number,
    applicationId: number,
    status: JobApplicationStatus,
  ) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application)
      throw new NotFoundException('Candidatura não encontrada.');

    const updated = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      select: { id: true, status: true, appliedAt: true },
    });

    await this.auditLog.record(
      adminUserId,
      'update_job_application',
      'JobApplication',
      applicationId,
      { status },
    );
    return updated;
  }

  list(query: FullListQueryDto) {
    return this.prisma.job.findMany({
      include: {
        skills: { include: { skill: true } },
        partner: { select: { id: true, name: true } },
      },
      orderBy: { id: 'asc' },
      take: query.limit,
      skip: query.offset,
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
