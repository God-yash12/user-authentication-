import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);

  async verifyRecaptcha(token: string): Promise<boolean> {
    try {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (!secretKey) {
        this.logger.error('reCAPTCHA secret key is not configured');
        return false;
      }

      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: secretKey,
            response: token,
          },
        },
      );

      const { success, score } = response.data;
      
      // For reCAPTCHA v2, we only check success
      // For reCAPTCHA v3, you might want to check the score as well
      return success === true;
    } catch (error) {
      this.logger.error('reCAPTCHA verification failed:', error.message);
      return false;
    }
  }

  sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  generateRandomString(length: number = 32): string {
    return Math.random().toString(36).substring(2, length + 2);
  }
}