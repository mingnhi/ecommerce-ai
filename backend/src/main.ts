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

import { ConfigService } from '@nestjs/config';

import { MikroORM } from '@mikro-orm/core';

import { join } from 'path';

import { AppModule } from './app.module';

import { swaggerConfig } from '@config/swagger.config';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';

import { HttpExceptionFilter } from '@common/filters/exception.filter';

async function bootstrap() {
  /**
   * create app
   */
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  /**
   * config
   */
  const configService =
    app.get(ConfigService);

  /**
   * mikro orm
   */
  const orm =
    app.get(MikroORM);

  /**
   * update schema
   */
  // chỉ dùng dev
  await orm
    .getSchemaGenerator()
    .updateSchema();

  /**
   * cors
   */
  app.enableCors({
    origin: '*',

    credentials: true,

    methods:
      'GET,HEAD,PUT,PATCH,POST,DELETE',

    allowedHeaders: '*',
  });

  /**
   * static uploads
   */
  app.useStaticAssets(
    join(
      process.cwd(),
      'uploads',
    ),
    {
      prefix: '/uploads/',
    },
  );

  /**
   * global prefix
   */
  app.setGlobalPrefix('api');

  /**
   * validation
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,

      whitelist: true,

      forbidNonWhitelisted: true,
    }),
  );

  /**
   * response interceptor
   */
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
  );

  /**
   * exception filter
   */
  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  /**
   * swagger
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
   * port
   */
  const port =
    configService.get<number>(
      'APP_PORT',
      3000,
    );

  await app.listen(port);

  console.log(
    `Server running: http://localhost:${port}`,
  );

  console.log(
    `Swagger docs: http://localhost:${port}/docs`,
  );
}

bootstrap();
