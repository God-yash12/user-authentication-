import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';


@Controller('auth')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}
  
  @Post('generate-otp')
  async generateOTP(@Body('email') email: string){
    return this.resetPasswordService.generateOTP(email)
  }

  @Post('verify-otp')
  async verifyOTP( @Body() body: {email:string, otp: string}) {
    return this.resetPasswordService.verifyOTP(body.email, body.otp)
  }

  @Post('reset-password')
  async resetPassword( @Body() body: {email:string, newPassword: string }) {
    return this.resetPasswordService.resetPassword (body.email, body.newPassword)
  }
}
