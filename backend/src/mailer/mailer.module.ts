import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mailer } from './entities/mailer.entity';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mailer]), // <-- this is required!
  ],
  providers: [OtpService, EmailService],
  exports: [OtpService],
})
export class MailerModule {}
