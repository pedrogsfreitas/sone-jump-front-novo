import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  find(@CurrentUser() user: AuthenticatedUser) {
    return this.onboardingService.find(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  save(@CurrentUser() user: AuthenticatedUser, @Body() dto: SaveOnboardingDto) {
    return this.onboardingService.save(user.id, dto);
  }
}
