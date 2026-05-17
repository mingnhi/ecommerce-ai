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

import {
  ProductImageEntity,
  ProductImageType,
} from '@entities/product-image.entity';

import { UploadProductImageRequest } from './dtos/requests/upload-product-image.request';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImageEntity)
    private readonly imageRepository: EntityRepository<ProductImageEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,
  ) {}

  async upload(
    productId: string,
    file: Express.Multer.File,
    request: UploadProductImageRequest,
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

    const imageUrl =
      `/uploads/${file.filename}`;

    const image =
      this.imageRepository.create({
        product,

        imageUrl,

        type:
          request.type ||
          ProductImageType.GALLERY,

        sortOrder:
          request.sortOrder ||
          0,

        isPrimary: false,
      });

    await this.imageRepository
      .getEntityManager()
      .persistAndFlush(image);

    return this.mapImage(image);
  }

  async delete(id: string) {
    const image =
      await this.imageRepository.findOne(
        {
          id,
        },
      );

    if (!image) {
      throw new NotFoundException(
        'Image not found',
      );
    }

    await this.imageRepository
      .getEntityManager()
      .removeAndFlush(image);

    return null;
  }

  async setThumbnail(
    id: string,
  ) {
    const image =
      await this.imageRepository.findOne(
        {
          id,
        },
        {
          populate: ['product'],
        },
      );

    if (!image) {
      throw new NotFoundException(
        'Image not found',
      );
    }

    const images =
      await this.imageRepository.find(
        {
          product:
            image.product.id,
        },
      );

    for (const item of images) {
      item.isPrimary = false;

      if (
        item.type ===
        ProductImageType.THUMBNAIL
      ) {
        item.type =
          ProductImageType.GALLERY;
      }
    }

    image.isPrimary = true;

    image.type =
      ProductImageType.THUMBNAIL;

    await this.imageRepository
      .getEntityManager()
      .flush();

    return this.mapImage(image);
  }

  private mapImage(
    image: ProductImageEntity,
  ) {
    return {
      id: image.id,

      imageUrl:
        image.imageUrl,

      type: image.type,

      sortOrder:
        image.sortOrder,

      isPrimary:
        image.isPrimary,

      createdAt:
        image.createdAt,
    };
  }
}