import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { User } from '../auth/entities/auth.entity'; // Import from auth module
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'), // Default secret
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    HttpModule,
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtAuthGuard],
  exports: [LoginService, JwtAuthGuard, JwtModule],
})
export class LoginModule {}