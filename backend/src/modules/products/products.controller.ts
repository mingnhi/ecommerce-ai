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

import { ProductsService } from './products.service';

import { CreateProductRequest } from './dtos/requests/create-product.request';

import { UpdateProductRequest } from './dtos/requests/update-product.request';

import { QueryProductsRequest } from './dtos/requests/query-products.request';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  async findAll(
    @Query()
    query: QueryProductsRequest,
  ) {
    const result =
      await this.productsService.findAll(
        query,
      );

    return {
      status: 'success',

      message:
        'Products fetched successfully',

      data: result.data,

      meta: result.meta,
    };
  }

  @Get(':slug')
  async findOne(
    @Param('slug')
    slug: string,
  ) {
    const data =
      await this.productsService.findOne(
        slug,
      );

    return {
      status: 'success',

      message:
        'Product fetched successfully',

      data,
    };
  }

  @Post()
  async create(
    @Body()
    request: CreateProductRequest,
  ) {
    const data =
      await this.productsService.create(
        request,
      );

    return {
      status: 'success',

      message:
        'Product created successfully',

      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id')
    id: string,

    @Body()
    request: UpdateProductRequest,
  ) {
    const data =
      await this.productsService.update(
        id,
        request,
      );

    return {
      status: 'success',

      message:
        'Product updated successfully',

      data,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id')
    id: string,
  ) {
    await this.productsService.remove(
      id,
    );

    return {
      status: 'success',

      message:
        'Product deleted successfully',

      data: null,
    };
  }
}