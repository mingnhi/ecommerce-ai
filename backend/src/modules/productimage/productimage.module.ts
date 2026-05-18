import { Module } from '@nestjs/common';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import { ProductEntity } from '@entities/product.entity';

import { ProductImageEntity } from '@entities/product-image.entity';

import { ProductImageController } from './productimage.controller';

import { ProductImageService } from './productimage.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductEntity,
      ProductImageEntity,
    ]),
  ],

  controllers: [
    ProductImageController,
  ],

  providers: [
    ProductImageService,
  ],

  exports: [
    ProductImageService,
  ],
})
export class ProductImageModule {}

