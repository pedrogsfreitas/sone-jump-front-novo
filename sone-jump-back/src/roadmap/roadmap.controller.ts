import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { UpdateRoadmapProgressDto } from './dto/update-roadmap-progress.dto';
import { RoadmapService } from './roadmap.service';

@Controller('roadmap')
@UseGuards(JwtAuthGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.roadmapService.listForUser(user.id);
  }

  @Patch('nodes/:id')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRoadmapProgressDto,
  ) {
    return this.roadmapService.updateStatus(user.id, id, dto.status);
  }
}
