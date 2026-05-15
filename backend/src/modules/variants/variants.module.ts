import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ProductVariantEntity } from '@entities/product-variant.entity';

import { ProductEntity } from '@entities/product.entity';

import { VariantsController } from './variants.controller';

import { VariantsService } from './variants.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductVariantEntity,
      ProductEntity,
    ]),
  ],

  controllers: [
    VariantsController,
  ],

  providers: [VariantsService],

  exports: [VariantsService],
})
export class VariantsModule {}