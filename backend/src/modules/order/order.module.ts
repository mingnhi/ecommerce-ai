// import { Module } from '@nestjs/common';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
// import { OrderController } from './order.controller';
// import { OrderService } from './order.service';
// import { Order } from '@entities/order.entity';
// import { OrderItem } from '@entities/order-item.entity';
// import { OrderStatusHistory } from '@entities/order-status-history.entity';
// import { Cart } from '@entities/cart.entity';
// import { CartItem } from '@entities/cart-item.entity';
// import { Inventory } from '@entities/inventory.entity';
// import { InventoryMovement } from '@entities/inventory-movement.entity';
// import { CartModule } from '@modules/cart/cart.module';
// import { InventoryModule } from '@modules/inventory/inventory.module';
// import { VoucherModule } from '@modules/voucher/voucher.module';

// @Module({
//   imports: [
//     MikroOrmModule.forFeature([
//       Order,
//       OrderItem,
//       OrderStatusHistory,
//       Cart,
//       CartItem,
//       Inventory,
//       InventoryMovement,
//     ]),
//     CartModule,
//     InventoryModule,
//     VoucherModule,
//   ],
//   controllers: [OrderController],
//   providers: [OrderService],
//   exports: [OrderService],
// })
// export class OrderModule {}
