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

import * as fs from 'fs';

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

    @InjectRepository(
      ProductImageEntity,
    )
    private readonly imageRepository: EntityRepository<ProductImageEntity>,
  ) {}

  /**
   * Upload multiple images
   */
  async uploadMany(
    productId: string,
    files: Express.Multer.File[],

    type: ProductImageType =
      ProductImageType.GALLERY,

    sortOrder: number = 0,
  ) {
    try {
      const product =
        await this.productRepository.findOne({
          id: productId,
        });

      if (!product) {
        throw new NotFoundException(
          'Product not found',
        );
      }

      if (!files?.length) {
        throw new NotFoundException(
          'No files uploaded',
        );
      }

      const uploadedImages = [];

      for (
        let i = 0;
        i < files.length;
        i++
      ) {
        const file = files[i];

        try {
          // Upload to cloudinary
          const uploaded =
            await cloudinary.uploader.upload(
              file.path,
              {
                folder: 'products',
              },
            );

          const isThumbnail =
            type ===
              ProductImageType.THUMBNAIL &&
            i === 0;

          // Reset old thumbnail
          if (isThumbnail) {
            await this.em.nativeUpdate(
              ProductImageEntity,
              {
                product:
                  product.id,

                isPrimary: true,
              },
              {
                isPrimary: false,
              },
            );

            product.thumbnail =
              uploaded.secure_url;
          }

          // Create image entity
          const image = this.em.create(
            ProductImageEntity,
            {
              product,

              imageUrl:
                uploaded.secure_url,

              publicId:
                uploaded.public_id,

              type,

              sortOrder:
                sortOrder + i,

              isPrimary:
                isThumbnail,
            },
          );

          this.em.persist(image);

          uploadedImages.push({
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
          });
        } finally {
          // Remove temp file
          if (
            fs.existsSync(file.path)
          ) {
            fs.unlinkSync(file.path);
          }
        }
      }

      // Flush once
      await this.em.flush();

      return {
        images: uploadedImages,
      };
    } catch (error) {
      console.error(
        'UPLOAD IMAGE ERROR:',
        error,
      );

      throw error;
    }
  }

  /**
   * Set image as thumbnail
   */
  async setThumbnail(
    imageId: string,
  ) {
    try {
      const image =
        await this.imageRepository.findOne(
          { id: imageId },
          {
            populate: ['product'],
          },
        );

      if (!image) {
        throw new NotFoundException(
          'Image not found',
        );
      }

      // Reset old thumbnails
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

      // Set new thumbnail
      image.isPrimary = true;

      image.type =
        ProductImageType.THUMBNAIL;

      image.product.thumbnail =
        image.imageUrl;

      await this.em.flush();

      return {
        image: {
          id: image.id,

          imageUrl:
            image.imageUrl,

          isPrimary: true,
        },
      };
    } catch (error) {
      console.error(
        'SET THUMBNAIL ERROR:',
        error,
      );

      throw error;
    }
  }

  /**
   * Delete image
   */
  async remove(imageId: string) {
    try {
      const image =
        await this.imageRepository.findOne(
          { id: imageId },
          {
            populate: ['product'],
          },
        );

      if (!image) {
        throw new NotFoundException(
          'Image not found',
        );
      }

      // Delete cloudinary image
      try {
        await cloudinary.uploader.destroy(
          image.publicId,
        );
      } catch (error) {
        console.warn(
          'Cloudinary delete failed:',
          error,
        );
      }

      // If deleting thumbnail
      if (image.isPrimary) {
        const anotherImage =
          await this.imageRepository.findOne(
            {
              product:
                image.product.id,

              id: {
                $ne: image.id,
              },
            },
            {
              orderBy: {
                createdAt: 'ASC',
              },
            },
          );

        if (anotherImage) {
          anotherImage.isPrimary = true;

          anotherImage.type =
            ProductImageType.THUMBNAIL;

          image.product.thumbnail =
            anotherImage.imageUrl;
        } else {
          image.product.thumbnail =
            null;
        }
      }

      await this.em.removeAndFlush(
        image,
      );

      return {
        message:
          'Image deleted successfully',
      };
    } catch (error) {
      console.error(
        'DELETE IMAGE ERROR:',
        error,
      );

      throw error;
    }
  }
}