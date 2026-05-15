import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ProductReviewEntity } from '@entities/product-review.entity';

import { ProductEntity } from '@entities/product.entity';

import { Users } from '@entities/user.entity';

import { ReviewsController } from './reviews.controller';

import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductReviewEntity,
      ProductEntity,
      Users,
    ]),
  ],

  controllers: [
    ReviewsController,
  ],

  providers: [ReviewsService],

  exports: [ReviewsService],
})
export class ReviewsModule {}