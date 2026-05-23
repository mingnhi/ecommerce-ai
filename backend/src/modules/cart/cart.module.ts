import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartEntity } from '@entities/cart.entity';
import { CartItemEntity } from '@entities/cart-item.entity';
import { ProductVariantEntity } from '@entities/product-variant.entity';
import { ProductPriceEntity } from '@entities/product-price.entity';
import { InventoryModule } from '@modules/inventory/inventory.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      CartEntity,
      CartItemEntity,
      ProductVariantEntity,
      ProductPriceEntity,
    ]),
    InventoryModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
