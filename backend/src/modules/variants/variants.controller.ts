import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { VariantsService } from './variants.service';

import { CreateVariantDto } from './dtos/create-variant.dto';

import { UpdateVariantDto } from './dtos/update-variant.dto';

@Controller()
export class VariantsController {
  constructor(
    private readonly variantsService: VariantsService,
  ) {}

  @Get(
    'products/:id/variants',
  )
  findByProduct(
    @Param('id')
    productId: string,
  ) {
    return this.variantsService.findByProduct(
      productId,
    );
  }

  @Post('variants')
  create(
    @Body()
    dto: CreateVariantDto,
  ) {
    return this.variantsService.create(
      dto,
    );
  }

  @Put('variants/:id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateVariantDto,
  ) {
    return this.variantsService.update(
      id,
      dto,
    );
  }

  @Delete('variants/:id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.variantsService.remove(
      id,
    );
  }
}