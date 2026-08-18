import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LivesController } from './lives.controller';
import { LivesService } from './lives.service';

@Module({
  imports: [AuthModule],
  controllers: [LivesController],
  providers: [LivesService],
})
export class LivesModule {}
