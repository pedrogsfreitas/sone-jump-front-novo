import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';

@Module({
  imports: [AuthModule],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}
