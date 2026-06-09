import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ProductEntity } from '@entities/product.entity';
import { CategoryEntity } from '@entities/category.entity';
import { ProductPriceEntity } from '@entities/product-price.entity';
import { ProductVariantEntity } from '@entities/product-variant.entity';
import { ProductAttributeEntity } from '@entities/product-attribute.entity';
import { ProductReviewEntity } from '@entities/product-review.entity'; 

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
      ProductPriceEntity,
      ProductVariantEntity,
      ProductAttributeEntity,
      ProductReviewEntity, 
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}