import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminReportsService } from './admin-reports.service';
import { DateRangeDto } from './dto/date-range.dto';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminReportsService.dashboard();
  }

  @Get('overview')
  overview(@Query() query: DateRangeDto) {
    return this.adminReportsService.overview(query.fromDate, query.toDate);
  }

  @Get('funnel')
  funnel(@Query() query: DateRangeDto) {
    return this.adminReportsService.funnel(query.fromDate, query.toDate);
  }

  @Get('cohorts')
  cohorts() {
    return this.adminReportsService.cohorts();
  }
}
