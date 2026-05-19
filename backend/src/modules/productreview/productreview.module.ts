import { Module } from '@nestjs/common';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import { ProductEntity } from '@entities/product.entity';

import { ProductReviewEntity } from '@entities/product-review.entity';

import { User } from '@entities/user.entity';

import { ProductReviewController } from './productreview.controller';

import { ProductReviewService } from './productreview.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductEntity,

      ProductReviewEntity,

      User,
    ]),
  ],

  controllers: [
    ProductReviewController,
  ],

  providers: [
    ProductReviewService,
  ],

  exports: [
    ProductReviewService,
  ],
})
export class ProductReviewModule {}

