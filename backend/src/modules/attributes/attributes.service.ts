import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EntityManager,
  EntityRepository,
} from '@mikro-orm/mysql';

import { InjectRepository } from '@mikro-orm/nestjs';

import { ProductAttributeEntity } from '@entities/product-attribute.entity';

import { ProductEntity } from '@entities/product.entity';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { CreateAttributeDto } from './dtos/create-attribute.dto';

import { AttributeResponse } from './responses/attribute.response';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(
      ProductAttributeEntity,
    )
    private readonly attributeRepository: EntityRepository<ProductAttributeEntity>,

    @InjectRepository(
      ProductEntity,
    )
    private readonly productRepository: EntityRepository<ProductEntity>,

    private readonly em: EntityManager,
  ) {}

  async create(
    productId: string,
    dto: CreateAttributeDto,
  ): Promise<
    ApiResponse<AttributeResponse>
  > {
    const product =
      await this.productRepository.findOne({
        id: productId,
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const attribute =
      this.attributeRepository.create({
        product,

        name: dto.name,

        value: dto.value,
      });

    await this.em.persistAndFlush(
      attribute,
    );

    return {
      status: 'success',

      message:
        'Attribute created successfully',

      data: {
        id: attribute.id,

        productId:
          attribute.product.id,

        name: attribute.name,

        value: attribute.value,
      },
    };
  }

  async findByProduct(
    productId: string,
  ): Promise<
    ApiResponse<
      AttributeResponse[]
    >
  > {
    const attributes =
      await this.attributeRepository.find(
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
        'Attributes fetched successfully',

      data: attributes.map(
        attribute => ({
          id: attribute.id,

          productId:
            attribute.product.id,

          name:
            attribute.name,

          value:
            attribute.value,
        }),
      ),
    };
  }
}