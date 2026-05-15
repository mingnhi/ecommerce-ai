import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EntityManager,
  EntityRepository,
} from '@mikro-orm/mysql';

import { InjectRepository } from '@mikro-orm/nestjs';

import { ProductPriceEntity } from '@entities/product-price.entity';

import { ProductEntity } from '@entities/product.entity';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { CreatePriceDto } from './dtos/create-price.dto';

import { UpdatePriceDto } from './dtos/update-price.dto';

import { PriceResponse } from './responses/price.response';

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(
      ProductPriceEntity,
    )
    private readonly priceRepository: EntityRepository<ProductPriceEntity>,

    @InjectRepository(
      ProductEntity,
    )
    private readonly productRepository: EntityRepository<ProductEntity>,

    private readonly em: EntityManager,
  ) {}

  async create(
    dto: CreatePriceDto,
  ): Promise<
    ApiResponse<PriceResponse>
  > {
    const product =
      await this.productRepository.findOne({
        id: dto.productId,
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const price =
      this.priceRepository.create({
        product,

        price: dto.price,

        originalPrice:
          dto.originalPrice,

        discountPercent:
          dto.discountPercent,

        startAt: dto.startAt,

        endAt: dto.endAt,
      });

    await this.em.persistAndFlush(
      price,
    );

    return {
      status: 'success',

      message:
        'Price created successfully',

      data: {
        id: price.id,

        productId:
          price.product.id,

        price: Number(
          price.price,
        ),

        originalPrice:
          price.originalPrice
            ? Number(
                price.originalPrice,
              )
            : undefined,

        discountPercent:
          price.discountPercent,

        startAt:
          price.startAt,

        endAt:
          price.endAt,
      },
    };
  }

  async findByProduct(
    productId: string,
  ): Promise<
    ApiResponse<PriceResponse[]>
  > {
    const prices =
      await this.priceRepository.find(
        {
          product: {
            id: productId,
          },
        },
        {
          populate: ['product'],
        },
      );

    return {
      status: 'success',

      message:
        'Prices fetched successfully',

      data: prices.map(
        price => ({
          id: price.id,

          productId:
            price.product.id,

          price: Number(
            price.price,
          ),

          originalPrice:
            price.originalPrice
              ? Number(
                  price.originalPrice,
                )
              : undefined,

          discountPercent:
            price.discountPercent,

          startAt:
            price.startAt,

          endAt:
            price.endAt,
        }),
      ),
    };
  }

  async update(
    id: string,
    dto: UpdatePriceDto,
  ): Promise<
    ApiResponse<PriceResponse>
  > {
    const price =
      await this.priceRepository.findOne(
        {
          id,
        },
        {
          populate: ['product'],
        },
      );

    if (!price) {
      throw new NotFoundException(
        'Price not found',
      );
    }

    if (
      dto.price !== undefined
    ) {
      price.price = dto.price;
    }

    if (
      dto.originalPrice !==
      undefined
    ) {
      price.originalPrice =
        dto.originalPrice;
    }

    if (
      dto.discountPercent !==
      undefined
    ) {
      price.discountPercent =
        dto.discountPercent;
    }

    if (
      dto.startAt !== undefined
    ) {
      price.startAt =
        dto.startAt;
    }

    if (
      dto.endAt !== undefined
    ) {
      price.endAt = dto.endAt;
    }

    await this.em.persistAndFlush(
      price,
    );

    return {
      status: 'success',

      message:
        'Price updated successfully',

      data: {
        id: price.id,

        productId:
          price.product.id,

        price: Number(
          price.price,
        ),

        originalPrice:
          price.originalPrice
            ? Number(
                price.originalPrice,
              )
            : undefined,

        discountPercent:
          price.discountPercent,

        startAt:
          price.startAt,

        endAt:
          price.endAt,
      },
    };
  }
}