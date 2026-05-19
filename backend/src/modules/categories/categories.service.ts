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
} from '@mikro-orm/mysql';

import { CategoryEntity } from '@entities/category.entity';

import slugify from 'slugify';

import { CreateCategoryRequest } from './dtos/requests/create-category.request';

import { UpdateCategoryRequest } from './dtos/requests/update-category.request';

import { QueryCategoryRequest } from './dtos/requests/query-category.request';

@Injectable()
export class CategoryService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: EntityRepository<CategoryEntity>,
  ) {}

  /**
   * generate slug
   */
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

  /**
   * create category
   */
  async create(
    request: CreateCategoryRequest,
  ) {
    let parent:
      | CategoryEntity
      | undefined;

    /**
     * parent category
     */
    if (request.parentId) {
      parent =
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
    }

    /**
     * slug
     */
    const slug =
      await this.generateSlug(
        request.name,
      );

    /**
     * category
     */
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
      message:
        'Create category successfully',

      data: {
        category,
      },

      meta: {},
    };
  }

  /**
   * get categories
   */
  async findAll(
    query: QueryCategoryRequest,
  ) {
    const categories =
      await this.categoryRepository.findAll(
        {
          populate: ['parent', 'children'],
        },
      );

    /**
     * flat
     */
    if (
      query.type === 'flat'
    ) {
      return {
        message:
          'Get categories successfully',

        data: {
          categories:
            categories.map(
              category => ({
                id: category.id,

                name:
                  category.name,

                slug:
                  category.slug,

                parentId:
                  category.parent?.id ??
                  null,

                createdAt:
                  category.createdAt,

                updatedAt:
                  category.updatedAt,
              }),
            ),
        },

        meta: {},
      };
    }

    /**
     * tree
     */
    const buildTree = (
      parentId?: string,
    ): any[] => {
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

          children:
            buildTree(
              category.id,
            ),
        }));
    };

    return {
      message:
        'Get categories successfully',

      data: {
        categories:
          buildTree(),
      },

      meta: {
        type:
          query.type ??
          'tree',
      },
    };
  }

  /**
   * update category
   */
  async update(
    id: string,
    request: UpdateCategoryRequest,
  ) {
    const category =
      await this.categoryRepository.findOne(
        {
          id,
        },
      );

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    /**
     * name
     */
    if (request.name) {
      category.name =
        request.name;

      category.slug =
        await this.generateSlug(
          request.name,
        );
    }

    /**
     * parent
     */
    if (request.parentId) {
      if (
        request.parentId === id
      ) {
        throw new BadRequestException(
          'Category cannot be parent of itself',
        );
      }

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

      category.parent =
        parent;
    }

    await this.em.flush();

    return {
      message:
        'Update category successfully',

      data: {
        category,
      },

      meta: {},
    };
  }

  /**
   * delete category
   */
  async remove(id: string) {
    const category =
      await this.categoryRepository.findOne(
        {
          id,
        },
      );

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    await this.em.removeAndFlush(
      category,
    );

    return {
      message:
        'Delete category successfully',

      data: null,

      meta: {},
    };
  }
}

