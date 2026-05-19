import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEntity } from '@entities/order.entity';
import { OrderItemEntity } from '@entities/order-item.entity';
import { OrderStatusHistoryEntity } from '@entities/order-status-history.entity';
import { CartModule } from '@modules/cart/cart.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import { AdminGuard } from '@common/guards/admin.guard';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      OrderStatusHistoryEntity,
    ]),
    CartModule,
    InventoryModule,
    UserRolesModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, AdminGuard],
  exports: [OrderService],
})
export class OrderModule {}
