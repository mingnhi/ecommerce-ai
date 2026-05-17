import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@mikro-orm/nestjs';

import {
  EntityRepository,
} from '@mikro-orm/mysql';

import slugify from 'slugify';

import { CategoryEntity } from '@entities/category.entity';

import { CreateCategoryRequest } from './dtos/requests/create-category.request';

import { UpdateCategoryRequest } from './dtos/requests/update-category.request';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: EntityRepository<CategoryEntity>,
  ) {}

  async findAll(type: string) {
    const categories =
      await this.categoryRepository.findAll({
        populate: ['parent', 'children'],
        orderBy: {
          createdAt: 'desc',
        },
      });

    if (type === 'tree') {
      return categories
        .filter(category => !category.parent)
        .map(category =>
          this.mapCategoryTree(category),
        );
    }

    return categories.map(category =>
      this.mapCategory(category),
    );
  }

  async create(
    request: CreateCategoryRequest,
  ) {
    let parent:
      | CategoryEntity
      | null = null;

    if (request.parentId) {
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

    const slug = slugify(
      request.name,
      {
        lower: true,
        strict: true,
      },
    );

    const category =
      this.categoryRepository.create({
        name: request.name,
        slug,
        parent,
      });

    await this.categoryRepository
      .getEntityManager()
      .persistAndFlush(category);

    return this.mapCategory(category);
  }

  async update(
    id: string,
    request: UpdateCategoryRequest,
  ) {
    const category =
      await this.categoryRepository.findOne(
        {
          id,
        },
        {
          populate: ['parent'],
        },
      );

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    if (request.name) {
      category.name = request.name;

      category.slug =
        slugify(request.name, {
          lower: true,
          strict: true,
        });
    }

    if (request.parentId) {
      const parent =
        await this.categoryRepository.findOne(
          {
            id: request.parentId,
          },
        );

      if (!parent) {
        throw new NotFoundException(
          'Parent category not found',
        );
      }

      category.parent = parent;
    }

    await this.categoryRepository
      .getEntityManager()
      .flush();

    return this.mapCategory(category);
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

    await this.categoryRepository
      .getEntityManager()
      .removeAndFlush(category);

    return null;
  }

  private mapCategory(
    category: CategoryEntity,
  ) {
    return {
      id: category.id,

      name: category.name,

      slug: category.slug,

      isActive:
        category.isActive,

      createdAt:
        category.createdAt,

      parent: category.parent
        ? {
            id: category.parent.id,
            name: category.parent.name,
            slug: category.parent.slug,
          }
        : null,
    };
  }

  private mapCategoryTree(
    category: CategoryEntity,
  ) {
    return {
      ...this.mapCategory(category),

      children:
        category.children?.getItems().map(
          child =>
            this.mapCategoryTree(
              child,
            ),
        ) || [],
    };
  }
}