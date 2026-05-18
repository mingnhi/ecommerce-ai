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

  /**
   * GET /products/:id/reviews
   */
  @Get('products/:id/reviews')
  async findByProduct(
    @Param('id')
    productId: string,

    @Query()
    query: QueryProductReviewRequest,
  ) {
    return await this.productReviewService.findByProduct(
      productId,
      query,
    );
  }

  /**
   * POST /reviews
   */
  @Post('reviews')
  async create(
    @Body()
    request: CreateProductReviewRequest,
  ) {
    return await this.productReviewService.create(
      request,
    );
  }
}

