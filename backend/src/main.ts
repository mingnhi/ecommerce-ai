import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { MikroORM } from '@mikro-orm/core';

import { ConfigService } from '@nestjs/config';

import { SwaggerModule } from '@nestjs/swagger';

import { swaggerConfig } from '@config/swagger.config';

import {
  ValidationPipe,
} from '@nestjs/common';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';

import { HttpExceptionFilter } from '@common/filters/exception.filter';

import { NestExpressApplication } from '@nestjs/platform-express';

import { join } from 'path';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  const configService =
    app.get(ConfigService);

  const orm = app.get(MikroORM);

  await orm
    .getSchemaGenerator()
    .updateSchema();

  app.enableCors({
    origin: '*',

    methods:
      'GET,HEAD,PUT,PATCH,POST,DELETE',

    allowedHeaders: '*',

    credentials: true,
  });

  app.useStaticAssets(
    join(__dirname, '..', 'uploads'),
    {
      prefix: '/uploads/',
    },
  );

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

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,

      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(
    new ResponseInterceptor(),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  const port =
    configService.get<number>(
      'APP_PORT',
      3000,
    );

  await app.listen(port);

  console.log(
    `Server running on port ${port}`,
  );
}

bootstrap();