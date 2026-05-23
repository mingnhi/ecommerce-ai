import { Payment } from '@entities/payment.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qs from 'qs';
import moment from 'moment';
import { PaymentMethod, PaymentStatus } from './dto/payment.enum';
import { OrderEntity } from '@entities/order.entity';
import { OrderStatus } from '@modules/order/enums/order-status.enum';
import { CreatePaymentDto } from './dto/payment.dto';
@Injectable()
export class PaymentService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(Payment)
    private readonly paymentRepo: EntityRepository<Payment>,

    @InjectRepository(OrderEntity)
    private readonly orderRepo: EntityRepository<OrderEntity>,
  ) { }

  async createPayment(dto: CreatePaymentDto, ipAddr: string) {
    const order = await this.orderRepo.findOne({ id: dto.orderId });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending payment');
    }

    const amount = Number(order.totalPrice);

    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid order amount');
    }

    if (dto.method === PaymentMethod.CASH) {
      return this.createCashPayment(order, amount);
    }

    if (dto.method === PaymentMethod.VNPAY) {
      return this.createVnpayPayment(order, amount, ipAddr);
    }
    throw new BadRequestException('Invalid payment method');
  }


  private async createCashPayment(order: OrderEntity, amount: number) {
    const payment = this.paymentRepo.create({
      order: order.id,
      method: PaymentMethod.CASH,
      status: PaymentStatus.PENDING,
      amount,
    });

    await this.em.persistAndFlush(payment);

    return {
      paymentId: payment.id,
      orderId: order.id,
      method: PaymentMethod.CASH,
      paymentStatus: payment.status,
      orderStatus: order.status,
      amount,
      message: 'Đặt hàng COD thành công, chờ thanh toán khi nhận hàng',
    };
  }
  private async createVnpayPayment(
    order: OrderEntity,
    amount: number,
    ipAddr: string,
  ) {
    const txnRef = `${order.id}_${moment().format('YYYYMMDDHHmmss')}_${Math.floor(
      Math.random() * 1000,
    )}`;

    const payment = this.paymentRepo.create({
      order: order.id,
      method: PaymentMethod.VNPAY,
      status: PaymentStatus.PENDING,
      amount,
      transactionId: txnRef,
    });

    await this.em.persistAndFlush(payment);

    const date = moment().format('YYYYMMDDHHmmss');

    let vnpParams: Record<string, any> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNP_TMNCODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: date,
    };

    vnpParams = this.sortObject(vnpParams);

    const signData = qs.stringify(vnpParams, {
      encode: false,
    });

    const secureHash = crypto
      .createHmac('sha512', process.env.VNP_HASHSECRET as string)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    vnpParams.vnp_SecureHash = secureHash;

    const paymentUrl =
      process.env.VNP_PAYMENT_URL +
      '?' +
      qs.stringify(vnpParams, {
        encode: false,
      });

    return {
      paymentId: payment.id,
      orderId: order.id,
      method: PaymentMethod.VNPAY,
      paymentStatus: payment.status,
      orderStatus: order.status,
      amount,
      txnRef,
      paymentUrl,
    };
  }

  async verifyVnpayReturn(query: Record<string, any>) {
    const secureHash = query.vnp_SecureHash;
    if (!secureHash) {
      throw new BadRequestException('Missing VNPAY secure hash');
    }

    const clonedQuery = { ...query };

    delete clonedQuery.vnp_SecureHash;
    delete clonedQuery.vnp_SecureHashType;

    const sortedParams = this.sortObject(clonedQuery);

    const signData = qs.stringify(sortedParams, {
      encode: false,
    });

    const signed = crypto
      .createHmac('sha512', process.env.VNP_HASHSECRET as string)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    if (secureHash !== signed) {
      throw new BadRequestException('Invalid VNPAY signature');
    }

    const txnRef = String(query.vnp_TxnRef);
    const payment = await this.paymentRepo.findOne(
      { transactionId: txnRef },
      { populate: ['order'] },
    );

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.providerResponse = JSON.stringify(query);

    const isSuccess = query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00';
    if (isSuccess) {
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();

      payment.order.status = OrderStatus.PAID;
    } else {
      payment.status = PaymentStatus.FAILED;

      payment.order.status = OrderStatus.CANCELLED;
    }

    await this.em.flush();

    return {
      paymentId: payment.id,
      orderId: payment.order.id,
      status: payment.status,
      orderStatus: payment.order.status,
      amount: Number(query.vnp_Amount) / 100,
      txnRef: query.vnp_TxnRef,
      vnpTransactionNo: query.vnp_TransactionNo,
      responseCode: query.vnp_ResponseCode,
      transactionStatus: query.vnp_TransactionStatus,
      bankCode: query.vnp_BankCode,
      payDate: query.vnp_PayDate,
      message:
        payment.status === PaymentStatus.COMPLETED
          ? 'Thanh toán VNPAY thành công'
          : 'Thanh toán VNPAY thất bại',
    };
  }

  async findByOrderId(orderId: string) {
    const payments = await this.paymentRepo.find(
      {
        
          id: orderId,
      },
      {
        orderBy: {
          createdAt: 'DESC',
        },
      },
    );

    if (!payments.length) {
      throw new NotFoundException('Payment not found for this order');
    }

    return payments;
  }

  private sortObject(obj: Record<string, any>) {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      sorted[encodeURIComponent(key)] = encodeURIComponent(obj[key]).replace(
        /%20/g,
        '+',
      );
    }

    return sorted;
  }


  async getRevenueStats() {
    const payments = await this.paymentRepo.find(
      {
        status: PaymentStatus.COMPLETED,
        method: {
          $in: [PaymentMethod.VNPAY, PaymentMethod.CASH],
        },
      },
      {
        populate: ['order'],
        orderBy: {
          createdAt: 'DESC',
        },
      },
    );

    const totalRevenue = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const vnpayPayments = payments.filter((payment) =>
      payment.method === PaymentMethod.VNPAY,
    );

    const cashPayments = payments.filter((payment) =>
      payment.method === PaymentMethod.CASH,
    );

    const vnpayRevenue = vnpayPayments.reduce((sum, payment) =>
      sum + Number(payment.amount),
      0,
    );

    const cashRevenue = cashPayments.reduce((sum, payment) =>
      sum + Number(payment.amount),
      0,
    );

    return {
      totalRevenue,
      totalOrders: payments.length,

      vnpay: {
        revenue: vnpayRevenue,
        orders: vnpayPayments.length,
      },

      cash: {
        revenue: cashRevenue,
        orders: cashPayments.length,
      },
    };
  }
}
