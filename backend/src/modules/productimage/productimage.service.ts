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
} from '@mikro-orm/core';

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
     * old thumbnail false
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

      /**
       * update product thumbnail
       */
      product.thumbnail =
        uploaded.secure_url;

      await this.em.flush();
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

          publicId:
            uploaded.public_id,

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

      data: {
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
      },

      meta: {},
    };
  }

  /**
   * set thumbnail
   */
  async setThumbnail(
    imageId: string,
  ) {
    const image =
      await this.imageRepository.findOne(
        {
          id: imageId,
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

    /**
     * old thumbnail false
     */
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

    /**
     * set new thumbnail
     */
    image.isPrimary = true;

    image.type =
      ProductImageType.THUMBNAIL;

    /**
     * update product thumbnail
     */
    image.product.thumbnail =
      image.imageUrl;

    await this.em.flush();

    return {
      message:
        'Thumbnail updated successfully',

      data: {
        image: {
          id: image.id,

          isPrimary: true,

          imageUrl:
            image.imageUrl,
        },
      },

      meta: {},
    };
  }

  /**
   * delete image
   */
  async remove(imageId: string) {
    const image =
      await this.imageRepository.findOne(
        {
          id: imageId,
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

    /**
     * delete cloudinary
     */
    await cloudinary.uploader.destroy(
      image.publicId,
    );

    /**
     * reset thumbnail
     */
    if (image.isPrimary) {
      image.product.thumbnail =
        null;
    }

    /**
     * delete db
     */
    await this.em.removeAndFlush(
      image,
    );

    return {
      message:
        'Image deleted successfully',

      data: null,

      meta: {},
    };
  }
}