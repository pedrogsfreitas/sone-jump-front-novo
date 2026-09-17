import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { AdminGroupsService } from './admin-groups.service';

const ADMIN = 99;

interface MockGroup {
  id: number;
  name: string;
  icon: string | null;
}

function buildService(
  groups: MockGroup[] = [],
  postsByGroup: Record<number, number> = {},
) {
  const rows = [...groups];
  let nextId = rows.length + 1;

  const prisma = {
    group: {
      findMany: jest.fn(({ take, skip }: { take?: number; skip?: number }) =>
        Promise.resolve(
          [...rows]
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(skip ?? 0, (skip ?? 0) + (take ?? 100))
            .map((g) => ({
              ...g,
              _count: { members: 0, posts: postsByGroup[g.id] ?? 0 },
            })),
        ),
      ),
      findUnique: jest.fn(
        ({ where }: { where: { id?: number; name?: string } }) =>
          Promise.resolve(
            rows.find(
              (g) =>
                (where.id !== undefined && g.id === where.id) ||
                (where.name !== undefined && g.name === where.name),
            ) ?? null,
          ),
      ),
      create: jest.fn(({ data }: { data: { name: string; icon?: string } }) => {
        const row = { id: nextId++, name: data.name, icon: data.icon ?? null };
        rows.push(row);
        return Promise.resolve(row);
      }),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: number };
          data: Partial<MockGroup>;
        }) => {
          const row = rows.find((g) => g.id === where.id)!;
          if (data.name !== undefined) row.name = data.name;
          if (data.icon !== undefined) row.icon = data.icon;
          return Promise.resolve(row);
        },
      ),
      delete: jest.fn(({ where }: { where: { id: number } }) => {
        const i = rows.findIndex((g) => g.id === where.id);
        const [removed] = rows.splice(i, 1);
        return Promise.resolve(removed);
      }),
    },
    post: {
      count: jest.fn(({ where }: { where: { groupId: number } }) =>
        Promise.resolve(postsByGroup[where.groupId] ?? 0),
      ),
    },
  };

  const auditLog = { record: jest.fn(() => Promise.resolve({})) };
  const service = new AdminGroupsService(
    prisma as unknown as PrismaService,
    auditLog as unknown as AuditLogService,
  );

  return { service, rows, auditLog };
}

function group(id: number, name: string): MockGroup {
  return { id, name, icon: '🚀' };
}

describe('AdminGroupsService — criar', () => {
  it('cria o grupo e registra no audit log', async () => {
    const { service, rows, auditLog } = buildService();

    const criado = await service.create(ADMIN, { name: 'Dados', icon: '📊' });

    expect(rows).toHaveLength(1);
    expect(criado.name).toBe('Dados');
    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'create_group',
      'Group',
      criado.id,
    );
  });

  it('nome repetido é 409, e não erro de banco', async () => {
    const { service, rows } = buildService([group(1, 'Front-end')]);

    await expect(service.create(ADMIN, { name: 'Front-end' })).rejects.toThrow(
      'Já existe um grupo com esse nome.',
    );
    expect(rows).toHaveLength(1);
  });

  it('ícone é opcional', async () => {
    const { service } = buildService();
    expect((await service.create(ADMIN, { name: 'Mobile' })).icon).toBeNull();
  });
});

describe('AdminGroupsService — atualizar', () => {
  it('renomeia o grupo', async () => {
    const { service } = buildService([group(1, 'Front')]);

    const atualizado = await service.update(ADMIN, 1, { name: 'Front-end' });

    expect(atualizado.name).toBe('Front-end');
  });

  it('manter o próprio nome não dispara conflito', async () => {
    const { service } = buildService([group(1, 'Front-end')]);
    await expect(
      service.update(ADMIN, 1, { name: 'Front-end', icon: '🎨' }),
    ).resolves.toMatchObject({ icon: '🎨' });
  });

  it('usar o nome de outro grupo é 409', async () => {
    const { service } = buildService([
      group(1, 'Front-end'),
      group(2, 'Back-end'),
    ]);

    await expect(
      service.update(ADMIN, 2, { name: 'Front-end' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('grupo inexistente é 404', async () => {
    const { service } = buildService();
    await expect(
      service.update(ADMIN, 404, { name: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('AdminGroupsService — apagar', () => {
  /**
   * A regra que mais importa aqui: `Post.groupId` é cascade, então apagar um grupo
   * com publicações destruiria conteúdo escrito pelos alunos sem aviso.
   */
  it('grupo com publicações não é apagado, e a mensagem diz quantas são', async () => {
    const { service, rows } = buildService([group(1, 'Front-end')], { 1: 12 });

    await expect(service.remove(ADMIN, 1)).rejects.toThrow(
      'Grupo tem 12 publicação(ões) e não pode ser apagado. Remova as publicações antes.',
    );
    expect(rows).toHaveLength(1);
  });

  it('grupo vazio é apagado e registrado no audit log', async () => {
    const { service, rows, auditLog } = buildService([group(1, 'Front-end')]);

    await service.remove(ADMIN, 1);

    expect(rows).toHaveLength(0);
    expect(auditLog.record).toHaveBeenCalledWith(
      ADMIN,
      'delete_group',
      'Group',
      1,
    );
  });

  it('grupo inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.remove(ADMIN, 404)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('AdminGroupsService — listar', () => {
  it('traz contagem de membros e de publicações', async () => {
    const { service } = buildService(
      [group(1, 'Front-end'), group(2, 'Back-end')],
      { 1: 3 },
    );

    const lista = await service.list({ limit: 100, offset: 0 });

    expect(lista.map((g) => [g.name, g.postsCount])).toEqual([
      ['Back-end', 0],
      ['Front-end', 3],
    ]);
  });
});
