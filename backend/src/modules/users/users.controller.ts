import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/guards/roles.decorator';
import { ApiResponse } from '@common/interfaces/api-response.interface';
import { User } from '@entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll(): Promise<ApiResponse<UserResponse[]>> {
    const data = await this.usersService.findAll();

    return {
      status: 'success',
      message: 'Get users successfully',
      data,
      meta: {
        count: data.length,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<UserResponse>> {
    const data = await this.usersService.findOne(id);

    return {
      status: 'success',
      message: 'Get user successfully',
      data,
    };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    const data = await this.usersService.update(id, updateUserDto);

    return {
      status: 'success',
      message: 'Update user successfully',
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiResponse<UpdateStatusResponse>> {
    const data = await this.usersService.updateStatus(id, dto);

    return {
      status: 'success',
      message: 'Update user status successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<{ message: string }>> {
    const data = await this.usersService.remove(id);

    return {
      status: 'success',
      message: 'Delete user successfully',
      data,
    };
  }
}
