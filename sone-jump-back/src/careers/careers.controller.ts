import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CareersService } from './careers.service';

@Controller('careers')
@UseGuards(JwtAuthGuard)
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  list() {
    return this.careersService.list();
  }
}
