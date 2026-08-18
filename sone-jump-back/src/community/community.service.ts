import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostType } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';

const AUTHOR_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatarColor: true,
} as const;

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async listPosts(userId: number) {
    const posts = await this.prisma.post.findMany({
      include: {
        author: { select: AUTHOR_SELECT },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId }, select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return posts.map((post) => ({
      id: post.id,
      type: post.type,
      content: post.content,
      createdAt: post.createdAt,
      author: post.author,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      likedByMe: post.likes.length > 0,
    }));
  }

  createPost(userId: number, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId: userId,
        type: dto.type ?? PostType.GENERAL,
        content: dto.content,
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

  async listComments(postId: number) {
    await this.assertPostExists(postId);
    return this.prisma.postComment.findMany({
      where: { postId },
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: { createdAt: 'asc' },
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
