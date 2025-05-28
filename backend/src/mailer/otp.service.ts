import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Mailer } from './entities/mailer.entity';
import { EmailService } from './email.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Mailer)
    private readonly otpRepository: MongoRepository<Mailer>,
    private readonly emailService: EmailService,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizeEmail(email: string): string {
    if (!email) {
      throw new Error('Email is required');
    }
    return email.toLowerCase().trim();
  }

  async sendOtp(email: string): Promise<void> {
    if (!email) {
      throw new Error('Email is required for sending OTP');
    }

    const normalizedEmail = this.normalizeEmail(email);

    console.log('=== SENDING OTP ===');
    console.log('Original email:', email);
    console.log('Normalized email:', normalizedEmail);

    // Clean up expired OTPs first
    await this.cleanupExpiredOtps();

    // Remove any existing OTPs for this email
    const deleteResult = await this.otpRepository.deleteMany({
      email: normalizedEmail,
    });
    console.log('Deleted existing OTPs count:', deleteResult.deletedCount);

    // Generate new OTP
    const otpCode = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    console.log('Generated OTP code:', otpCode);
    console.log('OTP expires at:', expiresAt);

    // Create and save OTP
    const otp = new Mailer();
    otp.email = normalizedEmail;
    otp.otp = otpCode;
    otp.expiresAt = expiresAt;
    otp.isUsed = false;

    const savedOtp = await this.otpRepository.save(otp);
    console.log('Saved OTP to database:', {
      _id: savedOtp._id,
      email: savedOtp.email,
      otp: savedOtp.otp,
      isUsed: savedOtp.isUsed,
      expiresAt: savedOtp.expiresAt,
    });

    // Send OTP via email
    await this.emailService.sendOtpEmail(normalizedEmail, otpCode);
    console.log('=== OTP SENDING COMPLETE ===');
  }

  async verifyOtp(email: string, otpCode: string): Promise<boolean> {
    console.log('=== VERIFYING OTP - INPUT CHECK ===');
    console.log('Raw email input:', email, 'Type:', typeof email);
    console.log('Raw OTP input:', otpCode, 'Type:', typeof otpCode);

    if (!email) {
      console.error('Email is undefined or empty');
      throw new Error('Email is required for OTP verification');
    }

    if (!otpCode) {
      console.error('OTP code is undefined or empty');
      throw new Error('OTP code is required');
    }

    const normalizedEmail = this.normalizeEmail(email);
    const normalizedOtp = otpCode.trim();

    console.log('=== VERIFYING OTP ===');
    console.log('Input email:', email);
    console.log('Normalized email:', normalizedEmail);
    console.log('Input OTP:', otpCode);
    console.log('Normalized OTP:', normalizedOtp);
    console.log('Current time:', new Date());

    try {
      // Test the repository connection first
      console.log('Testing repository connection...');
      const totalCount = await this.otpRepository.count();
      console.log('Repository connection test - total OTP count:', totalCount);

      // Find OTPs for this specific email
      console.log('Querying OTPs for email:', normalizedEmail);
      const otpsForEmail = await this.otpRepository.find({
        where: { email: normalizedEmail },
        order: { createdAt: 'DESC' },
      });
      console.log('Query successful - found', otpsForEmail.length, 'OTPs for email');

      console.log('=== OTPs FOR THIS EMAIL ===');
      if (otpsForEmail.length === 0) {
        console.log('No OTPs found for email:', normalizedEmail);
        return false;
      }

      otpsForEmail.forEach((otp, index) => {
        console.log(`Email OTP ${index + 1}:`, {
          _id: otp._id,
          email: otp.email,
          otp: otp.otp,
          isUsed: otp.isUsed,
          expiresAt: otp.expiresAt,
          isExpired: new Date() > otp.expiresAt,
          otpMatch: otp.otp === normalizedOtp,
        });
      });

      // Find the exact matching OTP
      console.log('Looking for exact OTP match...');
      const otp = await this.otpRepository.findOne({
        where: {
          email: normalizedEmail,
          otp: normalizedOtp,
          isUsed: false,
          expiresAt: { $gt: new Date() }, // Not expired
        },
      });

      if (!otp) {
        console.log('=== VERIFICATION FAILED - NO MATCHING OTP ===');
        return false;
      }

      console.log('Found valid OTP:', {
        _id: otp._id,
        expiresAt: otp.expiresAt,
        isUsed: otp.isUsed,
      });

      // Mark OTP as used
      otp.isUsed = true;
      await this.otpRepository.save(otp);
      console.log('OTP marked as used successfully');

      console.log('=== VERIFICATION SUCCESSFUL ===');
      return true;
    } catch (error) {
      console.error('=== ERROR DURING OTP VERIFICATION ===', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  private async cleanupExpiredOtps(): Promise<void> {
    try {
      const result = await this.otpRepository.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      console.log('Cleaned up expired OTPs:', result.deletedCount);
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}