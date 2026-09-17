import { NotFoundException } from '@nestjs/common';
import { ContentStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogService } from './catalog.service';

const USER_ID = 1;

function item(id: number, over: Record<string, unknown> = {}) {
  return {
    id,
    title: `Conteúdo ${id}`,
    platform: 'YOUTUBE',
    type: 'VIDEO',
    durationMinutes: 30,
    level: 'INICIANTE',
    rating: null,
    description: '',
    url: 'https://exemplo.dev',
    thumbnailEmoji: '🎥',
    prerequisites: [],
    syllabus: [],
    ...over,
  };
}

function buildService(items = [item(1)], bookmarked: number[] = []) {
  const marcados = new Set(bookmarked);

  const prisma = {
    contentItem: {
      findMany: jest.fn(() => Promise.resolve(items)),
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(items.find((i) => i.id === where.id) ?? null),
      ),
    },
    userBookmark: {
      findMany: jest.fn(() =>
        Promise.resolve([...marcados].map((contentId) => ({ contentId }))),
      ),
      upsert: jest.fn(({ create }: { create: { contentId: number } }) => {
        marcados.add(create.contentId);
        return Promise.resolve(create);
      }),
      deleteMany: jest.fn(({ where }: { where: { contentId: number } }) => {
        marcados.delete(where.contentId);
        return Promise.resolve({ count: 1 });
      }),
    },
  };

  return {
    service: new CatalogService(prisma as unknown as PrismaService),
    marcados,
    prisma,
  };
}

describe('CatalogService.list', () => {
  /** Rascunho e arquivado não podem vazar para o catálogo do aluno. */
  it('lista só conteúdo publicado', async () => {
    const { service, prisma } = buildService();

    await service.list(USER_ID, {});

    const [args] = prisma.contentItem.findMany.mock.calls[0] as unknown as [
      { where: { status: string } },
    ];
    expect(args.where.status).toBe(ContentStatus.PUBLICADO);
  });

  it('marca como favoritado o que está na lista do usuário', async () => {
    const { service } = buildService([item(1), item(2)], [2]);

    const lista = await service.list(USER_ID, {});

    expect(lista.map((i) => [i.id, i.bookmarked])).toEqual([
      [1, false],
      [2, true],
    ]);
  });

  it('ementa sai na ordem definida, não na ordem que veio do banco', async () => {
    const { service } = buildService([
      item(1, {
        syllabus: [
          { title: 'Segundo', orderIndex: 1 },
          { title: 'Primeiro', orderIndex: 0 },
        ],
      }),
    ]);

    expect((await service.list(USER_ID, {}))[0].syllabus).toEqual([
      'Primeiro',
      'Segundo',
    ]);
  });
});

describe('CatalogService — favoritos', () => {
  it('favoritar duas vezes não duplica', async () => {
    const { service, marcados, prisma } = buildService();

    await service.bookmark(USER_ID, 1);
    await service.bookmark(USER_ID, 1);

    expect(marcados.size).toBe(1);
    expect(prisma.userBookmark.upsert).toHaveBeenCalledTimes(2);
  });

  it('favoritar conteúdo inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.bookmark(USER_ID, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('desfavoritar o que não estava favoritado não quebra', async () => {
    const { service } = buildService();
    await expect(service.unbookmark(USER_ID, 1)).resolves.toBeUndefined();
  });
});
