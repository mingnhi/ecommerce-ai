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

import { ProductPriceEntity } from '@entities/product-price.entity';

import { CreateProductPriceRequest } from './dtos/requests/create-product-price.request';

import { UpdateProductPriceRequest } from './dtos/requests/update-product-price.request';

@Injectable()
export class ProductPriceService {
  constructor(
    @InjectRepository(ProductPriceEntity)
    private readonly priceRepository: EntityRepository<ProductPriceEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,
  ) {}

  async findByProduct(
    productId: string,
  ) {
    const prices =
      await this.priceRepository.find(
        {
          product: productId,
        },
        {
          orderBy: {
            createdAt: 'desc',
          },
        },
      );

    return prices.map(price =>
      this.mapPrice(price),
    );
  }

  async create(
    request: CreateProductPriceRequest,
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

    const price =
      this.priceRepository.create({
        product,

        price: request.price,

        originalPrice:
          request.originalPrice,

        discountPercent:
          request.discountPercent,

        currency:
          request.currency ||
          'VND',

        isActive:
          request.isActive ??
          true,

        startAt:
          request.startAt,

        endAt:
          request.endAt,
      });

    await this.priceRepository
      .getEntityManager()
      .persistAndFlush(price);

    return this.mapPrice(price);
  }

  async update(
    id: string,
    request: UpdateProductPriceRequest,
  ) {
    const price =
      await this.priceRepository.findOne(
        {
          id,
        },
      );

    if (!price) {
      throw new NotFoundException(
        'Price not found',
      );
    }

    if (request.price !== undefined) {
      price.price =
        request.price;
    }

    if (
      request.originalPrice !==
      undefined
    ) {
      price.originalPrice =
        request.originalPrice;
    }

    if (
      request.discountPercent !==
      undefined
    ) {
      price.discountPercent =
        request.discountPercent;
    }

    if (
      request.currency !==
      undefined
    ) {
      price.currency =
        request.currency;
    }

    if (
      request.isActive !==
      undefined
    ) {
      price.isActive =
        request.isActive;
    }

    if (
      request.startAt !==
      undefined
    ) {
      price.startAt =
        request.startAt;
    }

    if (
      request.endAt !==
      undefined
    ) {
      price.endAt =
        request.endAt;
    }

    await this.priceRepository
      .getEntityManager()
      .flush();

    return this.mapPrice(price);
  }

  private mapPrice(
    price: ProductPriceEntity,
  ) {
    return {
      id: price.id,

      price: price.price,

      originalPrice:
        price.originalPrice,

      discountPercent:
        price.discountPercent,

      currency:
        price.currency,

      isActive:
        price.isActive,

      startAt:
        price.startAt,

      endAt:
        price.endAt,

      createdAt:
        price.createdAt,
    };
  }
}