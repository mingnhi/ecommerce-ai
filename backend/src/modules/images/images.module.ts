import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ProductImageEntity } from '@entities/product-image.entity';

import { ProductEntity } from '@entities/product.entity';

import { ImagesController } from './images.controller';

import { ImagesService } from './images.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductImageEntity,
      ProductEntity,
    ]),
  ],

  controllers: [
    ImagesController,
  ],

  providers: [ImagesService],

  exports: [ImagesService],
})
export class ImagesModule {}