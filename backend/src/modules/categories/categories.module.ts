import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CategoryEntity } from '@entities/category.entity';

import { CategoriesController } from './categories.controller';

import { CategoriesService } from './categories.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      CategoryEntity,
    ]),
  ],

  controllers: [
    CategoriesController,
  ],

  providers: [CategoriesService],

  exports: [CategoriesService],
})
export class CategoriesModule {}