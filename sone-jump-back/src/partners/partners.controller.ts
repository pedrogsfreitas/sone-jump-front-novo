import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PartnersService } from './partners.service';

/** Full CRUD (create/edit/pending-approval) is an admin feature — built in Phase 6. */
@Controller('partners')
@UseGuards(JwtAuthGuard)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  list() {
    return this.partnersService.list();
  }
}
