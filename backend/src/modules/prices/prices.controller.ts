import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { PricesService } from './prices.service';

import { CreatePriceDto } from './dtos/create-price.dto';

import { UpdatePriceDto } from './dtos/update-price.dto';

@Controller()
export class PricesController {
  constructor(
    private readonly pricesService: PricesService,
  ) {}

  @Get(
    'products/:id/prices',
  )
  findByProduct(
    @Param('id')
    productId: string,
  ) {
    return this.pricesService.findByProduct(
      productId,
    );
  }

  @Post('prices')
  create(
    @Body()
    dto: CreatePriceDto,
  ) {
    return this.pricesService.create(
      dto,
    );
  }

  @Put('prices/:id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdatePriceDto,
  ) {
    return this.pricesService.update(
      id,
      dto,
    );
  }
}