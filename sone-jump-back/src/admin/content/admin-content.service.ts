import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class AdminContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  list() {
    return this.prisma.contentItem.findMany({
      include: {
        prerequisites: true,
        syllabus: { orderBy: { orderIndex: 'asc' } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async create(adminUserId: number, dto: CreateContentDto) {
    const item = await this.prisma.contentItem.create({
      data: {
        title: dto.title,
        platform: dto.platform,
        type: dto.type,
        durationMinutes: dto.durationMinutes,
        level: dto.level,
        status: dto.status,
        description: dto.description,
        url: dto.url,
        thumbnailEmoji: dto.thumbnailEmoji,
        prerequisites: dto.prerequisites
          ? { create: dto.prerequisites.map((label) => ({ label })) }
          : undefined,
        syllabus: dto.syllabus
          ? {
              create: dto.syllabus.map((s, orderIndex) => ({
                title: s.title,
                orderIndex,
              })),
            }
          : undefined,
      },
    });
    await this.auditLog.record(
      adminUserId,
      'create_content',
      'ContentItem',
      item.id,
    );
    return item;
  }

  async update(adminUserId: number, contentId: number, dto: UpdateContentDto) {
    await this.assertExists(contentId);
    const item = await this.prisma.contentItem.update({
      where: { id: contentId },
      data: {
        title: dto.title,
        platform: dto.platform,
        type: dto.type,
        durationMinutes: dto.durationMinutes,
        level: dto.level,
        status: dto.status,
        description: dto.description,
        url: dto.url,
        thumbnailEmoji: dto.thumbnailEmoji,
      },
    });
    await this.auditLog.record(
      adminUserId,
      'update_content',
      'ContentItem',
      contentId,
    );
    return item;
  }

  async remove(adminUserId: number, contentId: number): Promise<void> {
    await this.assertExists(contentId);
    await this.prisma.contentItem.delete({ where: { id: contentId } });
    await this.auditLog.record(
      adminUserId,
      'delete_content',
      'ContentItem',
      contentId,
    );
  }

  private async assertExists(contentId: number) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id: contentId },
    });
    if (!item) throw new NotFoundException('Conteúdo não encontrado.');
    return item;
  }
}
