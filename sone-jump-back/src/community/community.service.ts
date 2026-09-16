import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostType } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { FullListQueryDto } from '../common/pagination/pagination.dto';

const AUTHOR_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatarColor: true,
} as const;

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Três recortes, decididos pelos parâmetros:
   * - nada: feed geral, só o que foi publicado fora de grupos;
   * - `groupId`: feed daquele grupo — leitura aberta a qualquer usuário logado, para
   *   quem ainda não entrou poder ver do que se trata;
   * - `author=me`: tudo o que o próprio usuário publicou, em qualquer lugar, a menos
   *   que `groupId` restrinja a um grupo.
   *
   * O filtro por autor fica aqui, e não no front, porque o front recebe só uma página:
   * filtrando lá, publicações antigas sumiam de "Meus Posts" quando o feed crescia.
   */
  async listPosts(userId: number, query: ListPostsQueryDto) {
    if (query.groupId !== undefined)
      await this.assertGroupExists(query.groupId);

    const where =
      query.author === 'me'
        ? {
            authorId: userId,
            ...(query.groupId !== undefined && { groupId: query.groupId }),
          }
        : { groupId: query.groupId ?? null };

    const posts = await this.prisma.post.findMany({
      where,
      include: {
        author: { select: AUTHOR_SELECT },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId }, select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    });

    return posts.map((post) => ({
      id: post.id,
      type: post.type,
      content: post.content,
      createdAt: post.createdAt,
      groupId: post.groupId,
      author: post.author,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      likedByMe: post.likes.length > 0,
    }));
  }

  async createPost(userId: number, dto: CreatePostDto) {
    if (dto.groupId !== undefined) {
      await this.assertGroupExists(dto.groupId);
      const membership = await this.prisma.groupMember.findUnique({
        where: { userId_groupId: { userId, groupId: dto.groupId } },
      });
      if (!membership)
        throw new ForbiddenException('Entre no grupo para publicar nele.');
    }

    return this.prisma.post.create({
      data: {
        authorId: userId,
        type: dto.type ?? PostType.GENERAL,
        content: dto.content,
        groupId: dto.groupId,
      },
    });
  }

  async deletePost(userId: number, postId: number): Promise<void> {
    const post = await this.assertPostExists(postId);
    if (post.authorId !== userId)
      throw new ForbiddenException('Post não pertence a este usuário.');
    await this.prisma.post.delete({ where: { id: postId } });
  }

  async like(userId: number, postId: number): Promise<void> {
    await this.assertPostExists(postId);
    await this.prisma.postLike.upsert({
      where: { userId_postId: { userId, postId } },
      update: {},
      create: { userId, postId },
    });
  }

  async unlike(userId: number, postId: number): Promise<void> {
    await this.prisma.postLike.deleteMany({ where: { userId, postId } });
  }

  async listComments(postId: number, query: FullListQueryDto) {
    await this.assertPostExists(postId);
    return this.prisma.postComment.findMany({
      where: { postId },
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: { createdAt: 'asc' },
      take: query.limit,
      skip: query.offset,
    });
  }

  async addComment(userId: number, postId: number, dto: CreateCommentDto) {
    await this.assertPostExists(postId);
    return this.prisma.postComment.create({
      data: { postId, authorId: userId, content: dto.content },
      include: { author: { select: AUTHOR_SELECT } },
    });
  }

  async listGroups(userId: number) {
    const groups = await this.prisma.group.findMany({
      include: {
        _count: { select: { members: true } },
        members: { where: { userId }, select: { userId: true } },
      },
      orderBy: { name: 'asc' },
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      icon: group.icon,
      membersCount: group._count.members,
      joined: group.members.length > 0,
    }));
  }

  async joinGroup(userId: number, groupId: number): Promise<void> {
    await this.assertGroupExists(groupId);
    await this.prisma.groupMember.upsert({
      where: { userId_groupId: { userId, groupId } },
      update: {},
      create: { userId, groupId },
    });
  }

  async leaveGroup(userId: number, groupId: number): Promise<void> {
    await this.prisma.groupMember.deleteMany({ where: { userId, groupId } });
  }

  private async assertPostExists(postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post não encontrado.');
    return post;
  }

  private async assertGroupExists(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado.');
    return group;
  }
}
