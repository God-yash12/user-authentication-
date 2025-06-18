import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupController } from './signup.controller';
import { CommonModule } from '../common/common.module';
import { EmailModule } from '../email/email.module';
import { OtpModule } from '../otp/otp.module';
import { UsersModule } from '../users/users.module';

@Module({
   imports: [UsersModule, EmailModule, OtpModule, CommonModule],
  controllers: [SignupController],
  providers: [SignupService],
})
export class SignupModule {}
