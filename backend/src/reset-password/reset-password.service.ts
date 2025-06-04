import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../mailer/email.service';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt";
import { AuthService } from '../auth/auth.service';
import { OtpService } from '../mailer/otp.service';

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: EmailService,
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) { }

  async generateOTP(email: string) {
    const user = await this.userRepository.findOne({ where: { email } })
    if (!user) throw new NotFoundException("User with this email does not Found");

    await this.otpService.sendOtp(email);
    return { message: "OTP has been sent to your gmail" };
  }

  async verifyOTP(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException("User Not Found");

    // Use OtpService to verify OTP
    const isValid = await this.otpService.verifyOtp(email, otp);
    if (!isValid) {
      throw new BadRequestException("Invalid OTP or OTP has expired");
    }

    return {
      message: "OTP verified successfully",
    };
  }

  async resetPassword(email: string, newPassword: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) throw new NotFoundException("User Not Found");

      const hashPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashPassword;
      await this.userRepository.save(user);

      return { message: "Password Reset successfully" };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException("Invalid or expired reset token");
      }
      throw error;
    }
  }
}
