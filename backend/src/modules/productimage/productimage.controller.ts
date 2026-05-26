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

import { ProductImageService } from './productimage.service';
import { UploadProductImageRequest } from './dtos/requests/upload-productimage.request';
import { ProductImageResponse } from './dtos/responses/product-image.response';

@Controller()
export class ProductImageController {
  constructor(
    private readonly productImageService: ProductImageService,
  ) {}

  /**
   * Upload multiple images for a product
   */
  @Post('products/:id/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadMany(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() request: UploadProductImageRequest,
  ) {
    return await this.productImageService.uploadMany(
      id,
      files,
      request.type,
      request.sortOrder,
    );
  }

  /**
   * Set an image as thumbnail
   */
  @Patch('images/:id/thumbnail')
  async setThumbnail(@Param('id') id: string) {
    return await this.productImageService.setThumbnail(id);
  }

  /**
   * Delete an image
   */
  @Delete('images/:id')
  async remove(@Param('id') id: string) {
    return await this.productImageService.remove(id);
  }
}