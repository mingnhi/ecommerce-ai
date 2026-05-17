import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ProductReviewService } from './productreview.service';

import { CreateProductReviewRequest } from './dtos/requests/create-product-review.request';

import { QueryProductReviewRequest } from './dtos/requests/query-product-review.request';

@Controller()
export class ProductReviewController {
  constructor(
    private readonly productReviewService: ProductReviewService,
  ) {}

  @Get(
    'products/:id/reviews',
  )
  async findByProduct(
    @Param('id')
    productId: string,

    @Query()
    query: QueryProductReviewRequest,
  ) {
    const result =
      await this.productReviewService.findByProduct(
        productId,
        query,
      );

    return {
      status: 'success',

      message:
        'Reviews fetched successfully',

      data: result.data,

      pagination:
        result.pagination,
    };
  }

  @Post('reviews')
  async create(
    @Body()
    request: CreateProductReviewRequest,
  ) {
    const data =
      await this.productReviewService.create(
        request,
      );

    return {
      status: 'success',

      message:
        'Review created successfully',

      data,
    };
  }
}