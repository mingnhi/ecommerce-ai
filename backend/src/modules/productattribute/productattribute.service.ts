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

import { ProductAttributeEntity } from '@entities/product-attribute.entity';

import { CreateProductAttributeRequest } from './dtos/requests/create-product-attribute.request';

@Injectable()
export class ProductAttributeService {
  constructor(
    @InjectRepository(ProductAttributeEntity)
    private readonly attributeRepository: EntityRepository<ProductAttributeEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,
  ) {}

  async findByProduct(
    productId: string,
  ) {
    const attributes =
      await this.attributeRepository.find(
        {
          product: productId,
        },
        {
          orderBy: {
            createdAt: 'asc',
          },
        },
      );

    return attributes.map(attribute =>
      this.mapAttribute(attribute),
    );
  }

  async create(
    productId: string,
    request: CreateProductAttributeRequest,
  ) {
    const product =
      await this.productRepository.findOne(
        {
          id: productId,
        },
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const attribute =
      this.attributeRepository.create({
        product,

        name: request.name,

        value: request.value,
      });

    await this.attributeRepository
      .getEntityManager()
      .persistAndFlush(attribute);

    return this.mapAttribute(
      attribute,
    );
  }

  private mapAttribute(
    attribute: ProductAttributeEntity,
  ) {
    return {
      id: attribute.id,

      name: attribute.name,

      value: attribute.value,

      createdAt:
        attribute.createdAt,
    };
  }
}