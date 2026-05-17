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

import { ProductEntity } from '@entities/product.entity';

import { ProductVariantEntity } from '@entities/product-variant.entity';

import { CreateVariantRequest } from './dtos/requests/create-variant.request';

import { UpdateVariantRequest } from './dtos/requests/update-variant.request';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepository: EntityRepository<ProductVariantEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,
  ) {}

  async findByProduct(
    productId: string,
  ) {
    const variants =
      await this.variantRepository.find(
        {
          product: productId,
        },
        {
          orderBy: {
            createdAt: 'desc',
          },
        },
      );

    return variants.map(variant =>
      this.mapVariant(variant),
    );
  }

  async create(
    request: CreateVariantRequest,
  ) {
    const product =
      await this.productRepository.findOne(
        {
          id: request.productId,
        },
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const variant =
      this.variantRepository.create({
        product,

        title: request.title,

        sku: request.sku,

        attributes:
          request.attributes,

        stock:
          request.stock || 0,

        image:
          request.image,

        price:
          request.price,

        isActive:
          request.isActive ??
          true,
      });

    await this.variantRepository
      .getEntityManager()
      .persistAndFlush(variant);

    return this.mapVariant(
      variant,
    );
  }

  async update(
    id: string,
    request: UpdateVariantRequest,
  ) {
    const variant =
      await this.variantRepository.findOne(
        {
          id,
        },
      );

    if (!variant) {
      throw new NotFoundException(
        'Variant not found',
      );
    }

    if (request.title !== undefined) {
      variant.title =
        request.title;
    }

    if (request.sku !== undefined) {
      variant.sku =
        request.sku;
    }

    if (
      request.attributes !==
      undefined
    ) {
      variant.attributes =
        request.attributes;
    }

    if (request.stock !== undefined) {
      variant.stock =
        request.stock;
    }

    if (request.image !== undefined) {
      variant.image =
        request.image;
    }

    if (request.price !== undefined) {
      variant.price =
        request.price;
    }

    if (
      request.isActive !==
      undefined
    ) {
      variant.isActive =
        request.isActive;
    }

    await this.variantRepository
      .getEntityManager()
      .flush();

    return this.mapVariant(
      variant,
    );
  }

  async remove(id: string) {
    const variant =
      await this.variantRepository.findOne(
        {
          id,
        },
      );

    if (!variant) {
      throw new NotFoundException(
        'Variant not found',
      );
    }

    await this.variantRepository
      .getEntityManager()
      .removeAndFlush(variant);

    return null;
  }

  private mapVariant(
    variant: ProductVariantEntity,
  ) {
    return {
      id: variant.id,

      title: variant.title,

      sku: variant.sku,

      stock: variant.stock,

      image: variant.image,

      price: variant.price,

      attributes:
        variant.attributes,

      isActive:
        variant.isActive,

      createdAt:
        variant.createdAt,
    };
  }
}