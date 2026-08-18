import { Injectable } from '@nestjs/common';
import { PartnerStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.partner.findMany({
      where: { status: PartnerStatus.ATIVO },
      orderBy: { name: 'asc' },
    });
  }
}
