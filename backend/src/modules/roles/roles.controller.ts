import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AssignPermissionsDto, CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) { }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }


  @Get(':id')
  findOne(
    @Param('id')id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  create(
    @Body()
    dto: CreateRoleDto,
  ) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id')id: string, @Body()
    dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id,dto);
  }

  @Delete(':id')
  remove(
    @Param('id')id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  assignPermissions(
    @Param('id')id: string, @Body()dto: AssignPermissionsDto) {
    return this.rolesService.assignPermissions(
      id, dto.permissionIds,
    );
  }
}