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
  async findAll(): Promise<ApiResponse<PermissionResponse[]>> {
    const data = await this.permissionsService.findAll();

    return {
      status: 'success',
      message: 'Permissions retrieved successfully',
      data,
      meta: {
        count: data.length,
      },
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<PermissionResponse>> {
    const data = await this.permissionsService.findOne(id);

    return {
      status: 'success',
      message: 'Permission retrieved successfully',
      data,
    };
  }


  @Post()
  async create(
    @Body() dto: CreatePermissionDto,
  ): Promise<ApiResponse<PermissionResponse>> {
    const result = await this.permissionsService.create(dto);

    return {
      status: 'success',
      message: 'Permission retrieved successfully',
      data: result.data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
  ): Promise<ApiResponse<PermissionResponse>> {
    const result = await this.permissionsService.update(id, dto);

    return {
      status: 'success',
      message: result.message,
      data: result.data,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ApiResponse<{ message: string }>>{
    const data = await this.permissionsService.remove(id);

    return {
      status: 'success',
      message: 'Delete permission successfully',
      data,
    };
  }
}
