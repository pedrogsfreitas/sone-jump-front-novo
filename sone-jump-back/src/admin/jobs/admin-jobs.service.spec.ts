import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { AdminJobsService } from './admin-jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

const ADMIN = 1;
const JOB_ID = 7;

function buildService(jobs: number[] = [JOB_ID]) {
  const ids = new Set(jobs);
  const skillRows: { jobId: number; skillId: number }[] = [];
  let nextId = Math.max(0, ...jobs) + 1;
  const escritos: Record<string, unknown>[] = [];

  const prisma = {
    job: {
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(ids.has(where.id) ? { id: where.id } : null),
      ),
      create: jest.fn(({ data }: { data: Record<string, unknown> }) => {
        escritos.push(data);
        const id = nextId++;
        ids.add(id);
        return Promise.resolve({ id, ...data });
      }),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: number };
          data: Record<string, unknown>;
        }) => {
          escritos.push(data);
          return Promise.resolve({ id: where.id, ...data });
        },
      ),
      delete: jest.fn(({ where }: { where: { id: number } }) => {
        ids.delete(where.id);
        return Promise.resolve({ id: where.id });
      }),
    },
    jobSkillRequirement: {
      deleteMany: jest.fn(({ where }: { where: { jobId: number } }) => {
        for (let i = skillRows.length - 1; i >= 0; i--) {
          if (skillRows[i].jobId === where.jobId) skillRows.splice(i, 1);
        }
        return Promise.resolve({ count: 1 });
      }),
    },
  };

  const auditLog = { record: jest.fn(() => Promise.resolve({})) };
  const service = new AdminJobsService(
    prisma as unknown as PrismaService,
    auditLog as unknown as AuditLogService,
  );

  return { service, ids, escritos, auditLog, prisma };
}

const base = {
  title: 'Dev Front-end',
  companyName: 'ACME',
  location: 'São Paulo',
  remoteType: 'REMOTO',
  description: 'Vaga',
} as unknown as CreateJobDto;

describe('AdminJobsService.create', () => {
  it('cria a vaga com as skills exigidas e registra no audit log', async () => {
    const { service, escritos, auditLog } = buildService([]);

    const vaga = await service.create(ADMIN, {
      ...base,
      skillIds: [2, 3],
    });

    expect(escritos[0].skills).toEqual({
      create: [{ skillId: 2 }, { skillId: 3 }],
    });
    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'create_job',
      'Job',
      vaga.id,
    );
  });

  it('sem skillIds, não cria vínculo de skill', async () => {
    const { service, escritos } = buildService([]);

    await service.create(ADMIN, base);

    expect(escritos[0].skills).toBeUndefined();
  });
});

describe('AdminJobsService.update', () => {
  /**
   * As skills são substituídas, não somadas: sem apagar antes, editar uma vaga
   * acumularia as antigas com as novas e o match do candidato sairia errado.
   */
  it('informar skills novas apaga as anteriores antes de gravar', async () => {
    const { service, prisma } = buildService();

    await service.update(ADMIN, JOB_ID, { skillIds: [9] });

    expect(prisma.jobSkillRequirement.deleteMany).toHaveBeenCalledWith({
      where: { jobId: JOB_ID },
    });
  });

  it('atualizar sem mexer em skills não apaga as existentes', async () => {
    const { service, prisma } = buildService();

    await service.update(ADMIN, JOB_ID, { title: 'Outro título' });

    expect(prisma.jobSkillRequirement.deleteMany).not.toHaveBeenCalled();
  });

  it('vaga inexistente é 404', async () => {
    const { service } = buildService([]);
    await expect(
      service.update(ADMIN, 999, { title: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('AdminJobsService.remove', () => {
  it('apaga e registra no audit log', async () => {
    const { service, ids, auditLog } = buildService();

    await service.remove(ADMIN, JOB_ID);

    expect(ids.has(JOB_ID)).toBe(false);
    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'delete_job',
      'Job',
      JOB_ID,
    );
  });

  it('apagar inexistente é 404', async () => {
    const { service } = buildService([]);
    await expect(service.remove(ADMIN, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
