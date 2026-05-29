import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { CurrentUser, JwtUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/guards/roles.decorator';
import { ApiResponse } from '@common/interfaces/api-response.interface';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: JwtUser,
    @Req() req: Request,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.paymentService.createPayment(
      dto,
      user.sub,
      this.getClientIp(req),
    );

    return {
      status: 'success',
      message: 'Create payment successfully',
      data,
    };
  }

  @Get('vnpay-return')
  async verifyVnpayReturn(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const data = await this.paymentService.verifyVnpayReturn(query);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const params = new URLSearchParams(query).toString();

    return res.redirect(
      `${frontendUrl}/thanh-toan/ket-qua/${data.orderId}${params ? `?${params}` : ''}`,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('revenue')
  async getRevenueStats(): Promise<ApiResponse<unknown>> {
    const data = await this.paymentService.getRevenueStats();

    return {
      status: 'success',
      message: 'Get revenue statistics successfully',
      data,
    };
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || '127.0.0.1';
  }
}
