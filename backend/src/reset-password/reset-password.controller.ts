import { Controller, Post, Body } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';

@Controller('auth')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  // Generate OTP by email (string)
  @Post('generate-otp')
  async generateOTP(@Body('email') email: string) {
    return this.resetPasswordService.generateOTP(email);
  }

  // Verify OTP by email and otp (both strings)
  @Post('verify-otp')
  async verifyOTP(@Body() body: { email: string; otp: string }) {
    return this.resetPasswordService.verifyOtp(body.email, body.otp);
  }

  // Reset password by email and newPassword
  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; newPassword: string }) {
    return this.resetPasswordService.resetPassword(body.email, body.newPassword);
  }
}
