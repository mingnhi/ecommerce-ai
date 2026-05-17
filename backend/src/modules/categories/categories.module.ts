import { Module } from '@nestjs/common';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import { CategoryEntity } from '@entities/category.entity';

import { CategoryController } from './categories.controller';

import { CategoryService } from './categories.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      CategoryEntity,
    ]),
  ],

  controllers: [
    CategoryController,
  ],

  providers: [CategoryService],

  exports: [CategoryService],
})
export class CategoryModule {}