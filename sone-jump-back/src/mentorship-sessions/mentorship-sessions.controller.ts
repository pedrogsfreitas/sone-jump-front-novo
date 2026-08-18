import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { ConfirmSessionDto } from './dto/confirm-session.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { MentorshipSessionsService } from './mentorship-sessions.service';

@Controller('mentorship-sessions')
@UseGuards(JwtAuthGuard)
export class MentorshipSessionsController {
  constructor(
    private readonly mentorshipSessionsService: MentorshipSessionsService,
  ) {}

  @Post()
  request(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSessionDto,
  ) {
    return this.mentorshipSessionsService.request(user.id, dto);
  }

  @Get('mine')
  listAsMentee(@CurrentUser() user: AuthenticatedUser) {
    return this.mentorshipSessionsService.listAsMentee(user.id);
  }

  @Get('hosting')
  listAsMentor(@CurrentUser() user: AuthenticatedUser) {
    return this.mentorshipSessionsService.listAsMentor(user.id);
  }

  @Patch(':id/confirm')
  confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmSessionDto,
  ) {
    return this.mentorshipSessionsService.confirm(user.id, id, dto);
  }

  @Patch(':id/complete')
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mentorshipSessionsService.complete(user.id, id);
  }

  @Patch(':id/cancel')
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mentorshipSessionsService.cancel(user.id, id);
  }
}
