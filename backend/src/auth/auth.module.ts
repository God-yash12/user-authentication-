import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/auth.entity';
import { Mailer } from '../mailer/entities/mailer.entity';
import { EmailService } from '../mailer/email.service';
import { OtpService } from '../mailer/otp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Mailer]),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, OtpService],
})
export class AuthModule {}