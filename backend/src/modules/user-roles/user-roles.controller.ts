import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UserRolesService } from './user-roles.service';
import { AssignRolesDto, CreateUserRoleDto } from './dto/user-role.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/guards/roles.decorator';
import { ApiResponse } from '@common/interfaces/api-response.interface';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Get('user-roles')
  async findAll(): Promise<ApiResponse<any>> {
    const data = await this.userRolesService.findAll();

    return {
      status: 'success',
      message: 'Get user roles successfully',
      data,
    };
  }


  @Get('user-roles/:id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const data = await this.userRolesService.findOne(id);

    return {
      status: 'success',
      message: 'Get user role successfully',
      data,
    };
  }

  @Post('user-roles')
  async create(
    @Body() dto: CreateUserRoleDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.userRolesService.create(dto);

    return {
      status: 'success',
      message: 'Create user role successfully',
      data,
    };
  }

  @Delete('user-roles/:id')
  async remove(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const data = await this.userRolesService.remove(id);

    return {
      status: 'success',
      message: 'Delete user role successfully',
      data,
    };
  }

  @Get('users/:id/roles')
  async findRolesByUser(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const data = await this.userRolesService.findByUser(id);

    return {
      status: 'success',
      message: 'Get user roles by user successfully',
      data,
    };
  }

  @Post('users/:id/roles')
  async assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.userRolesService.assignRoles(
      id,
      dto.roleIds,
    );

    return {
      status: 'success',
      message: 'Assign roles successfully',
      data,
    };
  }
}
