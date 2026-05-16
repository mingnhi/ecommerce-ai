import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/guards/roles.decorator';
import { ApiResponse } from '@common/interfaces/api-response.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    const data = await this.permissionsService.findAll();

    return {
      status: 'success',
      message: 'Get permissions successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const data = await this.permissionsService.findOne(id);

    return {
      status: 'success',
      message: 'Get permission successfully',
      data,
    };
  }

  @Post()
  async create(
    @Body() dto: CreatePermissionDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.permissionsService.create(dto);

    return {
      status: 'success',
      message: 'Create permission successfully',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.permissionsService.update(id, dto);

    return {
      status: 'success',
      message: 'Update permission successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const data = await this.permissionsService.remove(id);

    return {
      status: 'success',
      message: 'Delete permission successfully',
      data,
    };
  }
}
