import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { XpModule } from '../common/xp/xp.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [AuthModule, XpModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
