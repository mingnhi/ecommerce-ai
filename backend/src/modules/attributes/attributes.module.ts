import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ProductAttributeEntity } from '@entities/product-attribute.entity';

import { ProductEntity } from '@entities/product.entity';

import { AttributesController } from './attributes.controller';

import { AttributesService } from './attributes.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductAttributeEntity,
      ProductEntity,
    ]),
  ],

  controllers: [
    AttributesController,
  ],

  providers: [AttributesService],

  exports: [AttributesService],
})
export class AttributesModule {}