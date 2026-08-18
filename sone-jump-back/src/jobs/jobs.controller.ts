import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { ListJobsDto } from './dto/list-jobs.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListJobsDto) {
    return this.jobsService.list(user.id, query);
  }

  @Get('applications')
  listApplications(@CurrentUser() user: AuthenticatedUser) {
    return this.jobsService.listMyApplications(user.id);
  }

  @Post(':id/apply')
  apply(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jobsService.apply(user.id, id);
  }
}
