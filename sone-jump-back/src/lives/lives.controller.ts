import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CreateLiveDto } from './dto/create-live.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateLiveStatusDto } from './dto/update-live-status.dto';
import { LivesService } from './lives.service';

@Controller('lives')
@UseGuards(JwtAuthGuard)
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  @Get()
  list() {
    return this.livesService.list();
  }

  @Get('recordings')
  listRecordings() {
    return this.livesService.listRecordings();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.MENTOR, Role.ADMIN)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateLiveDto) {
    return this.livesService.create(user.id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLiveStatusDto,
  ) {
    return this.livesService.updateStatus(
      user.id,
      user.role === Role.ADMIN,
      id,
      dto.status,
    );
  }

  @Get(':id/questions')
  listQuestions(@Param('id', ParseIntPipe) id: number) {
    return this.livesService.listQuestions(id);
  }

  @Post(':id/questions')
  addQuestion(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.livesService.addQuestion(user.id, id, dto);
  }

  @Put('questions/:questionId/upvote')
  upvote(
    @CurrentUser() user: AuthenticatedUser,
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    return this.livesService.upvote(user.id, questionId);
  }
}
