import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { ProductAttributeService } from './productattribute.service';

import { CreateProductAttributeRequest } from './dtos/requests/create-product-attribute.request';

@Controller()
export class ProductAttributeController {
  constructor(
    private readonly productAttributeService: ProductAttributeService,
  ) {}

  @Get(
    'products/:id/attributes',
  )
  async findByProduct(
    @Param('id')
    productId: string,
  ) {
    const data =
      await this.productAttributeService.findByProduct(
        productId,
      );

    return {
      status: 'success',

      message:
        'Attributes fetched successfully',

      data,
    };
  }

  @Post(
    'products/:id/attributes',
  )
  async create(
    @Param('id')
    productId: string,

    @Body()
    request: CreateProductAttributeRequest,
  ) {
    const data =
      await this.productAttributeService.create(
        productId,
        request,
      );

    return {
      status: 'success',

      message:
        'Attribute created successfully',

      data,
    };
  }
}