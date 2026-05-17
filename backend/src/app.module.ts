
import { Module } from '@nestjs/common';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  MikroOrmModule,
} from '@mikro-orm/nestjs';

import {
  mikroOrmConfig,
} from '@config/mikro-orm.config';

import { AppController } from './app.controller';

import { AppService } from './app.service';

import { CategoryModule } from './modules/categories/categories.module';

import { ProductsModule } from './modules/products/products.module';

import { VariantsModule } from './modules/productvariant/productvariant.module';

import { ProductPriceModule } from './modules/productprice/productprice.module';

import { ProductAttributeModule } from './modules/productattribute/productattribute.module';

import { ProductImageModule } from './modules/productimage/productimage.module';

import { ProductReviewModule } from './modules/productreview/productreview.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) =>
        mikroOrmConfig(
          configService,
        ),
    }),

    CategoryModule,

    ProductsModule,

    VariantsModule,

    ProductPriceModule,

    ProductAttributeModule,

    ProductImageModule,

    ProductReviewModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}

