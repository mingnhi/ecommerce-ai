import {
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { ProductImageService } from './productimage.service';

import { UploadProductImageRequest } from './dtos/requests/upload-productimage.request';

@Controller()
export class ProductImageController {
  constructor(
    private readonly productImageService: ProductImageService,
  ) {}

  /**
   * Upload multiple images for product
   */
  @Post('products/:id/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './temp',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueSuffix =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          callback(
            null,
            uniqueSuffix +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  async uploadMany(
    @Param('id') id: string,

    @UploadedFiles()
    files: Express.Multer.File[],

    @Body()
    request: UploadProductImageRequest,
  ): Promise<ApiResponse<any>> {
    const data =
      await this.productImageService.uploadMany(
        id,
        files,
        request.type,
        request.sortOrder,
      );

    return {
      status: 'success',
      message:
        'Upload images successfully',
      data,
      meta: {
        count:
          data.images.length,
      },
    };
  }

  /**
   * Set thumbnail
   */
  @Patch('images/:id/thumbnail')
  async setThumbnail(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
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

  /**
   * Delete image
   */
  @Delete('images/:id')
  async remove(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    const data =
      await this.productImageService.remove(
        id,
      );

    return {
      status: 'success',
      message:
        'Image deleted successfully',
      data,
    };
  }
}