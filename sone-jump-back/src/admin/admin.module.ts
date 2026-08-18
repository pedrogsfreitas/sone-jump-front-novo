import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminContentController } from './content/admin-content.controller';
import { AdminContentService } from './content/admin-content.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { AdminJobsController } from './jobs/admin-jobs.controller';
import { AdminJobsService } from './jobs/admin-jobs.service';
import { AdminPartnersController } from './partners/admin-partners.controller';
import { AdminPartnersService } from './partners/admin-partners.service';
import { AdminReportsController } from './reports/admin-reports.controller';
import { AdminReportsService } from './reports/admin-reports.service';
import { AdminTrailsController } from './trails/admin-trails.controller';
import { AdminTrailsService } from './trails/admin-trails.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AuditLogController,
    AdminUsersController,
    AdminContentController,
    AdminTrailsController,
    AdminPartnersController,
    AdminReportsController,
    AdminJobsController,
  ],
  providers: [
    AuditLogService,
    AdminUsersService,
    AdminContentService,
    AdminTrailsService,
    AdminPartnersService,
    AdminReportsService,
    AdminJobsService,
  ],
})
export class AdminModule {}
