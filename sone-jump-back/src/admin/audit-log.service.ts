import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import {
  Paginated,
  PaginationQueryDto,
} from '../common/pagination/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

type AuditLogEntry = Prisma.AuditLogGetPayload<{
  include: {
    adminUser: { select: { id: true; username: true; fullName: true } };
  };
}>;

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

  /**
   * O audit log é a tabela que mais cresce e nunca é limpa — cada ação de admin
   * acrescenta uma linha para sempre. Antes havia um `take` fixo de 100 sem `skip`,
   * o que tinha dois defeitos ao mesmo tempo: não dava para ver nada além das 100
   * mais recentes, e a resposta crescia até esse teto sem a interface saber o total.
   */
  async list(query: PaginationQueryDto): Promise<Paginated<AuditLogEntry>> {
    const { limit = 20, offset = 0 } = query;

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        include: {
          adminUser: { select: { id: true, username: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    return { items, total, limit, offset };
  }
}
