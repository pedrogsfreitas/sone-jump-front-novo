import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { AdminContentService } from './admin-content.service';
import { CreateContentDto } from './dto/create-content.dto';

const ADMIN = 1;

function buildService(existing: number[] = []) {
  const ids = new Set(existing);
  let nextId = Math.max(0, ...existing) + 1;
  const criados: Record<string, unknown>[] = [];

  const prisma = {
    contentItem: {
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(ids.has(where.id) ? { id: where.id } : null),
      ),
      create: jest.fn(({ data }: { data: Record<string, unknown> }) => {
        const row = { id: nextId++, ...data };
        criados.push(row);
        ids.add(row.id);
        return Promise.resolve(row);
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
  const service = new AdminContentService(
    prisma as unknown as PrismaService,
    auditLog as unknown as AuditLogService,
  );

  return { service, ids, criados, auditLog, prisma };
}

const base = {
  title: 'Curso de React',
  platform: 'YOUTUBE',
  type: 'VIDEO',
  level: 'INICIANTE',
  status: 'PUBLICADO',
  description: 'Fundamentos',
  url: 'https://exemplo.dev/react',
} as unknown as CreateContentDto;

describe('AdminContentService.create', () => {
  it('cria o conteúdo e registra no audit log', async () => {
    const { service, auditLog } = buildService();

    const item = await service.create(ADMIN, base);

    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'create_content',
      'ContentItem',
      item.id,
    );
  });

  /** A ementa é ordenada pela posição no array — quem cadastra não informa índice. */
  it('a ementa recebe o índice de ordem pela posição informada', async () => {
    const { service, criados } = buildService();

    await service.create(ADMIN, {
      ...base,
      syllabus: [{ title: 'Introdução' }, { title: 'Hooks' }],
    });

    expect(criados[0].syllabus).toEqual({
      create: [
        { title: 'Introdução', orderIndex: 0 },
        { title: 'Hooks', orderIndex: 1 },
      ],
    });
  });

  it('sem pré-requisitos nem ementa, nada é criado em cascata', async () => {
    const { service, criados } = buildService();

    await service.create(ADMIN, base);

    expect(criados[0].prerequisites).toBeUndefined();
    expect(criados[0].syllabus).toBeUndefined();
  });
});

describe('AdminContentService.update', () => {
  it('conteúdo inexistente é 404 e nada é atualizado', async () => {
    const { service, prisma } = buildService();

    await expect(
      service.update(ADMIN, 999, { title: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.contentItem.update).not.toHaveBeenCalled();
  });

  it('atualiza e registra no audit log', async () => {
    const { service, auditLog } = buildService([7]);

    const item = await service.update(ADMIN, 7, { title: 'Novo título' });

    expect(item.title).toBe('Novo título');
    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'update_content',
      'ContentItem',
      7,
    );
  });
});

describe('AdminContentService.remove', () => {
  it('apaga e registra no audit log', async () => {
    const { service, ids, auditLog } = buildService([7]);

    await service.remove(ADMIN, 7);

    expect(ids.has(7)).toBe(false);
    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'delete_content',
      'ContentItem',
      7,
    );
  });

  it('apagar inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.remove(ADMIN, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
