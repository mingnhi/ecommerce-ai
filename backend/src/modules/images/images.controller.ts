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

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { ImagesService } from './images.service';

import { UploadImageDto } from './dtos/upload-image.dto';

@Controller()
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
  ) {}

  @Post(
    'products/:id/images',
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination:
          './uploads/products',

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
  upload(
    @Param('id')
    productId: string,

    @UploadedFile()
    file: Express.Multer.File,

    @Body()
    dto: UploadImageDto,
  ) {
    return this.imagesService.upload(
      productId,
      file,
      dto,
    );
  }

  @Delete('images/:id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.imagesService.remove(
      id,
    );
  }

  @Patch(
    'images/:id/thumbnail',
  )
  setThumbnail(
    @Param('id')
    id: string,
  ) {
    return this.imagesService.setThumbnail(
      id,
    );
  }
}