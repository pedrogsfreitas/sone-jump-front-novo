import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateRoadmapProgressDto } from './dto/update-roadmap-progress.dto';
import { RoadmapService } from './roadmap.service';

@Controller('roadmap')
@UseGuards(JwtAuthGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.roadmapService.listForUser(user.id);
  }

  @Patch('nodes/:id')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRoadmapProgressDto,
  ) {
    return this.roadmapService.updateStatus(user.id, id, dto.status);
  }

  @Post('nodes/:id/confirm-study')
  @HttpCode(HttpStatus.OK)
  confirmStudy(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.roadmapService.confirmStudy(user.id, id);
  }

  /** Devolve `{ passed, roadmap }` — nunca qual era a alternativa correta. */
  @Post('nodes/:id/quiz')
  @HttpCode(HttpStatus.OK)
  submitQuiz(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.roadmapService.gradeQuiz(user.id, id, dto.answers);
  }
}
