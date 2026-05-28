import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@mikro-orm/nestjs';

import {
  EntityManager,
  EntityRepository,
} from '@mikro-orm/core';

import slugify from 'slugify';

import { CategoryEntity } from '@entities/category.entity';

import { CreateCategoryRequest } from './dtos/requests/create-category.request';

import { UpdateCategoryRequest } from './dtos/requests/update-category.request';

import { QueryCategoryRequest } from './dtos/requests/query-category.request';

@Injectable()
export class CategoryService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: EntityRepository<CategoryEntity>,
  ) { }

  private async generateSlug(
    name: string,
  ) {
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;

    let count = 1;

    while (
      await this.categoryRepository.findOne({
        slug,
      })
    ) {
      slug = `${baseSlug}-${count}`;

      count++;
    }

    return slug;
  }

  async create(
    request: CreateCategoryRequest,
  ) {
    let parent:
      | CategoryEntity
      | undefined;

    if (
      request.parentId &&
      request.parentId !== '0'
    ) {
      parent =
        await this.categoryRepository.findOne({
          id: request.parentId,
        });

      if (!parent) {
        throw new NotFoundException(
          'Parent category not found',
        );
      }
    }

    const slug =
      await this.generateSlug(
        request.name,
      );

    const category =
      this.em.create(
        CategoryEntity,
        {
          name: request.name,
          slug,
          parent,
        },
      );

    await this.em.persistAndFlush(
      category,
    );

    return {
      categories: category,
    };
  }

  async findAll(
    query: QueryCategoryRequest,
  ) {
    const categories =
      await this.categoryRepository.findAll({
        populate: ['parent', 'children'],
      });

    if (
      query.type === 'flat'
    ) {
      return {
        categories:
          categories.map(
            category => ({
              id: category.id,
              name:
                category.name,
              slug:
                category.slug,
              parentId:
                category.parent
                  ?.id || null,
              createdAt:
                category.createdAt,
              updatedAt:
                category.updatedAt,
            }),
          ),
      };
    }

    const buildTree = (
      parentId?: string,
    ): unknown[] => {
      return categories
        .filter(category => {
          if (!parentId) {
            return !category.parent;
          }

          return (
            category.parent?.id ===
            parentId
          );
        })
        .map(category => ({
          id: category.id,
          name:
            category.name,
          slug:
            category.slug,
          parentId:
            category.parent
              ?.id || null,
          children:
            buildTree(
              category.id,
            ),
        }));
    };

    return {
      categories:
        buildTree(),
    };
  }

  async update(
    id: string,
    request: UpdateCategoryRequest,
  ) {
    const category =
      await this.categoryRepository.findOne({
        id,
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    if (request.name) {
      category.name =
        request.name;

      category.slug =
        await this.generateSlug(
          request.name,
        );
    }

    if (
      request.parentId !==
      undefined &&
      request.parentId !==
      null
    ) {
      if (
        request.parentId ===
        id
      ) {
        throw new BadRequestException(
          'Category cannot be parent of itself',
        );
      }

      if (
        request.parentId ===
        '0'
      ) {
        category.parent =
          undefined;
      } else {
        const parent =
          await this.categoryRepository.findOne({
            id: request.parentId,
          });

        if (!parent) {
          throw new NotFoundException(
            'Parent category not found',
          );
        }

        category.parent =
          parent;
      }
    }

    await this.em.flush();

    return {
      category,
    };
  }

  async remove(id: string) {
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
      success: true,
    };
  }
}