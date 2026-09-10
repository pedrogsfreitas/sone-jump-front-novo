import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { BecomeMentorDto } from './dto/become-mentor.dto';
import { MentorsService } from './mentors.service';
import { FullListQueryDto } from '../common/pagination/pagination.dto';

@Controller('mentors')
@UseGuards(JwtAuthGuard)
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Get()
  list(@Query() query: FullListQueryDto) {
    return this.mentorsService.list(query);
  }

  @Post('become')
  becomeMentor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BecomeMentorDto,
  ) {
    return this.mentorsService.becomeMentor(user.id, dto);
  }
}
