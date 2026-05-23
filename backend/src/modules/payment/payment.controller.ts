import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/payment.dto';


@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('create')
  createVnpayPayment(
    @Body() dto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentService.createPayment(
      dto,
      '127.0.0.1',
    );
  }

  @Get('vnpay-return')
  verifyVnpayReturn(
    @Query() query: Record<string, any>,
  ) {
    return this.paymentService.verifyVnpayReturn(
      query,
    );
  }

  @Get('revenue')
  async getRevenueStats() {
    const data = await this.paymentService.getRevenueStats();
    return {
      status: 'success',
      message: 'Get revenue statistics successfully',
      data,
    };
  }
}
