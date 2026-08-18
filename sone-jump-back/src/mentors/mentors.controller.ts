import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { BecomeMentorDto } from './dto/become-mentor.dto';
import { MentorsService } from './mentors.service';

@Controller('mentors')
@UseGuards(JwtAuthGuard)
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Get()
  list() {
    return this.mentorsService.list();
  }

  @Post('become')
  becomeMentor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BecomeMentorDto,
  ) {
    return this.mentorsService.becomeMentor(user.id, dto);
  }
}
