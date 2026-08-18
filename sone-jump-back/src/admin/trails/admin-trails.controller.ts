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
import { Role } from '../../../generated/prisma/enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';
import { AdminTrailsService } from './admin-trails.service';
import { CreateTrailModuleDto } from './dto/create-trail-module.dto';
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';

@Controller('admin/trails')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminTrailsController {
  constructor(private readonly adminTrailsService: AdminTrailsService) {}

  @Get()
  list() {
    return this.adminTrailsService.list();
  }

  @Post()
  create(@CurrentUser() admin: AuthenticatedUser, @Body() dto: CreateTrailDto) {
    return this.adminTrailsService.create(admin.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrailDto,
  ) {
    return this.adminTrailsService.update(admin.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminTrailsService.remove(admin.id, id);
  }

  @Post(':id/modules')
  addModule(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTrailModuleDto,
  ) {
    return this.adminTrailsService.addModule(admin.id, id, dto);
  }

  @Delete('modules/:moduleId')
  removeModule(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.adminTrailsService.removeModule(admin.id, moduleId);
  }
}
