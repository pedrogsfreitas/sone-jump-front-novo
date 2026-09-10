import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';
import { AdminJobsService } from './admin-jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FullListQueryDto } from '../../common/pagination/pagination.dto';

@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminJobsController {
  constructor(private readonly adminJobsService: AdminJobsService) {}

  @Get()
  list(@Query() query: FullListQueryDto) {
    return this.adminJobsService.list(query);
  }

  @Get(':id/applications')
  listApplications(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: FullListQueryDto,
  ) {
    return this.adminJobsService.listApplications(id, query);
  }

  @Patch('applications/:applicationId')
  updateApplicationStatus(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.adminJobsService.updateApplicationStatus(
      admin.id,
      applicationId,
      dto.status,
    );
  }

  @Post()
  create(@CurrentUser() admin: AuthenticatedUser, @Body() dto: CreateJobDto) {
    return this.adminJobsService.create(admin.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobDto,
  ) {
    return this.adminJobsService.update(admin.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminJobsService.remove(admin.id, id);
  }
}
