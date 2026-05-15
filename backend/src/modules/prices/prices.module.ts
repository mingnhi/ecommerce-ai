import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ProductPriceEntity } from '@entities/product-price.entity';

import { ProductEntity } from '@entities/product.entity';

import { PricesController } from './prices.controller';

import { PricesService } from './prices.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductPriceEntity,
      ProductEntity,
    ]),
  ],

  controllers: [
    PricesController,
  ],

  providers: [PricesService],

  exports: [PricesService],
})
export class PricesModule {}