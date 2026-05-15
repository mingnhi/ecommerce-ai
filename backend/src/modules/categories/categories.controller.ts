import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';

import { CreateCategoryDto } from './dtos/create-category.dto';

import { UpdateCategoryDto } from './dtos/update-category.dto';

import { QueryCategoriesDto } from './dtos/query-categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  findAll(
    @Query()
    query: QueryCategoriesDto,
  ) {
    return this.categoriesService.findAll(
      query,
    );
  }

  @Post()
  create(
    @Body()
    dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(
      dto,
    );
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.categoriesService.remove(
      id,
    );
  }
}