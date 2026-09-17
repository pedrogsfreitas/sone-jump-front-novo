import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';
import { FullListQueryDto } from '../../common/pagination/pagination.dto';
import { AdminGroupsService } from './admin-groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('admin/groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminGroupsController {
  constructor(private readonly adminGroupsService: AdminGroupsService) {}

  @Get()
  list(@Query() query: FullListQueryDto) {
    return this.adminGroupsService.list(query);
  }

  @Post()
  create(@CurrentUser() admin: AuthenticatedUser, @Body() dto: CreateGroupDto) {
    return this.adminGroupsService.create(admin.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.adminGroupsService.update(admin.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminGroupsService.remove(admin.id, id);
  }
}
