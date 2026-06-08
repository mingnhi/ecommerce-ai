import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEntity } from '@entities/order.entity';
import { OrderItemEntity } from '@entities/order-item.entity';
import { Payment } from '@entities/payment.entity';
import { CartModule } from '@modules/cart/cart.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([OrderEntity, OrderItemEntity, Payment]),
    CartModule,
    InventoryModule,
    UserRolesModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
