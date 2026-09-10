import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PartnersService } from './partners.service';
import { FullListQueryDto } from '../common/pagination/pagination.dto';

/** Full CRUD (create/edit/pending-approval) is an admin feature — built in Phase 6. */
@Controller('partners')
@UseGuards(JwtAuthGuard)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  list(@Query() query: FullListQueryDto) {
    return this.partnersService.list(query);
  }
}
