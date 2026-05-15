import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { AttributesService } from './attributes.service';

import { CreateAttributeDto } from './dtos/create-attribute.dto';

@Controller()
export class AttributesController {
  constructor(
    private readonly attributesService: AttributesService,
  ) {}

  @Post(
    'products/:id/attributes',
  )
  create(
    @Param('id')
    productId: string,

    @Body()
    dto: CreateAttributeDto,
  ) {
    return this.attributesService.create(
      productId,
      dto,
    );
  }

  @Get(
    'products/:id/attributes',
  )
  findByProduct(
    @Param('id')
    productId: string,
  ) {
    return this.attributesService.findByProduct(
      productId,
    );
  }
}