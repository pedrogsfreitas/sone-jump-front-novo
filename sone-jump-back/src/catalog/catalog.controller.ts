import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CatalogService } from './catalog.service';
import { ListCatalogDto } from './dto/list-catalog.dto';

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListCatalogDto) {
    return this.catalogService.list(user.id, query);
  }

  @Get('bookmarks')
  listBookmarks(@CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.listBookmarked(user.id);
  }

  @Put(':id/bookmark')
  bookmark(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.catalogService.bookmark(user.id, id);
  }

  @Delete(':id/bookmark')
  unbookmark(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.catalogService.unbookmark(user.id, id);
  }
}
