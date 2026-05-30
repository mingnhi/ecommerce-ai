import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { ProductsService } from './products.service';

import { CreateProductRequest } from './dtos/requests/create-product.request';
import { UpdateProductRequest } from './dtos/requests/update-product.request';
import { QueryProductRequest } from './dtos/requests/query-product.request';

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
}
