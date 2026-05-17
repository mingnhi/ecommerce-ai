
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@mikro-orm/nestjs';

import {
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/mysql';

import {
  QueryOrder,
} from '@mikro-orm/core';

import slugify from 'slugify';

import { ProductEntity } from '@entities/product.entity';

import { CategoryEntity } from '@entities/category.entity';

import {
  ProductImageType,
} from '@entities/product-image.entity';

import { CreateProductRequest } from './dtos/requests/create-product.request';

import { UpdateProductRequest } from './dtos/requests/update-product.request';

import { QueryProductsRequest } from './dtos/requests/query-products.request';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: EntityRepository<CategoryEntity>,
  ) {}

  async findAll(
    query: QueryProductsRequest,
  ) {
    const page =
      Number(query.page || 1);

    const limit =
      Number(query.limit || 10);

    const where: FilterQuery<ProductEntity> =
      {};

    if (query.search) {
      where.name = {
        $like: `%${query.search}%`,
      };
    }

    if (query.categoryId) {
      where.category =
        query.categoryId;
    }

    const [products, count] =
      await this.productRepository.findAndCount(
        where,
        {
          populate: [
            'category',
            'prices',
            'images',
          ],

          limit,

          offset:
            (page - 1) * limit,

          orderBy:
            this.buildSort(
              query.sort,
            ),
        },
      );

    return {
      data: products.map(product =>
        this.mapSummary(product),
      ),

      meta: {
        count,

        page,

        limit,

        totalPages:
          Math.ceil(
            count / limit,
          ),
      },
    };
  }

  async findOne(
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
            'variants',
            'prices',
            'images',
            'attributes',
            'reviews',
            'reviews.user',
          ],
        },
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    product.viewCount += 1;

    await this.productRepository
      .getEntityManager()
      .flush();

    return this.mapDetail(
      product,
    );
  }

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

    const slug = slugify(
      request.name,
      {
        lower: true,
        strict: true,
      },
    );

    const product =
      this.productRepository.create({
        category,

        name: request.name,

        slug,

        shortDescription:
          request.shortDescription,

        description:
          request.description,

        seoTitle:
          request.seoTitle,

        seoDescription:
          request.seoDescription,

        isActive:
          request.isActive ??
          true,
      });

    await this.productRepository
      .getEntityManager()
      .persistAndFlush(product);

    return this.mapDetail(
      product,
    );
  }

  async update(
    id: string,
    request: UpdateProductRequest,
  ) {
    const product =
      await this.productRepository.findOne(
        {
          id,
        },
        {
          populate: [
            'category',
          ],
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
        slugify(
          request.name,
          {
            lower: true,
            strict: true,
          },
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
      request.seoTitle !==
      undefined
    ) {
      product.seoTitle =
        request.seoTitle;
    }

    if (
      request.seoDescription !==
      undefined
    ) {
      product.seoDescription =
        request.seoDescription;
    }

    if (
      request.isActive !==
      undefined
    ) {
      product.isActive =
        request.isActive;
    }

    await this.productRepository
      .getEntityManager()
      .flush();

    return this.mapDetail(
      product,
    );
  }

  async remove(id: string) {
    const product =
      await this.productRepository.findOne({
        id,
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    await this.productRepository
      .getEntityManager()
      .removeAndFlush(product);

    return null;
  }

  private buildSort(
    sort?: string,
  ) {
    switch (sort) {
      case 'name_asc':
        return {
          name:
            QueryOrder.ASC,
        };

      case 'name_desc':
        return {
          name:
            QueryOrder.DESC,
        };

      case 'oldest':
        return {
          createdAt:
            QueryOrder.ASC,
        };

      default:
        return {
          createdAt:
            QueryOrder.DESC,
        };
    }
  }

  private mapSummary(
    product: ProductEntity,
  ) {
    const thumbnail =
      product.images
        ?.getItems()
        ?.find(
          image =>
            image.type ===
            ProductImageType.THUMBNAIL,
        );

    const price =
      product.prices
        ?.getItems()?.[0];

    return {
      id: product.id,

      name: product.name,

      slug: product.slug,

      shortDescription:
        product.shortDescription,

      thumbnail:
        thumbnail?.imageUrl,

      price:
        price?.price,

      originalPrice:
        price?.originalPrice,

      discountPercent:
        price?.discountPercent,

      category: {
        id:
          product.category.id,

        name:
          product.category.name,

        slug:
          product.category.slug,
      },

      createdAt:
        product.createdAt,
    };
  }

  private mapDetail(
    product: ProductEntity,
  ) {
    return {
      id: product.id,

      name: product.name,

      slug: product.slug,

      shortDescription:
        product.shortDescription,

      description:
        product.description,

      seoTitle:
        product.seoTitle,

      seoDescription:
        product.seoDescription,

      isActive:
        product.isActive,

      viewCount:
        product.viewCount,

      category: {
        id:
          product.category?.id,

        name:
          product.category?.name,

        slug:
          product.category?.slug,
      },

      prices:
        product.prices
          ?.getItems()
          ?.map(price => ({
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
          })) || [],

      variants:
        product.variants
          ?.getItems()
          ?.map(variant => ({
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

            attributes:
              variant.attributes,

            isActive:
              variant.isActive,
          })) || [],

      images:
        product.images
          ?.getItems()
          ?.map(image => ({
            id: image.id,

            imageUrl:
              image.imageUrl,

            type:
              image.type,

            sortOrder:
              image.sortOrder,

            isPrimary:
              image.isPrimary,
          })) || [],

      attributes:
        product.attributes
          ?.getItems()
          ?.map(attribute => ({
            id:
              attribute.id,

            name:
              attribute.name,

            value:
              attribute.value,
          })) || [],

      reviews:
        product.reviews
          ?.getItems()
          ?.map(review => ({
            id: review.id,

            rating:
              review.rating,

            comment:
              review.comment,

            user: {
              id:
                review.user.id,

              displayName:
                review.user
                  .displayName,

              avatarUrl:
                review.user
                  .avatarUrl,
            },

            createdAt:
              review.createdAt,
          })) || [],

      createdAt:
        product.createdAt,

      updatedAt:
        product.updatedAt,
    };
  }
}

