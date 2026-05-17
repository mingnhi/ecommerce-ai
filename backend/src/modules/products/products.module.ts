import { Module } from '@nestjs/common';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import { ProductEntity } from '@entities/product.entity';

import { CategoryEntity } from '@entities/category.entity';

import { ProductsController } from './products.controller';

import { ProductsService } from './products.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
    ]),
  ],

  controllers: [
    ProductsController,
  ],

  providers: [ProductsService],

  exports: [ProductsService],
})
export class ProductsModule {}