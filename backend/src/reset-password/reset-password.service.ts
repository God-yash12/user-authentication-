import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt";
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service'; 

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly otpService: OtpService, 
  ) {}

  // Generate OTP by email (since controller sends email)
  async generateOTP(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException("User not found");

     const otpCode = this.otpService.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.updateOTP(user._id.toString(), otpCode, otpExpiresAt);
    await this.emailService.sendOTPEmail(user.email, otpCode, user.fullName);

    return { 
      userId: user._id.toString(),
      email: user.email,
      message: "OTP has been sent to your email" 
    };
  }

  // Verify OTP by userId and otpCode
  async verifyOtp(email: string, otpCode: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException("User not found");

    const isValid = await this.usersService.verifyOTP(user._id.toString(), otpCode);
    
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'OTP verified successfully',
    };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException("User not found");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: "Password reset successfully" };
  }
}
