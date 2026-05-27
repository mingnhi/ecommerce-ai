import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { AuthService } from './services/auth.service';
import { User } from '@entities/user.entity';
import { UserProfile } from '@entities/userProfile.entity';

import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { GoogleLoginDto } from './dtos/google-login.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResetPasswordDto } from '../otp/dto/reset-password.dto';
import { ApiResponse } from '@common/interfaces/api-response.interface';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  private toProfileData(user: User, profile: UserProfile | null) {
    return {
      fullName: user.fullName,
      phone: profile?.phone ?? null,
      address: profile?.address ?? null,
      dateOfBirth: profile?.dateOfBirth ?? null,
      gender: profile?.gender ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<ApiResponse<any>> {
    const data = await this.authService.register(dto);
    return {
      status: 'success',
      message: 'Register successfully. Please verify OTP.',
      data,
    }
  }


  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ApiResponse<any>> {
    const data = await this.authService.login(dto);
    return {
      status: 'success',
      message: 'Login successfully',
      data,
    };
  }

  @Post('google')
  async googleLogin(@Body() dto: GoogleLoginDto): Promise<ApiResponse<any>> {
    const data = await this.authService.googleLogin(dto.accessToken);
    return {
      status: 'success',
      message: 'Google login successfully',
      data,
    };
  }

  @Post('refresh-token')
  async refreshToken(@Headers('authorization') authorization?: string): Promise<ApiResponse<any>> {
    if (!authorization) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const refreshToken = authorization.replace('Bearer ', '');

    const data = await this.authService.refresh(refreshToken);
    return {
      status: 'success',
      message: 'Refresh token successfully',
      data,
    };
  }


  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ApiResponse<any>> {
    const data = await this.authService.resetPassword(dto);
    return {
      status: 'success',
      message: 'Reset password successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async patchPassword(
    @Req() req: any,
    @Body() dto: UpdatePasswordDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.authService.updatePassword(req.user.sub, dto);

    return {
      status: 'success',
      message: 'Update password successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any): Promise<ApiResponse<any>> {
    const data = await this.authService.logout(req.user.sub);

    return {
      status: 'success',
      message: 'Logout successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any): Promise<ApiResponse<any>> {
    const data = await this.authService.me(req.user.sub);

    return {
      status: 'success',
      message: 'Get current user successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any): Promise<ApiResponse<any>> {
    const user = await this.authService.validateUser(req.user.sub);
    const profile = await this.authService.findProfileByUser(user);

    return {
      status: 'success',
      message: 'Get profile successfully',
      data: this.toProfileData(user, profile),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  async patchProfileAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh');
    }

    const user = await this.authService.validateUser(req.user.sub);
    const profile = await this.authService.updateAvatar(user, file);

    return {
      status: 'success',
      message: 'Update avatar successfully',
      data: this.toProfileData(user, profile),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponse<any>> {
    const user = await this.authService.validateUser(req.user.sub);

    if (dto.fullName !== undefined) {
      await this.authService.updateFullName(user.id, dto.fullName);
    }

    const profile = await this.authService.upsertProfile(user, dto);
    const refreshed = await this.authService.validateUser(req.user.sub);

    return {
      status: 'success',
      message: 'Update profile successfully',
      data: this.toProfileData(refreshed, profile),
    };
  }
}
