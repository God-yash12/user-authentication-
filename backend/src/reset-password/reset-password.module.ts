import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordController } from './reset-password.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { EmailService } from '../mailer/email.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { OtpService } from '../mailer/otp.service'; 
import { MailerModule } from '../mailer/mailer.module'; 
import { AuthModule } from 'src/auth/auth.module';
import { Mailer } from 'src/mailer/entities/mailer.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Mailer]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h' },
      }),
    }),
    MailerModule,
    AuthModule, // 👈 Add this line
  ],
  controllers: [ResetPasswordController],
  providers: [ResetPasswordService, EmailService, OtpService],
  exports: [ResetPasswordService],
})
export class ResetPasswordModule {}
