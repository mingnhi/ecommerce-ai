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
} from '@mikro-orm/mysql';

import cloudinary from '@config/cloudinary.config';

import { ProductEntity } from '@entities/product.entity';

import {
  ProductImageEntity,
  ProductImageType,
} from '@entities/product-image.entity';

@Injectable()
export class ProductImageService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,

    @InjectRepository(ProductImageEntity)
    private readonly imageRepository: EntityRepository<ProductImageEntity>,
  ) {}

  /**
   * upload image
   */
  async upload(
    productId: string,
    file: Express.Multer.File,
    type: ProductImageType,
    sortOrder: number,
  ) {
    const product =
      await this.productRepository.findOne({
        id: productId,
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    /**
     * upload cloudinary
     */
    const uploaded =
      await cloudinary.uploader.upload(
        file.path,
        {
          folder: 'products',
        },
      );

    /**
     * set old thumbnail false
     */
    if (
      type ===
      ProductImageType.THUMBNAIL
    ) {
      await this.em.nativeUpdate(
        ProductImageEntity,
        {
          product: product.id,
          isPrimary: true,
        },
        {
          isPrimary: false,
        },
      );
    }

    /**
     * create image
     */
    const image =
      this.em.create(
        ProductImageEntity,
        {
          product,

          imageUrl:
            uploaded.secure_url,

          type,

          sortOrder,

          isPrimary:
            type ===
            ProductImageType.THUMBNAIL,
        },
      );

    await this.em.persistAndFlush(
      image,
    );

    return {
      message:
        'Upload image successfully',

      image: {
        id: image.id,

        imageUrl:
          image.imageUrl,

        type:
          image.type,

        sortOrder:
          image.sortOrder,

        isPrimary:
          image.isPrimary,

        createdAt:
          image.createdAt,
      },
    };
  }

  /**
   * set thumbnail
   */
  async setThumbnail(
    imageId: string,
  ) {
    const image =
      await this.imageRepository.findOne({
        id: imageId,
      });

    if (!image) {
      throw new NotFoundException(
        'Image not found',
      );
    }

    await this.em.nativeUpdate(
      ProductImageEntity,
      {
        product:
          image.product.id,
        isPrimary: true,
      },
      {
        isPrimary: false,
      },
    );

    image.isPrimary = true;

    image.type =
      ProductImageType.THUMBNAIL;

    await this.em.flush();

    return {
      message:
        'Thumbnail updated successfully',
    };
  }

  /**
   * delete image
   */
  async remove(imageId: string) {
    const image =
      await this.imageRepository.findOne({
        id: imageId,
      });

    if (!image) {
      throw new NotFoundException(
        'Image not found',
      );
    }

    await this.em.removeAndFlush(
      image,
    );

    return {
      message:
        'Image deleted successfully',
    };
  }
}

