
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RegisterUserDto, VerifyOtpDto } from './dto/create-auth.dto';
import { OtpService } from '../mailer/otp.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
    private httpService: HttpService,
    private otpService: OtpService,
  ) { }

  async validateRecaptcha(token: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    const secret = this.configService.get<string>('recaptcha.secretKey');
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

    try {
      const response = await firstValueFrom(this.httpService.post(url));
      return response.data.success;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return false;
    }
  }

  async initiateRegistration(registerUserDto: RegisterUserDto): Promise<{ message: string }> {
    // Verify reCAPTCHA only if token is provided
    if (registerUserDto.recaptchaToken) {
      const isRecaptchaValid = await this.validateRecaptcha(registerUserDto.recaptchaToken);
      if (!isRecaptchaValid) {
        throw new Error('reCAPTCHA verification failed');
      }
    }

    // Check if username exists
    const existingUsername = await this.usersRepository.findOne({
      where: { username: registerUserDto.username },
    });
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // Check if email exists
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerUserDto.email },
    });
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Store registration data temporarily (you might want to use Redis or database)
    // For now, we'll send OTP and expect the frontend to store the registration data
    await this.otpService.sendOtp(registerUserDto.email);

    return { message: 'OTP sent to your email. Please verify to complete registration.' };
  }

  async completeRegistration(verifyOtpDto: VerifyOtpDto & RegisterUserDto): Promise<User> {
    // Verify OTP
    const isOtpValid = await this.otpService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
    if (!isOtpValid) {
      throw new Error('Invalid or expired OTP');
    }

    // Double-check if user still doesn't exist
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: verifyOtpDto.username },
        { email: verifyOtpDto.email }
      ],
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(verifyOtpDto.password, salt);

    // Create user
    const user = this.usersRepository.create({
      username: verifyOtpDto.username,
      email: verifyOtpDto.email,
      password: hashedPassword,
      isEmailVerified: true,
    });

    return this.usersRepository.save(user);
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    // Check if email exists in pending registrations or needs verification
    await this.otpService.sendOtp(email);
    return { message: 'OTP resent to your email' };
  }
}