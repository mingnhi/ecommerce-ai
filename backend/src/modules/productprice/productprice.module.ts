import { Module } from '@nestjs/common';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import { ProductEntity } from '@entities/product.entity';

import { ProductPriceEntity } from '@entities/product-price.entity';

import { ProductPriceController } from './productprice.controller';

import { ProductPriceService } from './productprice.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductEntity,
      ProductPriceEntity,
    ]),
  ],

  controllers: [
    ProductPriceController,
  ],

  providers: [
    ProductPriceService,
  ],

  exports: [
    ProductPriceService,
  ],
})
export class ProductPriceModule {}