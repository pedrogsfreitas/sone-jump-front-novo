import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CareersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.career.findMany({ orderBy: { title: 'asc' } });
  }
}
