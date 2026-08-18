import { Injectable, NotFoundException } from '@nestjs/common';
import { PartnerStatus } from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class AdminPartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  list() {
    return this.prisma.partner.findMany({ orderBy: { id: 'asc' } });
  }

  async create(adminUserId: number, dto: CreatePartnerDto) {
    const partner = await this.prisma.partner.create({
      data: {
        name: dto.name,
        type: dto.type,
        status: dto.status ?? PartnerStatus.PENDENTE,
        description: dto.description,
        logoUrl: dto.logoUrl,
      },
    });
    await this.auditLog.record(
      adminUserId,
      'create_partner',
      'Partner',
      partner.id,
    );
    return partner;
  }

  async update(adminUserId: number, partnerId: number, dto: UpdatePartnerDto) {
    await this.assertExists(partnerId);
    const partner = await this.prisma.partner.update({
      where: { id: partnerId },
      data: dto,
    });
    await this.auditLog.record(
      adminUserId,
      'update_partner',
      'Partner',
      partnerId,
      { ...dto },
    );
    return partner;
  }

  async remove(adminUserId: number, partnerId: number): Promise<void> {
    await this.assertExists(partnerId);
    await this.prisma.partner.delete({ where: { id: partnerId } });
    await this.auditLog.record(
      adminUserId,
      'delete_partner',
      'Partner',
      partnerId,
    );
  }

  private async assertExists(partnerId: number) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!partner) throw new NotFoundException('Parceiro não encontrado.');
    return partner;
  }
}
