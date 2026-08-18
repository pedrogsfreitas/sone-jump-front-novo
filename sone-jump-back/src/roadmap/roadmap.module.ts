import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { XpModule } from '../common/xp/xp.module';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';

@Module({
  imports: [AuthModule, XpModule],
  controllers: [RoadmapController],
  providers: [RoadmapService],
})
export class RoadmapModule {}
