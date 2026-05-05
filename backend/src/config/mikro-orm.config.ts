import { Options, defineConfig } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import { MySqlDriver } from '@mikro-orm/mysql';
import * as dotenv from 'dotenv';

dotenv.config();

export const mikroOrmConfig = (configService: ConfigService): Options => ({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  driver: MySqlDriver,
  dbName: configService.get<string>('DB_NAME'),
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: parseInt(configService.get<string>('DB_PORT'), 10) || 3306,
  user: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/databases/migrations',
  },
});

// Cấu hình tĩnh cho CLI
export default defineConfig({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  driver: MySqlDriver,
  dbName: process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/databases/migrations',
  },
});
