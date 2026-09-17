import { NotFoundException } from '@nestjs/common';
import {
  IntegrationType,
  PartnerStatus,
} from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { AdminPartnersService } from './admin-partners.service';

const ADMIN = 1;

function buildService(existing: number[] = []) {
  const ids = new Set(existing);
  let nextId = Math.max(0, ...existing) + 1;
  const escritos: Record<string, unknown>[] = [];

  const prisma = {
    partner: {
      findMany: jest.fn(() => Promise.resolve([])),
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
        }) => Promise.resolve({ id: where.id, ...data }),
      ),
      delete: jest.fn(({ where }: { where: { id: number } }) => {
        ids.delete(where.id);
        return Promise.resolve({ id: where.id });
      }),
    },
  };

  const auditLog = { record: jest.fn(() => Promise.resolve({})) };
  const service = new AdminPartnersService(
    prisma as unknown as PrismaService,
    auditLog as unknown as AuditLogService,
  );

  return { service, ids, escritos, auditLog };
}

describe('AdminPartnersService.create', () => {
  /** Parceiro novo nasce pendente: só entra na vitrine depois de aprovado. */
  it('sem status informado, entra como PENDENTE', async () => {
    const { service, escritos } = buildService();

    await service.create(ADMIN, {
      name: 'ACME',
      type: IntegrationType.CONTEUDO,
      description: 'Parceiro de conteúdo',
    });

    expect(escritos[0].status).toBe(PartnerStatus.PENDENTE);
  });

  it('status informado é respeitado', async () => {
    const { service, escritos } = buildService();

    await service.create(ADMIN, {
      name: 'ACME',
      type: IntegrationType.CONTEUDO,
      description: 'Parceiro de conteúdo',
      status: PartnerStatus.ATIVO,
    });

    expect(escritos[0].status).toBe(PartnerStatus.ATIVO);
  });

  it('registra a criação no audit log', async () => {
    const { service, auditLog } = buildService();

    const parceiro = await service.create(ADMIN, {
      name: 'ACME',
      type: IntegrationType.CONTEUDO,
      description: 'Parceiro de conteúdo',
    });

    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'create_partner',
      'Partner',
      parceiro.id,
    );
  });
});

describe('AdminPartnersService.update', () => {
  it('guarda no audit log o que foi alterado', async () => {
    const { service, auditLog } = buildService([5]);

    await service.update(ADMIN, 5, { status: PartnerStatus.ATIVO });

    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'update_partner',
      'Partner',
      5,
      {
        status: PartnerStatus.ATIVO,
      },
    );
  });

  it('parceiro inexistente é 404', async () => {
    const { service } = buildService();
    await expect(
      service.update(ADMIN, 999, { status: PartnerStatus.ATIVO }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('AdminPartnersService.remove', () => {
  it('apaga e registra no audit log', async () => {
    const { service, ids, auditLog } = buildService([5]);

    await service.remove(ADMIN, 5);

    expect(ids.has(5)).toBe(false);
    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'delete_partner',
      'Partner',
      5,
    );
  });

  it('apagar inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.remove(ADMIN, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
