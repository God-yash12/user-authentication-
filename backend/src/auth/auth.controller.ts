
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, VerifyOtpDto, ResendOtpDto } from './dto/create-auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/initiate')
  async initiateRegistration(@Body() registerUserDto: RegisterUserDto, @Res() res: Response) {
    try {
      const result = await this.authService.initiateRegistration(registerUserDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Registration initiation failed',
      });
    }
  }

  @Post('register/complete')
  async completeRegistration(
    @Body() body: { registerData: RegisterUserDto; otpData: VerifyOtpDto },
    @Res() res: Response
  ) {
    try {
      const user = await this.authService.completeRegistration(body.registerData, body.otpData);
      return res.status(HttpStatus.CREATED).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Registration completion failed',
      });
    }
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto, @Res() res: Response) {
    try {
      const result = await this.authService.resendOtp(resendOtpDto.email);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Failed to resend OTP',
      });
    }
  }
}