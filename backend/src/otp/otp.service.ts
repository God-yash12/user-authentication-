import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }
    
    return otp;
  }

  isOTPExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  generateOTPExpiryTime(minutes: number = 10): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
