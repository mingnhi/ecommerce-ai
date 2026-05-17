import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { VariantsService } from './productvariant.service';

import { CreateVariantRequest } from './dtos/requests/create-variant.request';

import { UpdateVariantRequest } from './dtos/requests/update-variant.request';

@Controller()
export class VariantsController {
  constructor(
    private readonly variantsService: VariantsService,
  ) {}

  @Get(
    'products/:id/variants',
  )
  async findByProduct(
    @Param('id')
    productId: string,
  ) {
    const data =
      await this.variantsService.findByProduct(
        productId,
      );

    return {
      status: 'success',

      message:
        'Variants fetched successfully',

      data,
    };
  }

  @Post('variants')
  async create(
    @Body()
    request: CreateVariantRequest,
  ) {
    const data =
      await this.variantsService.create(
        request,
      );

    return {
      status: 'success',

      message:
        'Variant created successfully',

      data,
    };
  }

  @Put('variants/:id')
  async update(
    @Param('id')
    id: string,

    @Body()
    request: UpdateVariantRequest,
  ) {
    const data =
      await this.variantsService.update(
        id,
        request,
      );

    return {
      status: 'success',

      message:
        'Variant updated successfully',

      data,
    };
  }

  @Delete('variants/:id')
  async remove(
    @Param('id')
    id: string,
  ) {
    await this.variantsService.remove(
      id,
    );

    return {
      status: 'success',

      message:
        'Variant deleted successfully',

      data: null,
    };
  }
}