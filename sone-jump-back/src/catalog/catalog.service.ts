import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ContentItem,
  ContentPrerequisite,
  ContentSyllabusItem,
} from '../../generated/prisma/client';
import { ContentStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ListCatalogDto } from './dto/list-catalog.dto';

type ContentItemWithRelations = ContentItem & {
  prerequisites: ContentPrerequisite[];
  syllabus: ContentSyllabusItem[];
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number, filters: ListCatalogDto) {
    const [items, bookmarks] = await Promise.all([
      this.prisma.contentItem.findMany({
        where: {
          type: filters.type,
          platform: filters.platform,
          status: ContentStatus.PUBLICADO,
        },
        include: {
          prerequisites: true,
          syllabus: { orderBy: { orderIndex: 'asc' } },
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.userBookmark.findMany({
        where: { userId },
        select: { contentId: true },
      }),
    ]);

    const bookmarkedIds = new Set(bookmarks.map((b) => b.contentId));
    return items.map((item) => this.toDto(item, bookmarkedIds.has(item.id)));
  }

  async listBookmarked(userId: number) {
    const bookmarks = await this.prisma.userBookmark.findMany({
      where: { userId },
      include: {
        content: { include: { prerequisites: true, syllabus: true } },
      },
    });
    return bookmarks.map((b) => this.toDto(b.content, true));
  }

  async bookmark(userId: number, contentId: number): Promise<void> {
    await this.assertExists(contentId);
    await this.prisma.userBookmark.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: {},
      create: { userId, contentId },
    });
  }

  async unbookmark(userId: number, contentId: number): Promise<void> {
    await this.prisma.userBookmark.deleteMany({ where: { userId, contentId } });
  }

  private async assertExists(contentId: number) {
    const exists = await this.prisma.contentItem.findUnique({
      where: { id: contentId },
    });
    if (!exists) throw new NotFoundException('Conteúdo não encontrado.');
  }

  private toDto(item: ContentItemWithRelations, bookmarked: boolean) {
    return {
      id: item.id,
      title: item.title,
      platform: item.platform,
      type: item.type,
      durationMinutes: item.durationMinutes,
      level: item.level,
      rating: item.rating,
      description: item.description,
      url: item.url,
      thumbnailEmoji: item.thumbnailEmoji,
      prerequisites: item.prerequisites.map((p) => p.label),
      syllabus: [...item.syllabus]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((s) => s.title),
      bookmarked,
    };
  }
}
