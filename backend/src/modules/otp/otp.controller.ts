// src/modules/otp/otp.controller.ts
import { Body, Controller, Delete, Post } from '@nestjs/common';
import { OtpService } from './otp.service';

import { ApiResponse } from '@common/interfaces/api-response.interface';
import { CreateOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Otp } from '@entities/otp.entity';
import { CreateOtpResponse, ResendOtpResponse, VerifyOtpResponse, VerifyRegisterOtpResponse } from './dto/otp-response.type';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) { }

  @Post('send')
  async createOtp(
    @Body() dto: CreateOtpDto,
  ): Promise<ApiResponse<CreateOtpResponse>> {
    const data = await this.otpService.createOtp(dto);

    return {
      status: 'success',
      message: 'Create OTP successfully',
      data,
    };
  }

  @Post('verify')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
  ): Promise<ApiResponse<VerifyOtpResponse>> {
    const data = await this.otpService.verifyOtp(dto);

    return {
      status: 'success',
      message: 'Verify OTP successfully',
      data,
    };
  }

  @Post('resend')
  async resendOtp(
    @Body() dto: CreateOtpDto,
  ): Promise<ApiResponse<ResendOtpResponse>> {
    const data = await this.otpService.resendOtp(dto);

    return {
      status: 'success',
      message: 'Resend OTP successfully',
      data,
    };
  }

  @Post('verify-register')
  async verifyRegisterOtp(
    @Body() dto: VerifyOtpDto,
  ): Promise<ApiResponse<VerifyRegisterOtpResponse>> {
    const data = await this.otpService.verifyRegisterOtp(dto);

    return {
      status: 'success',
      message: 'Verify register OTP successfully',
      data,
    };
  }

  @Post('forgot-password')
  async forgotPasswordOtp(
    @Body() dto: ForgotPasswordDto,
  ): Promise<ApiResponse<{ message: string }>> {
    const data = await this.otpService.forgotPasswordOtp(dto.email);

    return {
      status: 'success',
      message: 'Forgot password OTP sent successfully',
      data,
    };
  }
  @Delete('expired')
  async removeExpiredOtps(): Promise<ApiResponse<{ deleted: number }>> {
    const data = await this.otpService.removeExpiredOtps();

    return {
      status: 'success',
      message: 'Remove expired OTP successfully',
      data,
    };
  }
}