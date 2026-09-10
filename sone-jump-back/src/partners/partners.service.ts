import { Injectable } from '@nestjs/common';
import { PartnerStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { FullListQueryDto } from '../common/pagination/pagination.dto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: FullListQueryDto) {
    return this.prisma.partner.findMany({
      where: { status: PartnerStatus.ATIVO },
      orderBy: { name: 'asc' },
      take: query.limit,
      skip: query.offset,
    });
  }
}
