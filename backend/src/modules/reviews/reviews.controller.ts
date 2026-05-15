import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';

import { CreateReviewDto } from './dtos/create-review.dto';

import { QueryReviewDto } from './dtos/query-review.dto';

@Controller()
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get(
    'products/:id/reviews',
  )
  findByProduct(
    @Param('id')
    productId: string,

    @Query()
    query: QueryReviewDto,
  ) {
    return this.reviewsService.findByProduct(
      productId,
      query,
    );
  }

  @Post('reviews')
  create(
    @Body()
    dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(
      dto,
    );
  }
}