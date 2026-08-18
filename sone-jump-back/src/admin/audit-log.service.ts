import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  record(
    adminUserId: number,
    action: string,
    entityType: string,
    entityId?: string | number,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        adminUserId,
        action,
        entityType,
        entityId: entityId === undefined ? undefined : String(entityId),
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  list(take = 100) {
    return this.prisma.auditLog.findMany({
      include: {
        adminUser: { select: { id: true, username: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
