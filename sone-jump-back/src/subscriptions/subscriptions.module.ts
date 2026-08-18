import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { DevOnlyGuard } from './guards/dev-only.guard';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [AuthModule, ReferralsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, DevOnlyGuard],
})
export class SubscriptionsModule {}
