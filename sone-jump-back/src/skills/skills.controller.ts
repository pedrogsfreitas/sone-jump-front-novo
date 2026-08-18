import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CreatePortfolioProjectDto } from './dto/create-portfolio-project.dto';
import { SkillsService } from './skills.service';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get('progress')
  listProgress(@CurrentUser() user: AuthenticatedUser) {
    return this.skillsService.listSkillProgress(user.id);
  }

  @Get('employability-score')
  employabilityScore(@CurrentUser() user: AuthenticatedUser) {
    return this.skillsService.employabilityScore(user.id);
  }

  @Get('challenges')
  listChallenges(@CurrentUser() user: AuthenticatedUser) {
    return this.skillsService.listChallenges(user.id);
  }

  @Post('challenges/:id/complete')
  completeChallenge(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.skillsService.completeChallenge(user.id, id);
  }

  @Get('portfolio')
  listPortfolio(@CurrentUser() user: AuthenticatedUser) {
    return this.skillsService.listPortfolio(user.id);
  }

  @Post('portfolio')
  createPortfolioProject(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePortfolioProjectDto,
  ) {
    return this.skillsService.createPortfolioProject(user.id, dto);
  }

  @Delete('portfolio/:id')
  deletePortfolioProject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.skillsService.deletePortfolioProject(user.id, id);
  }

  @Get('certifications')
  listCertifications(@CurrentUser() user: AuthenticatedUser) {
    return this.skillsService.listCertifications(user.id);
  }
}
