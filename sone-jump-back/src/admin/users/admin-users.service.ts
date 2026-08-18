import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, SubscriptionStatus } from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Never select passwordHash/cpfHash/cpfEncrypted here — this service's responses
// go straight back over the API.
const SAFE_USER_SELECT = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  role: true,
  active: true,
  avatarColor: true,
} as const;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(search?: string) {
    const users = await this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { username: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        active: true,
        avatarColor: true,
        createdAt: true,
        lastAccessAt: true,
        subscriptions: {
          where: { status: SubscriptionStatus.ATIVA },
          select: { plan: { select: { key: true, name: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      active: user.active,
      avatarColor: user.avatarColor,
      plan: user.subscriptions[0]?.plan.key ?? 'FREE',
      registeredAt: user.createdAt,
      lastAccessAt: user.lastAccessAt,
    }));
  }

  async stats() {
    const [total, active, newLast30Days] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { active: true } }),
      this.prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - THIRTY_DAYS_MS) } },
      }),
    ]);
    return { total, active, inactive: total - active, newLast30Days };
  }

  async updateRole(adminUserId: number, targetUserId: number, role: Role) {
    await this.assertExists(targetUserId);
    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: SAFE_USER_SELECT,
    });
    await this.auditLog.record(
      adminUserId,
      'update_role',
      'User',
      targetUserId,
      { role },
    );
    return updated;
  }

  async updateActive(
    adminUserId: number,
    targetUserId: number,
    active: boolean,
  ) {
    if (adminUserId === targetUserId && !active) {
      throw new ForbiddenException('Você não pode suspender a própria conta.');
    }
    await this.assertExists(targetUserId);
    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { active },
      select: SAFE_USER_SELECT,
    });
    await this.auditLog.record(
      adminUserId,
      active ? 'reactivate_user' : 'suspend_user',
      'User',
      targetUserId,
    );
    return updated;
  }

  private async assertExists(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }
}
