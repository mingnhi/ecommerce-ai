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
} from '@mikro-orm/mysql';

import slugify from 'slugify';

import { ProductEntity } from '@entities/product.entity';

import { CategoryEntity } from '@entities/category.entity';

import { ProductPriceEntity } from '@entities/product-price.entity';

import { ProductVariantEntity } from '@entities/product-variant.entity';

import { ProductAttributeEntity } from '@entities/product-attribute.entity';

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
    const baseSlug = slugify(
      name,
      {
        lower: true,

        strict: true,
      },
    );

    let slug = baseSlug;

    let count = 1;

    while (
      await this.productRepository.findOne(
        {
          slug,

          ...(productId && {
            id: {
              $ne: productId,
            },
          }),
        },
      )
    ) {
      slug = `${baseSlug}-${count}`;

      count++;
    }

    return slug;
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
     * search
     */
    if (query.search) {
      where.name = {
        $like: `%${query.search}%`,
      };
    }

    /**
     * category
     */
    if (query.categoryId) {
      where.category =
        query.categoryId;
    }

    /**
     * products
     */
    const [products, total] =
      await this.productRepository.findAndCount(
        where,
        {
          populate: [
            'category',
            'prices',
            'images',
          ],

          orderBy: {
            createdAt:
              query.sort ===
              'oldest'
                ? QueryOrder.ASC
                : QueryOrder.DESC,
          },

          limit,

          offset:
            (page - 1) * limit,
        },
      );

    return {
      message:
        'Get products successfully',

      data: {
        products: products.map(
          product => {
            const thumbnail =
              product.images.find(
                image =>
                  image.isPrimary,
              );

            const activePrice =
              product.prices.find(
                price =>
                  price.isActive,
              );

            return {
              id: product.id,

              name:
                product.name,

              slug:
                product.slug,

              shortDescription:
                product.shortDescription,

              isActive:
                product.isActive,

              thumbnail:
                thumbnail?.imageUrl,

              category: {
                id:
                  product.category.id,

                name:
                  product.category.name,

                slug:
                  product.category.slug,
              },

              price: activePrice
                ? {
                    price:
                      activePrice.price,

                    originalPrice:
                      activePrice.originalPrice,

                    discountPercent:
                      activePrice.discountPercent,

                    currency:
                      activePrice.currency,
                  }
                : null,

              createdAt:
                product.createdAt,
            };
          },
        ),
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
            'prices',
            'variants',
            'attributes',
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
            product.prices.map(
              price => ({
                id: price.id,

                price:
                  price.price,

                originalPrice:
                  price.originalPrice,

                discountPercent:
                  price.discountPercent,

                currency:
                  price.currency,

                isActive:
                  price.isActive,
              }),
            ),

          variants:
            product.variants.map(
              variant => ({
                id: variant.id,

                title:
                  variant.title,

                sku:
                  variant.sku,

                stock:
                  variant.stock,

                image:
                  variant.image,

                price:
                  variant.price,

                isActive:
                  variant.isActive,

                attributes:
                  variant.attributes,
              }),
            ),

          attributes:
            product.attributes.map(
              attr => ({
                id: attr.id,

                name:
                  attr.name,

                value:
                  attr.value,
              }),
            ),

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

    /**
     * slug
     */
    const slug =
      await this.generateSlug(
        request.name,
      );

    return await this.em.transactional(
      async em => {
        /**
         * product
         */
        const product =
          em.create(
            ProductEntity,
            {
              category,

              name:
                request.name,

              slug,

              shortDescription:
                request.shortDescription,

              description:
                request.description,

              isActive:
                request.isActive ??
                true,
            },
          );

        em.persist(product);

        /**
         * prices
         */
        if (
          request.prices
            ?.length
        ) {
          const prices =
            request.prices.map(
              item =>
                em.create(
                  ProductPriceEntity,
                  {
                    product,

                    price:
                      item.price,

                    originalPrice:
                      item.originalPrice,

                    discountPercent:
                      item.discountPercent,

                    currency:
                      item.currency ||
                      'VND',

                    isActive:
                      true,
                  },
                ),
            );

          em.persist(prices);
        }

        /**
         * variants
         */
        if (
          request.variants
            ?.length
        ) {
          const variants =
            request.variants.map(
              item =>
                em.create(
                  ProductVariantEntity,
                  {
                    product,

                    title:
                      item.title,

                    sku:
                      item.sku,

                    stock:
                      item.stock ||
                      0,

                    image:
                      item.image,

                    price:
                      item.price,

                    attributes:
                      item.attributes,

                    isActive:
                      true,
                  },
                ),
            );

          em.persist(
            variants,
          );
        }

        /**
         * attributes
         */
        if (
          request.attributes
            ?.length
        ) {
          const attributes =
            request.attributes.map(
              item =>
                em.create(
                  ProductAttributeEntity,
                  {
                    product,

                    name:
                      item.name,

                    value:
                      item.value,
                  },
                ),
            );

          em.persist(
            attributes,
          );
        }

        await em.flush();

        const productDetail =
          await this.findBySlug(
            slug,
          );

        return {
          message:
            'Create product successfully',

          data: {
            product:
              productDetail.data
                .product,
          },

          meta: {},
        };
      },
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

    /**
     * category
     */
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

    /**
     * update info
     */
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
      request.isActive !==
      undefined
    ) {
      product.isActive =
        request.isActive;
    }

    return await this.em.transactional(
      async em => {
        /**
         * delete old prices
         */
        await em.nativeDelete(
          ProductPriceEntity,
          {
            product,
          },
        );

        /**
         * delete old variants
         */
        await em.nativeDelete(
          ProductVariantEntity,
          {
            product,
          },
        );

        /**
         * delete old attributes
         */
        await em.nativeDelete(
          ProductAttributeEntity,
          {
            product,
          },
        );

        /**
         * prices
         */
        if (
          request.prices
            ?.length
        ) {
          const prices =
            request.prices.map(
              item =>
                em.create(
                  ProductPriceEntity,
                  {
                    product,

                    price:
                      item.price,

                    originalPrice:
                      item.originalPrice,

                    discountPercent:
                      item.discountPercent,

                    currency:
                      item.currency ||
                      'VND',

                    isActive:
                      true,
                  },
                ),
            );

          em.persist(prices);
        }

        /**
         * variants
         */
        if (
          request.variants
            ?.length
        ) {
          const variants =
            request.variants.map(
              item =>
                em.create(
                  ProductVariantEntity,
                  {
                    product,

                    title:
                      item.title,

                    sku:
                      item.sku,

                    stock:
                      item.stock ||
                      0,

                    image:
                      item.image,

                    price:
                      item.price,

                    attributes:
                      item.attributes,

                    isActive:
                      true,
                  },
                ),
            );

          em.persist(
            variants,
          );
        }

        /**
         * attributes
         */
        if (
          request.attributes
            ?.length
        ) {
          const attributes =
            request.attributes.map(
              item =>
                em.create(
                  ProductAttributeEntity,
                  {
                    product,

                    name:
                      item.name,

                    value:
                      item.value,
                  },
                ),
            );

          em.persist(
            attributes,
          );
        }

        await em.flush();

        const productDetail =
          await this.findBySlug(
            product.slug,
          );

        return {
          message:
            'Update product successfully',

          data: {
            product:
              productDetail.data
                .product,
          },

          meta: {},
        };
      },
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

