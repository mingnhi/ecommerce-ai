import {
  ValidationPipe,
} from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import {
  NestExpressApplication,
} from '@nestjs/platform-express';

import {
  SwaggerModule,
} from '@nestjs/swagger';

import { MikroORM } from '@mikro-orm/core';

import { ConfigService } from '@nestjs/config';

import { join } from 'path';

import { AppModule } from './app.module';

import { swaggerConfig } from '@config/swagger.config';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';

import { HttpExceptionFilter } from '@common/filters/exception.filter';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  const configService =
    app.get(ConfigService);

  /**
   * MikroORM
   */
  const orm =
    app.get(MikroORM);

  await orm
    .getSchemaGenerator()
    .updateSchema();

  /**
   * CORS
   */
  app.enableCors({
    origin: '*',

    credentials: true,

    methods:
      'GET,HEAD,PUT,PATCH,POST,DELETE',

    allowedHeaders: '*',
  });

  /**
   * Static uploads
   */
  app.useStaticAssets(
    join(
      __dirname,
      '..',
      'uploads',
    ),
    {
      prefix: '/uploads/',
    },
  );

  /**
   * Swagger
   */
  const document =
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'docs',
    app,
    document,
  );

  /**
   * Validation
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,

      whitelist: true,

      forbidNonWhitelisted: true,
    }),
  );

  /**
   * Global response
   */
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
  );

  /**
   * Exception filter
   */
  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  /**
   * Port
   */
  const port =
    configService.get<number>(
      'APP_PORT',
      3000,
    );

  await app.listen(port);

  console.log(
    `Server running on port ${port}`,
  );

  console.log(
    `Swagger: http://localhost:${port}/docs`,
  );
}

bootstrap();

