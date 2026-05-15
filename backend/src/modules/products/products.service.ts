import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EntityManager,
  EntityRepository,
} from '@mikro-orm/mysql';

import { InjectRepository } from '@mikro-orm/nestjs';

import { ProductEntity } from '@entities/product.entity';

import { CategoryEntity } from '@entities/category.entity';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { CreateProductDto } from './dtos/create-product.dto';

import { UpdateProductDto } from './dtos/update-product.dto';

import { QueryProductsDto } from './dtos/query-products.dto';

import { ProductResponse } from './responses/product.response';

import { ProductPaginationResponse } from './responses/product-pagination.response';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(
      ProductEntity,
    )
    private readonly productRepository: EntityRepository<ProductEntity>,

    @InjectRepository(
      CategoryEntity,
    )
    private readonly categoryRepository: EntityRepository<CategoryEntity>,

    private readonly em: EntityManager,
  ) {}

  async create(
    dto: CreateProductDto,
  ): Promise<
    ApiResponse<ProductResponse>
  > {
    let category:
      | CategoryEntity
      | null = null;

    if (dto.categoryId) {
      category =
        await this.categoryRepository.findOne({
          id: dto.categoryId,
        });

      if (!category) {
        throw new NotFoundException(
          'Category not found',
        );
      }
    }

    const product =
      this.productRepository.create({
        name: dto.name,

        slug:
          dto.slug ||
          dto.name
            .toLowerCase()
            .replace(/\s+/g, '-'),

        description:
          dto.description,

        isActive:
          dto.isActive ?? true,

        category,
      });

    await this.em.persistAndFlush(
      product,
    );

    return {
      status: 'success',

      message:
        'Product created successfully',

      data: {
        id: product.id,

        name: product.name,

        slug: product.slug,

        description:
          product.description,

        isActive:
          product.isActive,

        categoryId:
          product.category?.id,

        categoryName:
          product.category?.name,

        createdAt:
          product.createdAt,

        updatedAt:
          product.updatedAt,
      },
    };
  }

  async findAll(
    query: QueryProductsDto,
  ): Promise<
    ApiResponse<ProductPaginationResponse>
  > {
    const page =
      Number(query.page) || 1;

    const limit =
      Number(query.limit) || 10;

    const where: any = {};

    if (query.search) {
      where.name = {
        $like: `%${query.search}%`,
      };
    }

    if (query.categoryId) {
      where.category = {
        id: query.categoryId,
      };
    }

    if (
      query.isActive !== undefined
    ) {
      where.isActive =
        query.isActive === 'true';
    }

    let orderBy: any = {
      createdAt: 'DESC',
    };

    switch (query.sort) {
      case 'oldest':
        orderBy = {
          createdAt: 'ASC',
        };
        break;

      case 'name_asc':
        orderBy = {
          name: 'ASC',
        };
        break;

      case 'name_desc':
        orderBy = {
          name: 'DESC',
        };
        break;
    }

    const [products, total] =
      await this.productRepository.findAndCount(
        where,
        {
          populate: ['category'],

          limit,

          offset:
            (page - 1) * limit,

          orderBy,
        },
      );

    return {
      status: 'success',

      message:
        'Products fetched successfully',

      data: {
        items: products.map(
          product => ({
            id: product.id,

            name: product.name,

            slug: product.slug,

            description:
              product.description,

            isActive:
              product.isActive,

            categoryId:
              product.category?.id,

            categoryName:
              product.category?.name,

            createdAt:
              product.createdAt,

            updatedAt:
              product.updatedAt,
          }),
        ),

        total,

        page,

        limit,

        totalPages:
          Math.ceil(total / limit),
      },

      meta: {
        count: total,
        page,
        limit,
        totalPages:
          Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    slug: string,
  ): Promise<
    ApiResponse<ProductResponse>
  > {
    const product =
      await this.productRepository.findOne(
        {
          slug,
        },
        {
          populate: ['category'],
        },
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    return {
      status: 'success',

      message:
        'Product fetched successfully',

      data: {
        id: product.id,

        name: product.name,

        slug: product.slug,

        description:
          product.description,

        isActive:
          product.isActive,

        categoryId:
          product.category?.id,

        categoryName:
          product.category?.name,

        createdAt:
          product.createdAt,

        updatedAt:
          product.updatedAt,
      },
    };
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<
    ApiResponse<ProductResponse>
  > {
    const product =
      await this.productRepository.findOne(
        {
          id,
        },
        {
          populate: ['category'],
        },
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    if (dto.categoryId) {
      const category =
        await this.categoryRepository.findOne({
          id: dto.categoryId,
        });

      if (!category) {
        throw new NotFoundException(
          'Category not found',
        );
      }

      product.category =
        category;
    }

    if (dto.name) {
      product.name = dto.name;
    }

    if (dto.slug) {
      product.slug = dto.slug;
    }

    if (
      dto.description !== undefined
    ) {
      product.description =
        dto.description;
    }

    if (
      dto.isActive !== undefined
    ) {
      product.isActive =
        dto.isActive;
    }

    await this.em.persistAndFlush(
      product,
    );

    return {
      status: 'success',

      message:
        'Product updated successfully',

      data: {
        id: product.id,

        name: product.name,

        slug: product.slug,

        description:
          product.description,

        isActive:
          product.isActive,

        categoryId:
          product.category?.id,

        categoryName:
          product.category?.name,

        createdAt:
          product.createdAt,

        updatedAt:
          product.updatedAt,
      },
    };
  }

  async remove(
    id: string,
  ): Promise<ApiResponse<null>> {
    const product =
      await this.productRepository.findOne({
        id,
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    await this.em.removeAndFlush(
      product,
    );

    return {
      status: 'success',

      message:
        'Product deleted successfully',

      data: null,
    };
  }
}