import {
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { ProductImageService } from './productimage.service';

import { UploadProductImageRequest } from './dtos/requests/upload-productimage.request';

@Controller()
export class ProductImageController {
  constructor(
    private readonly productImageService: ProductImageService,
  ) {}

  /**
   * upload image
   */
  @Post(
    'products/:id/images',
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination:
          './temp',

        filename: (
          req,
          file,
          callback,
        ) => {
          const unique =
            Date.now() +
            '-' +
            Math.round(
              Math.random() *
                1e9,
            );

          callback(
            null,
            unique +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  async upload(
    @Param('id')
    id: string,

    @UploadedFile()
    file: Express.Multer.File,

    @Body()
    request: UploadProductImageRequest,
  ) {
    return await this.productImageService.upload(
      id,
      file,
      request.type,
      request.sortOrder,
    );
  }

  /**
   * set thumbnail
   */
  @Patch(
    'images/:id/thumbnail',
  )
  async setThumbnail(
    @Param('id')
    id: string,
  ) {
    return await this.productImageService.setThumbnail(
      id,
    );
  }

  /**
   * delete image
   */
  @Delete('images/:id')
  async remove(
    @Param('id')
    id: string,
  ) {
    return await this.productImageService.remove(
      id,
    );
  }
}

