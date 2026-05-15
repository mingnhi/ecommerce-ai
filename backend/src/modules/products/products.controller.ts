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

import { CreateProductDto } from './dtos/create-product.dto';

import { UpdateProductDto } from './dtos/update-product.dto';

import { QueryProductsDto } from './dtos/query-products.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  findAll(
    @Query()
    query: QueryProductsDto,
  ) {
    return this.productsService.findAll(
      query,
    );
  }

  @Get(':slug')
  findOne(
    @Param('slug')
    slug: string,
  ) {
    return this.productsService.findOne(
      slug,
    );
  }

  @Post()
  create(
    @Body()
    dto: CreateProductDto,
  ) {
    return this.productsService.create(
      dto,
    );
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateProductDto,
  ) {
    return this.productsService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.productsService.remove(
      id,
    );
  }
}