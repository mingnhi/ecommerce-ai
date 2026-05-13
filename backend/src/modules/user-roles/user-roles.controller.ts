import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { UserRolesService } from './user-roles.service';
import { AssignRolesDto, CreateUserRoleDto } from './dto/user-role.dto';


@Controller()
export class UserRolesController {
  constructor(
    private readonly userRolesService:
      UserRolesService,
  ) { }

  @Get('user-roles')
  findAll() {
    return this.userRolesService.findAll();
  }

  @Get('user-roles/:id')
  findOne(
    @Param('id')id: string) {
    return this.userRolesService.findOne(id);
  }

  @Post('user-roles')
  create(
    @Body() dto: CreateUserRoleDto) {
    return this.userRolesService.create(dto);
  }

  @Delete('user-roles/:id')
  remove(
    @Param('id') id: string) {
    return this.userRolesService.remove(id);
  }

  @Get('users/:id/roles')
  findRolesByUser(
    @Param('id') id: string) {
    return this.userRolesService.findByUser(id);
  }

  @Post('users/:id/roles')
  assignRoles(
    @Param('id') id: string, @Body() dto: AssignRolesDto,
  ) {
    return this.userRolesService.assignRoles(
      id,
      dto.roleIds,
    );
  }
}