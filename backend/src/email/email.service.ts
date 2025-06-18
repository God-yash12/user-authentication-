import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOTPEmail(email: string, otpCode: string, fullName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Auth App'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Email Verification - OTP Code',
        html: this.getOTPEmailTemplate(fullName, otpCode),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      throw new Error('Failed to send OTP email');
    }
  }

  private getOTPEmailTemplate(fullName: string, otpCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #ddd; }
            .header { text-align: center; margin-bottom: 30px; }
            .otp-code { background: #007bff; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px; margin: 20px 0; letter-spacing: 3px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            
            <p>Hello <strong>${fullName}</strong>,</p>
            
            <p>Thank you for creating an account with us! To complete your registration, please verify your email address using the OTP code below:</p>
            
            <div class="otp-code">${otpCode}</div>
            
            <div class="warning">
              <p><strong>Important:</strong> This OTP code will expire in 10 minutes. Please use it as soon as possible.</p>
            </div>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Auth App'}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}