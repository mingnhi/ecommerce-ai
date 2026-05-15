import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EntityManager,
  EntityRepository,
} from '@mikro-orm/mysql';

import { InjectRepository } from '@mikro-orm/nestjs';

import { CategoryEntity } from '@entities/category.entity';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { CreateCategoryDto } from './dtos/create-category.dto';

import { UpdateCategoryDto } from './dtos/update-category.dto';

import { QueryCategoriesDto } from './dtos/query-categories.dto';

import { CategoryResponse } from './responses/category.response';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(
      CategoryEntity,
    )
    private readonly categoryRepository: EntityRepository<CategoryEntity>,

    private readonly em: EntityManager,
  ) {}

  async create(
    dto: CreateCategoryDto,
  ): Promise<
    ApiResponse<CategoryResponse>
  > {
    let parent:
      | CategoryEntity
      | null = null;

    if (dto.parentId) {
      parent =
        await this.categoryRepository.findOne({
          id: dto.parentId,
        });

      if (!parent) {
        throw new NotFoundException(
          'Parent category not found',
        );
      }
    }

    const category =
      this.categoryRepository.create({
        name: dto.name,

        slug:
          dto.slug ||
          dto.name
            .toLowerCase()
            .replace(/\s+/g, '-'),

        parent,
      });

    await this.em.persistAndFlush(
      category,
    );

    return {
      status: 'success',

      message:
        'Category created successfully',

      data: {
        id: category.id,

        name: category.name,

        slug: category.slug,

        parentId:
          category.parent?.id,

        createdAt:
          category.createdAt,

        updatedAt:
          category.updatedAt,
      },
    };
  }

  async findAll(
    query: QueryCategoriesDto,
  ): Promise<
    ApiResponse<CategoryResponse[]>
  > {
    const categories =
      await this.categoryRepository.findAll({
        populate: ['parent'],
      });

    const mapped =
      categories.map(category => ({
        id: category.id,

        name: category.name,

        slug: category.slug,

        parentId:
          category.parent?.id,

        createdAt:
          category.createdAt,

        updatedAt:
          category.updatedAt,

        children: [],
      }));

    if (query.type === 'tree') {
      const map =
        new Map<
          string,
          CategoryResponse
        >();

      mapped.forEach(category => {
        map.set(
          category.id,
          category,
        );
      });

      const roots:
        CategoryResponse[] = [];

      mapped.forEach(category => {
        if (
          category.parentId
        ) {
          const parent =
            map.get(
              category.parentId,
            );

          if (parent) {
            parent.children?.push(
              category,
            );
          }
        } else {
          roots.push(category);
        }
      });

      return {
        status: 'success',

        message:
          'Categories fetched successfully',

        data: roots,
      };
    }

    return {
      status: 'success',

      message:
        'Categories fetched successfully',

      data: mapped,
    };
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<
    ApiResponse<CategoryResponse>
  > {
    const category =
      await this.categoryRepository.findOne({
        id,
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    if (dto.parentId) {
      const parent =
        await this.categoryRepository.findOne({
          id: dto.parentId,
        });

      if (!parent) {
        throw new NotFoundException(
          'Parent category not found',
        );
      }

      category.parent =
        parent;
    }

    if (dto.name) {
      category.name = dto.name;
    }

    if (dto.slug) {
      category.slug = dto.slug;
    }

    await this.em.persistAndFlush(
      category,
    );

    return {
      status: 'success',

      message:
        'Category updated successfully',

      data: {
        id: category.id,

        name: category.name,

        slug: category.slug,

        parentId:
          category.parent?.id,

        createdAt:
          category.createdAt,

        updatedAt:
          category.updatedAt,
      },
    };
  }

  async remove(
    id: string,
  ): Promise<ApiResponse<null>> {
    const category =
      await this.categoryRepository.findOne({
        id,
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    await this.em.removeAndFlush(
      category,
    );

    return {
      status: 'success',

      message:
        'Category deleted successfully',

      data: null,
    };
  }
}