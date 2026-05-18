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

import { QueryCategoryRequest } from './dtos/requests/query-category.request';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  /**
   * GET /categories
   */
  @Get()
  async findAll(
    @Query()
    query: QueryCategoryRequest,
  ) {
    return await this.categoryService.findAll(
      query,
    );
  }

  /**
   * POST /categories
   */
  @Post()
  async create(
    @Body()
    request: CreateCategoryRequest,
  ) {
    return await this.categoryService.create(
      request,
    );
  }

  /**
   * PUT /categories/:id
   */
  @Put(':id')
  async update(
    @Param('id')
    id: string,

    @Body()
    request: UpdateCategoryRequest,
  ) {
    return await this.categoryService.update(
      id,
      request,
    );
  }

  /**
   * DELETE /categories/:id
   */
  @Delete(':id')
  async remove(
    @Param('id')
    id: string,
  ) {
    return await this.categoryService.remove(
      id,
    );
  }
}

