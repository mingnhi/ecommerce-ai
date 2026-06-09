import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { ProductsService } from './products.service';

import { CreateProductRequest } from './dtos/requests/create-product.request';
import { UpdateProductRequest } from './dtos/requests/update-product.request';
import { QueryProductRequest } from './dtos/requests/query-product.request';
import { CreateReviewRequest } from './dtos/requests/create-review.request';
import { UpdateReviewRequest } from './dtos/requests/update-review.request';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryReviewRequest } from './dtos/requests/query-review.request';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get('price-range')
  async showPriceRange(): Promise<ApiResponse<{ min: number; max: number }>> {
    const data = await this.productsService.getActivePriceRange();

    return {
      status: 'success',
      message: 'Get product price range successfully',
      data,
    };
  }

  @Get()
  async index(
    @Query() query: QueryProductRequest,
  ): Promise<ApiResponse<any>> {
    const data = await this.productsService.findAll(query);

    return {
      status: 'success',
      message: 'Get products successfully',
      data: data.products,
      meta: data.pagination,
    };
  }

  @Get(':slug')
  async show(
    @Param('slug') slug: string,
  ): Promise<ApiResponse<any>> {
    const data = await this.productsService.findBySlug(slug);

    return {
      status: 'success',
      message: 'Get product successfully',
      data,
    };
  }

  @Post()
  async store(
    @Body() request: CreateProductRequest,
  ): Promise<ApiResponse<any>> {
    const data = await this.productsService.create(request);

    return {
      status: 'success',
      message: 'Create product successfully',
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateProductRequest,
  ): Promise<ApiResponse<any>> {
    const data = await this.productsService.update(id, request);

    return {
      status: 'success',
      message: 'Update product successfully',
      data,
    };
  }

  @Delete(':id')
  async destroy(
    @Param('id') id: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const data = await this.productsService.remove(id);

    return {
      status: 'success',
      message: 'Delete product successfully',
      data,
    };
  }

  /** ====================== REVIEWS ====================== */

  @Get('admin/reviews')
async getAllReviews(
  @Query() query: QueryReviewRequest,
): Promise<ApiResponse<any>> {
  const data = await this.productsService.getAllReviews(query);

  return {
    status: 'success',
    message: 'Get all reviews successfully',
    data: data.reviews,
    meta: data.pagination,
  };
}


@Post(':id/reviews')
@UseGuards(JwtAuthGuard)
async createReview(
  @Param('id') productId: string,
  @Body() request: CreateReviewRequest,
  @Req() req: any,
): Promise<ApiResponse<any>> {
  console.log('=== CREATE REVIEW DEBUG ===');
  console.log('User:', req.user);
  console.log('Body:', request);
  console.log('Product ID:', productId);

  const userId = req.user?.sub || req.user?.id;

  if (!userId) {
    throw new BadRequestException('User not authenticated');
  }

  const data = await this.productsService.createReview(
    productId,
    request,
    userId,
  );

  return {
    status: 'success',
    message: 'Create review successfully',
    data,
  };
}

  @Get(':id/reviews')
  async getReviews(
    @Param('id') productId: string,
  ): Promise<ApiResponse<any>> {
    const data = await this.productsService.getReviews(productId);

    return {
      status: 'success',
      message: 'Get reviews successfully',
      data,
    };
  }

  /** ====================== ADMIN ONLY ====================== */

  @Put(':productId/reviews/:reviewId')
  async updateReview(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
    @Body() request: UpdateReviewRequest,
  ): Promise<ApiResponse<any>> {
    const data = await this.productsService.updateReview(
      productId,
      reviewId,
      request,
    );

    return {
      status: 'success',
      message: 'Update review successfully',
      data,
    };
  }

  @Delete(':productId/reviews/:reviewId')
  async deleteReview(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const data = await this.productsService.deleteReview(productId, reviewId);

    return {
      status: 'success',
      message: 'Delete review successfully',
      data,
    };
  }
}