import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';

function buildService(total = 137) {
  const prisma = {
    auditLog: {
      create: jest.fn(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve(data),
      ),
      count: jest.fn(() => Promise.resolve(total)),
      findMany: jest.fn(({ take, skip }: { take: number; skip: number }) =>
        Promise.resolve(
          Array.from(
            { length: Math.min(take, Math.max(total - skip, 0)) },
            (_, i) => ({
              id: skip + i + 1,
            }),
          ),
        ),
      ),
    },
  };
  return {
    service: new AuditLogService(prisma as unknown as PrismaService),
    prisma,
  };
}

describe('AuditLogService.record', () => {
  it('guarda o id da entidade como texto, para servir a qualquer tabela', async () => {
    const { service, prisma } = buildService();

    await service.record(1, 'delete_group', 'Group', 42);

    const [args] = prisma.auditLog.create.mock.calls[0] as unknown as [
      { data: { entityId?: string; action: string } },
    ];
    expect(args.data).toMatchObject({ entityId: '42', action: 'delete_group' });
  });

  it('sem entidade, o campo fica indefinido em vez de virar a string "undefined"', async () => {
    const { service, prisma } = buildService();

    await service.record(1, 'export_report', 'Report');

    const { data } = prisma.auditLog.create.mock.calls[0][0];
    expect(data.entityId).toBeUndefined();
  });
});

describe('AuditLogService.list — paginação', () => {
  /**
   * O total é a contagem da tabela inteira, não da página: é ele que permite à
   * interface dizer "1–20 de 137" e saber quantas páginas existem.
   */
  it('devolve total, limite e deslocamento junto dos itens', async () => {
    const { service } = buildService(137);

    const pagina = await service.list({ limit: 20, offset: 40 });

    expect(pagina).toMatchObject({ total: 137, limit: 20, offset: 40 });
    expect(pagina.items).toHaveLength(20);
  });

  it('sem parâmetros, usa 20 itens a partir do começo', async () => {
    const { service, prisma } = buildService();

    const pagina = await service.list({});

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, skip: 0 }),
    );
    expect(pagina.limit).toBe(20);
  });

  it('última página devolve só o que resta', async () => {
    const { service } = buildService(45);
    expect((await service.list({ limit: 20, offset: 40 })).items).toHaveLength(
      5,
    );
  });
});
