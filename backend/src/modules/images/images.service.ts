import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EntityManager,
  EntityRepository,
} from '@mikro-orm/mysql';

import { InjectRepository } from '@mikro-orm/nestjs';

import { ProductImageEntity } from '@entities/product-image.entity';

import { ProductEntity } from '@entities/product.entity';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { UploadImageDto } from './dtos/upload-image.dto';

import { ImageResponse } from './responses/image.response';
import {
  ProductImageType,
} from './dtos/upload-image.dto';

import * as fs from 'fs';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(
      ProductImageEntity,
    )
    private readonly imageRepository: EntityRepository<ProductImageEntity>,

    @InjectRepository(
      ProductEntity,
    )
    private readonly productRepository: EntityRepository<ProductEntity>,

    private readonly em: EntityManager,
  ) {}

  async upload(
    productId: string,
    file: Express.Multer.File,
    dto: UploadImageDto,
  ): Promise<
    ApiResponse<ImageResponse>
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

    if (dto.isPrimary) {
      await this.imageRepository.nativeUpdate(
        {
          product: {
            id: productId,
          },
        },
        {
          isPrimary: false,
        },
      );
    }

    const image =
      this.imageRepository.create({
        product,

        imageUrl:
          '/uploads/products/' +
          file.filename,

       type:
            dto.type ||
            ProductImageType.GALLERY,

        sortOrder:
          dto.sortOrder || 0,

        isPrimary:
          dto.isPrimary ||
          false,
      });

    await this.em.persistAndFlush(
      image,
    );

    return {
      status: 'success',

      message:
        'Image uploaded successfully',

      data: {
        id: image.id,

        productId:
          image.product.id,

        imageUrl:
          image.imageUrl,

        type: image.type,

        sortOrder:
          image.sortOrder,

        isPrimary:
          image.isPrimary,
      },
    };
  }

  async remove(
    id: string,
  ): Promise<ApiResponse<null>> {
    const image =
      await this.imageRepository.findOne({
        id,
      });

    if (!image) {
      throw new NotFoundException(
        'Image not found',
      );
    }

    const path =
      '.' + image.imageUrl;

    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    await this.em.removeAndFlush(
      image,
    );

    return {
      status: 'success',

      message:
        'Image deleted successfully',

      data: null,
    };
  }

  async setThumbnail(
    id: string,
  ): Promise<
    ApiResponse<ImageResponse>
  > {
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

    await this.imageRepository.nativeUpdate(
      {
        product: {
          id: image.product.id,
        },
      },
      {
        isPrimary: false,
      },
    );

    image.isPrimary = true;

    image.type =
        ProductImageType.THUMBNAIL;

    await this.em.persistAndFlush(
      image,
    );

    return {
      status: 'success',

      message:
        'Thumbnail updated successfully',

      data: {
        id: image.id,

        productId:
          image.product.id,

        imageUrl:
          image.imageUrl,

        type: image.type,

        sortOrder:
          image.sortOrder,

        isPrimary:
          image.isPrimary,
      },
    };
  }
}