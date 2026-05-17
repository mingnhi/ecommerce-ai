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

import { CategoryService } from './categories.service';

import { CreateCategoryRequest } from './dtos/requests/create-category.request';

import { UpdateCategoryRequest } from './dtos/requests/update-category.request';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async findAll(
    @Query('type')
    type: string = 'flat',
  ) {
    const data =
      await this.categoryService.findAll(
        type,
      );

    return {
      status: 'success',

      message:
        'Categories fetched successfully',

      data,
    };
  }

  @Post()
  async create(
    @Body()
    request: CreateCategoryRequest,
  ) {
    const data =
      await this.categoryService.create(
        request,
      );

    return {
      status: 'success',

      message:
        'Category created successfully',

      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id')
    id: string,

    @Body()
    request: UpdateCategoryRequest,
  ) {
    const data =
      await this.categoryService.update(
        id,
        request,
      );

    return {
      status: 'success',

      message:
        'Category updated successfully',

      data,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id')
    id: string,
  ) {
    await this.categoryService.remove(
      id,
    );

    return {
      status: 'success',

      message:
        'Category deleted successfully',

      data: null,
    };
  }
}