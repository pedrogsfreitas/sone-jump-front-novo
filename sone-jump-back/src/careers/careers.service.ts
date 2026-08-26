import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CareersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Carreira inativa some da listagem, mas continua existindo para quem já a seguia. */
  list() {
    return this.prisma.career.findMany({
      where: { active: true },
      orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
    });
  }
}
