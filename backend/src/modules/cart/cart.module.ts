// import { Module } from '@nestjs/common';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
// import { CartController } from './cart.controller';
// import { CartService } from './cart.service';
// import { Cart } from '@entities/cart.entity';
// import { CartItem } from '@entities/cart-item.entity';
// import { InventoryModule } from '@modules/inventory/inventory.module';
// import { PriceModule } from '@modules/price/price.module';

// @Module({
//   imports: [
//     MikroOrmModule.forFeature([Cart, CartItem]),
//     InventoryModule,
//     PriceModule,
//   ],
//   controllers: [CartController],
//   providers: [CartService],
//   exports: [CartService],
// })
// export class CartModule {}
