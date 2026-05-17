import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { ProductPriceService } from './productprice.service';

import { CreateProductPriceRequest } from './dtos/requests/create-product-price.request';

import { UpdateProductPriceRequest } from './dtos/requests/update-product-price.request';

@Controller()
export class ProductPriceController {
  constructor(
    private readonly productPriceService: ProductPriceService,
  ) {}

  @Get(
    'products/:id/prices',
  )
  async findByProduct(
    @Param('id')
    productId: string,
  ) {
    const data =
      await this.productPriceService.findByProduct(
        productId,
      );

    return {
      status: 'success',

      message:
        'Prices fetched successfully',

      data,
    };
  }

  @Post('prices')
  async create(
    @Body()
    request: CreateProductPriceRequest,
  ) {
    const data =
      await this.productPriceService.create(
        request,
      );

    return {
      status: 'success',

      message:
        'Price created successfully',

      data,
    };
  }

  @Put('prices/:id')
  async update(
    @Param('id')
    id: string,

    @Body()
    request: UpdateProductPriceRequest,
  ) {
    const data =
      await this.productPriceService.update(
        id,
        request,
      );

    return {
      status: 'success',

      message:
        'Price updated successfully',

      data,
    };
  }
}