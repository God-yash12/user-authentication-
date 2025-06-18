import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupDto, VerifyOtpDto } from './dto/create-signup.dto';

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post()
  async signup(@Body() signupDto: SignupDto) {
    try {
      const result = await this.signupService.signup(signupDto);
      return {
        success: true,
        message: 'Account created successfully. Please check your email for OTP verification.',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      const result = await this.signupService.verifyOtp(verifyOtpDto);
      return {
        success: true,
        message: 'Email verified successfully. You can now login.',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}