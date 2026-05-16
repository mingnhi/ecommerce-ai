// src/modules/otp/otp.controller.ts
import { Body, Controller, Delete, Post } from '@nestjs/common';
import { OtpService } from './otp.service';

import { ApiResponse } from '@common/interfaces/api-response.interface';
import { CreateOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) { }

  @Post('create')
  async createOtp(
    @Body() dto: CreateOtpDto,
  ): Promise<ApiResponse<any>> {
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
  ): Promise<ApiResponse<any>> {
    const data = await this.otpService.verifyOtp(dto);

    return {
      status: 'success',
      message: 'Verify OTP successfully',
      data,
    };
  }

  @Delete('expired')
  async removeExpiredOtps(): Promise<ApiResponse<any>> {
    const data = await this.otpService.removeExpiredOtps();

    return {
      status: 'success',
      message: 'Remove expired OTP successfully',
      data,
    };
  }
}