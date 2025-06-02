import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/auth.entity';
import { MailerModule } from '../mailer/mailer.module'; // Import MailerModule instead of services directly

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Only register User entity here
    HttpModule.registerAsync({ // Configure HttpModule properly
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT'),
        maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule, // Required for ConfigService
    MailerModule, // This provides EmailService and OtpService
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, TypeOrmModule], // Export if needed by other modules
})
export class AuthModule {}