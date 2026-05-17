import { Module } from '@nestjs/common';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import { ProductEntity } from '@entities/product.entity';

import { ProductAttributeEntity } from '@entities/product-attribute.entity';

import { ProductAttributeController } from './productattribute.controller';

import { ProductAttributeService } from './productattribute.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductEntity,
      ProductAttributeEntity,
    ]),
  ],

 controllers: [
    ProductAttributeController,
  ],

  providers: [
    ProductAttributeService,
  ],

  exports: [
    ProductAttributeService,
  ],
})
export class ProductAttributeModule {}