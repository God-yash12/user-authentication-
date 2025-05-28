import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
require('dotenv').config();

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'mongodb',
    url: configService.get<string>('DATABASE_URL'),
    // url: process.env.DATABASE_URL.trim(),
    autoLoadEntities: true,
    synchronize: true,
    logging: true
});