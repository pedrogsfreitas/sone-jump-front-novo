import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CommunityService } from './community.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  listPosts(@CurrentUser() user: AuthenticatedUser) {
    return this.communityService.listPosts(user.id);
  }

  @Post('posts')
  createPost(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePostDto,
  ) {
    return this.communityService.createPost(user.id, dto);
  }

  @Delete('posts/:id')
  deletePost(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.communityService.deletePost(user.id, id);
  }

  @Put('posts/:id/like')
  like(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.communityService.like(user.id, id);
  }

  @Delete('posts/:id/like')
  unlike(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.communityService.unlike(user.id, id);
  }

  @Get('posts/:id/comments')
  listComments(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.listComments(id);
  }

  @Post('posts/:id/comments')
  addComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.communityService.addComment(user.id, id, dto);
  }

  @Get('groups')
  listGroups(@CurrentUser() user: AuthenticatedUser) {
    return this.communityService.listGroups(user.id);
  }

  @Put('groups/:id/join')
  joinGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.communityService.joinGroup(user.id, id);
  }

  @Delete('groups/:id/join')
  leaveGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.communityService.leaveGroup(user.id, id);
  }
}
