import {
  Body,
  Controller,
  Delete,
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
import { CreateGoalDto } from './dto/create-goal.dto';
import { LogStudySessionDto } from './dto/log-study-session.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.summary(user.id);
  }

  @Post('sessions')
  logSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogStudySessionDto,
  ) {
    return this.progressService.logSession(user.id, dto);
  }

  @Get('sessions')
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.listSessions(user.id);
  }

  @Post('goals')
  createGoal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGoalDto,
  ) {
    return this.progressService.createGoal(user.id, dto);
  }

  @Get('goals')
  listGoals(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.listGoals(user.id);
  }

  @Patch('goals/:id')
  updateGoal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.progressService.updateGoal(user.id, id, dto);
  }

  @Delete('goals/:id')
  deleteGoal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.progressService.deleteGoal(user.id, id);
  }
}
