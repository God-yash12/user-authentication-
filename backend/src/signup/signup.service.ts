import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { OtpService } from '../otp/otp.service';
import { CommonService } from '../common/common.service';
import { SignupDto, VerifyOtpDto } from './dto/create-signup.dto';

@Injectable()
export class SignupService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
    private readonly commonService: CommonService,
  ) {}

  async signup(signupDto: SignupDto) {
    // Verify reCAPTCHA
    // const isValidCaptcha = await this.commonService.verifyRecaptcha(signupDto.recaptchaToken);
    // if (!isValidCaptcha) {
    //   throw new BadRequestException('Invalid reCAPTCHA token');
    // }

    // Create user
    const user = await this.usersService.create({
      fullName: signupDto.fullName,
      email: signupDto.email,
      username: signupDto.username,
      password: signupDto.password,
    });

    // Generate and send OTP
    const otpCode = this.otpService.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.updateOTP(user._id.toString(), otpCode, otpExpiresAt);
    await this.emailService.sendOTPEmail(user.email, otpCode, user.fullName);

    return {
      userId: user._id.toString(),
      email: user.email,
      message: 'OTP sent to your email',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const isValid = await this.usersService.verifyOTP(verifyOtpDto.userId, verifyOtpDto.otpCode);
    
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'Email verified successfully',
    };
  }
}