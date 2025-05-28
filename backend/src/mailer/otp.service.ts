
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Mailer } from './entities/mailer.entity';
import { EmailService } from './email.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Mailer)
    private otpRepository: Repository<Mailer>,
    private emailService: EmailService,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string): Promise<void> {
    // Clean up expired OTPs
    await this.cleanupExpiredOtps();

    // Generate new OTP
    const otpCode = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Save OTP to database
    const otp = this.otpRepository.create({
      email,
      otp: otpCode,
      expiresAt,
    });

    await this.otpRepository.save(otp);

    // Send OTP via email
    await this.emailService.sendOtpEmail(email, otpCode);
  }

  async verifyOtp(email: string, otpCode: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        otp: otpCode,
        isUsed: false,
      },
    });

    if (!otp) {
      return false;
    }

    // Check if OTP is expired
    if (new Date() > otp.expiresAt) {
      return false;
    }

    // Mark OTP as used
    otp.isUsed = true;
    await this.otpRepository.save(otp);

    return true;
  }

  private async cleanupExpiredOtps(): Promise<void> {
    await this.otpRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}