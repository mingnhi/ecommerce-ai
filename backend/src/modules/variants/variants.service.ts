import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EntityManager,
  EntityRepository,
} from '@mikro-orm/mysql';

import { InjectRepository } from '@mikro-orm/nestjs';

import { ProductVariantEntity } from '@entities/product-variant.entity';

import { ProductEntity } from '@entities/product.entity';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { CreateVariantDto } from './dtos/create-variant.dto';

import { UpdateVariantDto } from './dtos/update-variant.dto';

import { VariantResponse } from './responses/variant.response';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(
      ProductVariantEntity,
    )
    private readonly variantRepository: EntityRepository<ProductVariantEntity>,

    @InjectRepository(
      ProductEntity,
    )
    private readonly productRepository: EntityRepository<ProductEntity>,

    private readonly em: EntityManager,
  ) {}

  async create(
    dto: CreateVariantDto,
  ): Promise<
    ApiResponse<VariantResponse>
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

    const variant =
      this.variantRepository.create({
        product,

        sku: dto.sku,

        attributes:
          dto.attributes,

        isActive:
          dto.isActive ?? true,
      });

    await this.em.persistAndFlush(
      variant,
    );

    return {
      status: 'success',

      message:
        'Variant created successfully',

      data: {
        id: variant.id,

        productId:
          variant.product.id,

        sku: variant.sku,

        attributes:
          variant.attributes,

        isActive:
          variant.isActive,

        createdAt:
          variant.createdAt,
      },
    };
  }

  async findByProduct(
    productId: string,
  ): Promise<
    ApiResponse<VariantResponse[]>
  > {
    const variants =
      await this.variantRepository.find(
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
        'Variants fetched successfully',

      data: variants.map(
        variant => ({
          id: variant.id,

          productId:
            variant.product.id,

          sku: variant.sku,

          attributes:
            variant.attributes,

          isActive:
            variant.isActive,

          createdAt:
            variant.createdAt,
        }),
      ),
    };
  }

  async update(
    id: string,
    dto: UpdateVariantDto,
  ): Promise<
    ApiResponse<VariantResponse>
  > {
    const variant =
      await this.variantRepository.findOne(
        {
          id,
        },
        {
          populate: ['product'],
        },
      );

    if (!variant) {
      throw new NotFoundException(
        'Variant not found',
      );
    }

    if (dto.sku) {
      variant.sku = dto.sku;
    }

    if (
      dto.attributes !==
      undefined
    ) {
      variant.attributes =
        dto.attributes;
    }

    if (
      dto.isActive !== undefined
    ) {
      variant.isActive =
        dto.isActive;
    }

    await this.em.persistAndFlush(
      variant,
    );

    return {
      status: 'success',

      message:
        'Variant updated successfully',

      data: {
        id: variant.id,

        productId:
          variant.product.id,

        sku: variant.sku,

        attributes:
          variant.attributes,

        isActive:
          variant.isActive,

        createdAt:
          variant.createdAt,
      },
    };
  }

  async remove(
    id: string,
  ): Promise<ApiResponse<null>> {
    const variant =
      await this.variantRepository.findOne({
        id,
      });

    if (!variant) {
      throw new NotFoundException(
        'Variant not found',
      );
    }

    await this.em.removeAndFlush(
      variant,
    );

    return {
      status: 'success',

      message:
        'Variant deleted successfully',

      data: null,
    };
  }
}