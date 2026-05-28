import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Req } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto, UpdateUserProfileDto } from './dto/user-profile.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/guards/roles.decorator';
import { ApiResponse } from '@common/interfaces/api-response.interface';
import { UserProfile } from '@entities/userProfile.entity';

@Controller('user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) { }

  @Get('me')
  async findMe(@Req() req: any): Promise<ApiResponse<UserProfile>> {
    const data = await this.userProfileService.findByUserId(req.user.sub);

    return {
      status: 'success',
      message: 'Get my profile successfully',
      data,
    };
  }

  @UseGuards(RolesGuard)
  @Roles('USER')
  @Put('me')
  async updateMe(
    @Req() req: any,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<ApiResponse<UserProfile>> {
    const data = await this.userProfileService.updateMe(req.user.sub, dto);

    return {
      status: 'success',
      message: 'Update my profile successfully',
      data,
    };
  }


  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findOne(@Param('id') id: string): Promise<ApiResponse<UserProfile>> {
    const data = await this.userProfileService.findOne(id);

    return {
      status: 'success',
      message: 'Get user profile successfully',
      data,
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<ApiResponse<UserProfile>> {
    const data = await this.userProfileService.updateMe(id, dto);

    return {
      status: 'success',
      message: 'Update user profile successfully',
      data,
    };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async remove(
    @Param('id') id: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const data = await this.userProfileService.remove(id);

    return {
      status: 'success',
      message: 'Delete user profile successfully',
      data,
    };
  }
}