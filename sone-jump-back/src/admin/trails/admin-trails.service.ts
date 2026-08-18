import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { CreateTrailModuleDto } from './dto/create-trail-module.dto';
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';

@Injectable()
export class AdminTrailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * `enrolled`/`completion` aren't wired to real per-user tracking yet — Trail is a
   * lightweight admin content grouping distinct from the RoadmapNode graph students
   * actually progress through (see README). Both fields are 0 until that's built.
   */
  async list() {
    const trails = await this.prisma.trail.findMany({
      include: { modules: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { id: 'asc' },
    });
    return trails.map((trail) => ({ ...trail, enrolled: 0, completion: 0 }));
  }

  async create(adminUserId: number, dto: CreateTrailDto) {
    const trail = await this.prisma.trail.create({
      data: {
        name: dto.name,
        category: dto.category,
        active: dto.active ?? true,
      },
    });
    await this.auditLog.record(adminUserId, 'create_trail', 'Trail', trail.id);
    return trail;
  }

  async update(adminUserId: number, trailId: number, dto: UpdateTrailDto) {
    await this.assertExists(trailId);
    const trail = await this.prisma.trail.update({
      where: { id: trailId },
      data: dto,
    });
    await this.auditLog.record(adminUserId, 'update_trail', 'Trail', trailId, {
      ...dto,
    });
    return trail;
  }

  async remove(adminUserId: number, trailId: number): Promise<void> {
    await this.assertExists(trailId);
    await this.prisma.trail.delete({ where: { id: trailId } });
    await this.auditLog.record(adminUserId, 'delete_trail', 'Trail', trailId);
  }

  async addModule(
    adminUserId: number,
    trailId: number,
    dto: CreateTrailModuleDto,
  ) {
    await this.assertExists(trailId);
    const orderIndex = await this.prisma.trailModule.count({
      where: { trailId },
    });
    const module_ = await this.prisma.trailModule.create({
      data: {
        trailId,
        title: dto.title,
        durationMinutes: dto.durationMinutes,
        lessons: dto.lessons,
        orderIndex,
      },
    });
    await this.auditLog.record(
      adminUserId,
      'add_trail_module',
      'TrailModule',
      module_.id,
      { trailId },
    );
    return module_;
  }

  async removeModule(adminUserId: number, moduleId: number): Promise<void> {
    const module_ = await this.prisma.trailModule.findUnique({
      where: { id: moduleId },
    });
    if (!module_) throw new NotFoundException('Módulo não encontrado.');
    await this.prisma.trailModule.delete({ where: { id: moduleId } });
    await this.auditLog.record(
      adminUserId,
      'remove_trail_module',
      'TrailModule',
      moduleId,
    );
  }

  private async assertExists(trailId: number) {
    const trail = await this.prisma.trail.findUnique({
      where: { id: trailId },
    });
    if (!trail) throw new NotFoundException('Trilha não encontrada.');
    return trail;
  }
}
