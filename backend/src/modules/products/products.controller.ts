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

import { QueryProductRequest } from './dtos/requests/query-product.request';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  /**
   * GET /products
   */
  @Get()
  async findAll(
    @Query()
    query: QueryProductRequest,
  ) {
    return await this.productsService.findAll(
      query,
    );
  }

  /**
   * GET /products/:slug
   */
  @Get(':slug')
  async findBySlug(
    @Param('slug')
    slug: string,
  ) {
    return await this.productsService.findBySlug(
      slug,
    );
  }

  /**
   * POST /products
   */
  @Post()
  async create(
    @Body()
    request: CreateProductRequest,
  ) {
    return await this.productsService.create(
      request,
    );
  }

  /**
   * PUT /products/:id
   */
  @Put(':id')
  async update(
    @Param('id')
    id: string,

    @Body()
    request: UpdateProductRequest,
  ) {
    return await this.productsService.update(
      id,
      request,
    );
  }

  /**
   * DELETE /products/:id
   */
  @Delete(':id')
  async remove(
    @Param('id')
    id: string,
  ) {
    return await this.productsService.remove(
      id,
    );
  }
}