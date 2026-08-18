import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { SimulatePaymentDto } from './dto/simulate-payment.dto';
import { DevOnlyGuard } from './guards/dev-only.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getMine(user.id);
  }

  @Post('checkout')
  checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.subscriptionsService.checkout(user.id, dto);
  }

  @Post('cancel')
  cancel(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.cancel(user.id);
  }

  @Post('payments/:id/simulate')
  @UseGuards(DevOnlyGuard)
  simulatePayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SimulatePaymentDto,
  ) {
    return this.subscriptionsService.simulatePayment(user.id, id, dto.outcome);
  }
}
