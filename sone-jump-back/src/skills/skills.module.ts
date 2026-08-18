import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { XpModule } from '../common/xp/xp.module';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports: [AuthModule, XpModule],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule {}
