import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthService } from './services/auth.service';

import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResetPasswordDto } from '../otp/dto/reset-password.dto';
import { ApiResponse } from '@common/interfaces/api-response.interface';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

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
  @Post('logout')
  async logout(@Req() req: any): Promise<ApiResponse<any>> {
    const data = await this.authService.logout(req.user.sub);

    return {
      status: 'success',
      message: 'Logout successfully',
      data,
    };
  }
}