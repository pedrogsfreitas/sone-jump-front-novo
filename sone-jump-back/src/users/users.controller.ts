import { Body, Controller, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { SetCareerDto } from './dto/set-career.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

/**
 * Replaces the old `POST /api/users/user { id }` contract (never actually called by
 * the frontend today) with `GET/PATCH /api/users/me`, resolved from the JWT instead of
 * a client-supplied id. The old shape let anyone fetch anyone else's PII by guessing
 * ids — that's an IDOR, so it isn't reintroduced here even for compatibility.
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findMe(user.id);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMe(user.id, dto);
  }

  /** Escolher ou trocar a carreira — é ela que define qual roadmap o usuário percorre. */
  @Put('me/career')
  setCareer(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetCareerDto) {
    return this.usersService.setCareer(user.id, dto);
  }
}
