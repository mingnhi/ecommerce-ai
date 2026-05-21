import { Payment } from '@entities/payment.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qs from 'qs';
import moment from 'moment';
import { CreateVnpayPaymentDto } from './dto/payment.dto';
import { PaymentMethod, PaymentStatus } from './dto/payment.enum';
@Injectable()
export class PaymentService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(Payment)
    private readonly paymentRepo: EntityRepository<Payment>,

    // @InjectRepository(Order)
    // private readonly orderRepo: EntityRepository<Order>,
  ) { }

  async createVnpayPayment(dto: CreateVnpayPaymentDto, ipAddr: string) {
    // const order = await this.orderRepo.findOne({ id: dto.orderId });

    // if (!order) {
    //   throw new NotFoundException('Order not found');
    // }

    const payment = this.paymentRepo.create({
      // order,
      method: PaymentMethod.VNPAY,
      status: PaymentStatus.PENDING,
      amount: dto.amount,
    });

    await this.em.persistAndFlush(payment);

    const date = moment().format('YYYYMMDDHHmmss');

    const txnRef = `${moment().format('YYYYMMDDHHmmss')}${Math.floor(
      Math.random() * 1000,
    )}`;
    payment.transactionId = txnRef;
    await this.em.flush();

    let vnpParams: Record<string, any> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNP_TMNCODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
      vnp_OrderType: 'other',
      vnp_Amount: dto.amount * 100,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: date,
    };

    vnpParams = this.sortObject(vnpParams);

    const signData = qs.stringify(vnpParams, {
      encode: false,
    });

    const secureHash = crypto.
      createHmac('sha512', process.env.VNP_HASHSECRET as string)
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
    const payment = await this.paymentRepo.findOne({
      transactionId: txnRef,
    
      // { populate: ['order'] },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // payment.transactionId = query.vnp_TransactionNo;
    payment.providerResponse = JSON.stringify(query);

    if (query.vnp_ResponseCode === '00') {
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();

      // payment.order.status = OrderStatus.PAID;
    } else {
      payment.status = PaymentStatus.FAILED;

      // payment.order.status = OrderStatus.CANCELLED;
    }

    await this.em.flush();

    return {
      paymentId: payment.id,
      // orderId: payment.order.id,
      status: payment.status,
      amount: Number(query.vnp_Amount) / 100,
      txnRef: query.vnp_TxnRef,
      vnpTransactionNo: query.vnp_TransactionNo,
      // transactionId: payment.transactionId,
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

  // async findByOrderId(orderId: number) {
  //   return this.paymentRepo.find(
  //     {
  //       order: {
  //         id: orderId,
  //       },
  //     },
  //     {
  //       populate: ['order'],
  //       orderBy: {
  //         createdAt: 'DESC',
  //       },
  //     },
  //   );
  // }

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
}
