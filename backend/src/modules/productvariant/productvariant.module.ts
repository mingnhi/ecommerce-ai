import { Module } from '@nestjs/common';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import { ProductEntity } from '@entities/product.entity';

import { ProductVariantEntity } from '@entities/product-variant.entity';

import { VariantsController } from './productvariant.controller';

import { VariantsService } from './productvariant.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductEntity,
      ProductVariantEntity,
    ]),
  ],

  controllers: [
    VariantsController,
  ],

  providers: [VariantsService],

  exports: [VariantsService],
})
export class VariantsModule {}