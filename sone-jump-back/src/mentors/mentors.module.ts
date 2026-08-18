import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';

@Module({
  imports: [AuthModule],
  controllers: [MentorsController],
  providers: [MentorsService],
})
export class MentorsModule {}
