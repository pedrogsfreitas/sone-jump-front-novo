import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostType } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CommunityService } from './community.service';

const AUTOR = 1;
const OUTRO = 2;

interface MockPost {
  id: number;
  authorId: number;
  type: PostType;
  content: string;
  createdAt: Date;
}

interface MockLike {
  userId: number;
  postId: number;
}

function buildService(posts: MockPost[] = [], likes: MockLike[] = []) {
  const postRows = [...posts];
  const likeRows = [...likes];
  let nextId = postRows.length + 1;

  const prisma = {
    post: {
      findMany: jest.fn(({ take, skip }: { take?: number; skip?: number }) =>
        Promise.resolve(
          postRows.slice(skip ?? 0, (skip ?? 0) + (take ?? 20)).map((p) => ({
            ...p,
            author: { id: p.authorId, username: `user${p.authorId}` },
            _count: {
              likes: likeRows.filter((l) => l.postId === p.id).length,
              comments: 0,
            },
            // O serviço pede `likes` já filtrado pelo usuário da requisição; o mock
            // devolve a lista inteira do post e o teste passa o filtro explicitamente.
            likes: likeRows.filter((l) => l.postId === p.id),
          })),
        ),
      ),
      findUnique: jest.fn(({ where }: { where: { id: number } }) =>
        Promise.resolve(postRows.find((p) => p.id === where.id) ?? null),
      ),
      create: jest.fn(
        ({ data }: { data: Omit<MockPost, 'id' | 'createdAt'> }) => {
          const row = { id: nextId++, createdAt: new Date(), ...data };
          postRows.push(row);
          return Promise.resolve(row);
        },
      ),
      delete: jest.fn(({ where }: { where: { id: number } }) => {
        const i = postRows.findIndex((p) => p.id === where.id);
        const [removido] = postRows.splice(i, 1);
        return Promise.resolve(removido);
      }),
    },
    postLike: {
      upsert: jest.fn(({ create }: { create: MockLike }) => {
        const existe = likeRows.some(
          (l) => l.userId === create.userId && l.postId === create.postId,
        );
        if (!existe) likeRows.push(create);
        return Promise.resolve(create);
      }),
      deleteMany: jest.fn(({ where }: { where: MockLike }) => {
        const antes = likeRows.length;
        for (let i = likeRows.length - 1; i >= 0; i--) {
          if (
            likeRows[i].userId === where.userId &&
            likeRows[i].postId === where.postId
          ) {
            likeRows.splice(i, 1);
          }
        }
        return Promise.resolve({ count: antes - likeRows.length });
      }),
    },
  };

  const service = new CommunityService(prisma as unknown as PrismaService);
  return { service, postRows, likeRows };
}

function post(id: number, authorId: number): MockPost {
  return {
    id,
    authorId,
    type: PostType.GENERAL,
    content: `post ${id}`,
    createdAt: new Date('2026-09-01'),
  };
}

describe('CommunityService — propriedade do post', () => {
  /**
   * A regra que mais importa aqui: sem a checagem de autor, qualquer usuário
   * autenticado apagaria o post de qualquer outro só informando o id.
   */
  it('apagar post de outra pessoa é 403 e não remove nada', async () => {
    const { service, postRows } = buildService([post(1, AUTOR)]);

    await expect(service.deletePost(OUTRO, 1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(postRows).toHaveLength(1);
  });

  it('o autor apaga o próprio post', async () => {
    const { service, postRows } = buildService([post(1, AUTOR)]);

    await service.deletePost(AUTOR, 1);
    expect(postRows).toHaveLength(0);
  });

  it('apagar post inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.deletePost(AUTOR, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('CommunityService — curtidas', () => {
  it('curtir duas vezes não duplica a curtida', async () => {
    const { service, likeRows } = buildService([post(1, AUTOR)]);

    await service.like(OUTRO, 1);
    await service.like(OUTRO, 1);

    expect(likeRows).toHaveLength(1);
  });

  it('curtir post inexistente é 404', async () => {
    const { service } = buildService();
    await expect(service.like(OUTRO, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('descurtir remove só a própria curtida', async () => {
    const { service, likeRows } = buildService(
      [post(1, AUTOR)],
      [
        { userId: AUTOR, postId: 1 },
        { userId: OUTRO, postId: 1 },
      ],
    );

    await service.unlike(OUTRO, 1);

    expect(likeRows).toEqual([{ userId: AUTOR, postId: 1 }]);
  });
});

describe('CommunityService — listagem', () => {
  it('respeita o limite e o deslocamento pedidos', async () => {
    const { service } = buildService(
      Array.from({ length: 10 }, (_, i) => post(i + 1, AUTOR)),
    );

    const primeira = await service.listPosts(AUTOR, { limit: 4, offset: 0 });
    const segunda = await service.listPosts(AUTOR, { limit: 4, offset: 4 });

    expect(primeira).toHaveLength(4);
    expect(segunda).toHaveLength(4);
    expect(primeira[0].id).not.toBe(segunda[0].id);
  });

  it('devolve a contagem de curtidas junto do post', async () => {
    const { service } = buildService(
      [post(1, AUTOR)],
      [
        { userId: AUTOR, postId: 1 },
        { userId: OUTRO, postId: 1 },
      ],
    );

    const [primeiro] = await service.listPosts(AUTOR, { limit: 10, offset: 0 });
    expect(primeiro.likesCount).toBe(2);
  });
});
