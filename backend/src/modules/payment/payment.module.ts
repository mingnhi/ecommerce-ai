import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Payment } from '@entities/payment.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Payment]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
