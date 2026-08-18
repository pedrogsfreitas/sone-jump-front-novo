import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { XpModule } from '../common/xp/xp.module';
import { MentorshipSessionsController } from './mentorship-sessions.controller';
import { MentorshipSessionsService } from './mentorship-sessions.service';

@Module({
  imports: [AuthModule, XpModule],
  controllers: [MentorshipSessionsController],
  providers: [MentorshipSessionsService],
})
export class MentorshipSessionsModule {}
