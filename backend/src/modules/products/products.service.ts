import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@mikro-orm/nestjs';

import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  QueryOrder,
} from '@mikro-orm/core';

import slugify from 'slugify';

import { ProductEntity } from '@entities/product.entity';

import { CategoryEntity } from '@entities/category.entity';

import { CreateProductRequest } from './dtos/requests/create-product.request';

import { UpdateProductRequest } from './dtos/requests/update-product.request';

import { QueryProductRequest } from './dtos/requests/query-product.request';

@Injectable()
export class ProductsService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: EntityRepository<CategoryEntity>,
  ) {}

  /**
   * generate slug
   */
  private async generateSlug(
    name: string,
    productId?: string,
  ) {
    const baseSlug =
      slugify(name, {
        lower: true,
        strict: true,
      });

    let slug = baseSlug;

    let count = 1;

    while (
      await this.productRepository.findOne({
        slug,

        ...(productId && {
          id: {
            $ne: productId,
          },
        }),
      })
    ) {
      slug = `${baseSlug}-${count}`;

      count++;
    }

    return slug;
  }

  /**
   * calculate discount price
   */
  private calculateDiscountPrice(
    originalPrice: number,
    discountPercent?: number,
  ) {
    if (
      !discountPercent ||
      discountPercent <= 0
    ) {
      return originalPrice;
    }

    const discount =
      (originalPrice *
        discountPercent) /
      100;

    return Math.round(
      originalPrice - discount,
    );
  }

  /**
   * get products
   */
  async findAll(
    query: QueryProductRequest,
  ) {
    const page =
      Number(query.page || 1);

    const limit =
      Number(query.limit || 10);

    const where: FilterQuery<ProductEntity> =
      {};

    /**
     * SEARCH
     */
    if (query.search) {
      where.$or = [
        {
          name: {
            $like: `%${query.search}%`,
          },
        },

        {
          shortDescription: {
            $like: `%${query.search}%`,
          },
        },
      ];
    }

    /**
     * FILTER CATEGORY
     */
    if (query.categoryId) {
      where.category =
        query.categoryId;
    }

    /**
     * FILTER STATUS
     */
    if (
      query.isActive !== undefined
    ) {
      where.isActive =
        query.isActive;
    }

    /**
     * SORT
     */
    let orderBy: any = {
      createdAt:
        QueryOrder.DESC,
    };

    switch (query.sort) {
      case 'oldest':
        orderBy = {
          createdAt:
            QueryOrder.ASC,
        };
        break;

      case 'name_asc':
        orderBy = {
          name:
            QueryOrder.ASC,
        };
        break;

      case 'name_desc':
        orderBy = {
          name:
            QueryOrder.DESC,
        };
        break;

      default:
        orderBy = {
          createdAt:
            QueryOrder.DESC,
        };
        break;
    }

    const [products, total] =
      await this.productRepository.findAndCount(
        where,
        {
          populate: [
            'category',
            'images',
          ],

          orderBy,

          limit,

          offset:
            (page - 1) * limit,
        },
      );

    /**
     * FORMAT PRODUCTS
     */
    let formattedProducts =
      products.map(product => {
        const primaryImage =
          product.images.find(
            image =>
              image.isPrimary,
          );

        const activePrice =
          product.prices?.find(
            price =>
              price.isActive,
          ) ||
          product.prices?.[0] ||
          null;

        return {
          id: product.id,

          name:
            product.name,

          slug:
            product.slug,

          shortDescription:
            product.shortDescription,

          /**
           * thumbnail
           */
          thumbnail:
            product.thumbnail ||
            primaryImage
              ?.imageUrl ||
            product.images[0]
              ?.imageUrl ||
            null,

          isActive:
            product.isActive,

          category: {
            id:
              product.category.id,

            name:
              product.category.name,

            slug:
              product.category.slug,
          },

          price: activePrice,

          createdAt:
            product.createdAt,
        };
      });

    /**
     * SORT PRICE
     */
    if (
      query.sort ===
      'price_asc'
    ) {
      formattedProducts.sort(
        (a, b) =>
          (a.price?.price || 0) -
          (b.price?.price || 0),
      );
    }

    if (
      query.sort ===
      'price_desc'
    ) {
      formattedProducts.sort(
        (a, b) =>
          (b.price?.price || 0) -
          (a.price?.price || 0),
      );
    }

    return {
      message:
        'Get products successfully',

      data: {
        products:
          formattedProducts,
      },

      meta: {
        pagination: {
          page,

          limit,

          totalItems:
            total,

          totalPages:
            Math.ceil(
              total / limit,
            ),
        },

        filters: {
          search:
            query.search ||
            null,

          categoryId:
            query.categoryId ||
            null,

          isActive:
            query.isActive,

          sort:
            query.sort,
        },
      },
    };
  }

  /**
   * get detail
   */
  async findBySlug(
    slug: string,
  ) {
    const product =
      await this.productRepository.findOne(
        {
          slug,
        },
        {
          populate: [
            'category',
            'images',
            'reviews',
          ],
        },
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const totalReviews =
      product.reviews.length;

    const averageRating =
      totalReviews > 0
        ? product.reviews.reduce(
            (
              total,
              review,
            ) =>
              total +
              review.rating,
            0,
          ) / totalReviews
        : 0;

    const primaryImage =
      product.images.find(
        image =>
          image.isPrimary,
      );

    return {
      message:
        'Get product successfully',

      data: {
        product: {
          id: product.id,

          name:
            product.name,

          slug:
            product.slug,

          shortDescription:
            product.shortDescription,

          description:
            product.description,

          thumbnail:
            product.thumbnail ||
            primaryImage
              ?.imageUrl ||
            product.images[0]
              ?.imageUrl ||
            null,

          isActive:
            product.isActive,

          createdAt:
            product.createdAt,

          updatedAt:
            product.updatedAt,

          category: {
            id:
              product.category.id,

            name:
              product.category.name,

            slug:
              product.category.slug,
          },

          prices:
            product.prices ||
            [],

          variants:
            product.variants ||
            [],

          attributes:
            product.attributes ||
            [],

          images:
            product.images.map(
              image => ({
                id: image.id,

                imageUrl:
                  image.imageUrl,

                type:
                  image.type,

                sortOrder:
                  image.sortOrder,

                isPrimary:
                  image.isPrimary,
              }),
            ),

          reviewSummary: {
            averageRating:
              Number(
                averageRating.toFixed(
                  1,
                ),
              ),

            totalReviews,
          },
        },
      },

      meta: {},
    };
  }

  /**
   * create product
   */
  async create(
    request: CreateProductRequest,
  ) {
    const category =
      await this.categoryRepository.findOne(
        {
          id: request.categoryId,
        },
      );

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    const slug =
      await this.generateSlug(
        request.name,
      );

    const product =
      this.productRepository.create(
        {
          category,

          name:
            request.name,

          slug,

          shortDescription:
            request.shortDescription,

          description:
            request.description,

          thumbnail:
            request.thumbnail,

          isActive:
            request.isActive ??
            true,

          prices:
            request.prices?.map(
              item => ({
                originalPrice:
                  item.originalPrice,

                discountPercent:
                  item.discountPercent ||
                  0,

                price:
                  this.calculateDiscountPrice(
                    item.originalPrice,
                    item.discountPercent,
                  ),

                currency:
                  item.currency ||
                  'VND',

                isActive:
                  item.isActive ??
                  true,
              }),
            ) || [],

          variants:
            request.variants ||
            [],

          attributes:
            request.attributes ||
            [],
        },
      );

    await this.em.persistAndFlush(
      product,
    );

    return await this.findBySlug(
      slug,
    );
  }

  /**
   * update product
   */
  async update(
    id: string,
    request: UpdateProductRequest,
  ) {
    const product =
      await this.productRepository.findOne(
        {
          id,
        },
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    if (request.categoryId) {
      const category =
        await this.categoryRepository.findOne(
          {
            id: request.categoryId,
          },
        );

      if (!category) {
        throw new NotFoundException(
          'Category not found',
        );
      }

      product.category =
        category;
    }

    if (request.name) {
      product.name =
        request.name;

      product.slug =
        await this.generateSlug(
          request.name,
          id,
        );
    }

    if (
      request.shortDescription !==
      undefined
    ) {
      product.shortDescription =
        request.shortDescription;
    }

    if (
      request.description !==
      undefined
    ) {
      product.description =
        request.description;
    }

    if (
      request.thumbnail !==
      undefined
    ) {
      product.thumbnail =
        request.thumbnail;
    }

    if (
      request.isActive !==
      undefined
    ) {
      product.isActive =
        request.isActive;
    }

    if (request.prices) {
      product.prices =
        request.prices.map(
          item => ({
            originalPrice:
              item.originalPrice,

            discountPercent:
              item.discountPercent ||
              0,

            price:
              this.calculateDiscountPrice(
                item.originalPrice,
                item.discountPercent,
              ),

            currency:
              item.currency ||
              'VND',

            isActive:
              item.isActive ??
              true,
          }),
        );
    }

    if (request.variants) {
      product.variants =
        request.variants;
    }

    if (request.attributes) {
      product.attributes =
        request.attributes;
    }

    await this.em.flush();

    return await this.findBySlug(
      product.slug,
    );
  }

  /**
   * delete product
   */
  async remove(id: string) {
    const product =
      await this.productRepository.findOne(
        {
          id,
        },
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    await this.em.removeAndFlush(
      product,
    );

    return {
      message:
        'Delete product successfully',

      data: null,

      meta: {},
    };
  }
}