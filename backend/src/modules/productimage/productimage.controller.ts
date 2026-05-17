import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { ProductImageService } from './productimage.service';

import { UploadProductImageRequest } from './dtos/requests/upload-product-image.request';

@Controller()
export class ProductImageController {
  constructor(
    private readonly productImageService: ProductImageService,
  ) {}

  @Post(
    'products/:id/images',
  )
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage: diskStorage({
          destination:
            './uploads',

          filename: (
            req,
            file,
            callback,
          ) => {
            const uniqueName =
              `${Date.now()}${extname(file.originalname)}`;

            callback(
              null,
              uniqueName,
            );
          },
        }),
      },
    ),
  )
  async upload(
    @Param('id')
    productId: string,

    @UploadedFile()
    file: Express.Multer.File,

    @Body()
    request: UploadProductImageRequest,
  ) {
    const data =
      await this.productImageService.upload(
        productId,
        file,
        request,
      );

    return {
      status: 'success',

      message:
        'Image uploaded successfully',

      data,
    };
  }

  @Delete('images/:id')
  async delete(
    @Param('id')
    id: string,
  ) {
    await this.productImageService.delete(
      id,
    );

    return {
      status: 'success',

      message:
        'Image deleted successfully',

      data: null,
    };
  }

  @Patch(
    'images/:id/thumbnail',
  )
  async setThumbnail(
    @Param('id')
    id: string,
  ) {
    const data =
      await this.productImageService.setThumbnail(
        id,
      );

    return {
      status: 'success',

      message:
        'Thumbnail updated successfully',

      data,
    };
  }
}