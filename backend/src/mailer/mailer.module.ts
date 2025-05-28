import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
// import { MailerController } from './mailer.controller';

@Module({
  // controllers: [MailerController],
  providers: [EmailService],
})
export class MailerModule {}
