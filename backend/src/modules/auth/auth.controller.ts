import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './services/auth.service';

import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifyOtpDto } from './dtos/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    dto: RegisterDto
  ) {
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('login')
  async login(
    @Body()
    dto: LoginDto
  ) {
    return this.authService.login(dto);
  }

  @Post('refresh-token')
  async refreshToken(
    @Headers('authorization')
    authorization?: string
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const refreshToken = authorization.replace('Bearer ', '');

    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.authService.me(req.user.sub);
  }
}
