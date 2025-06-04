import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
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
    private usersRepository: MongoRepository<User>,
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
    if (registerUserDto.recaptchaToken) {
      const isRecaptchaValid = await this.validateRecaptcha(registerUserDto.recaptchaToken);
      if (!isRecaptchaValid) {
        throw new Error('reCAPTCHA verification failed');
      }
    }

    // Check if username exists
    const existingUsername = await this.usersRepository.findOne({
      where: { username: registerUserDto.username }
    });
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // Check if email exists
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerUserDto.email.toLowerCase().trim() }
    });
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    await this.otpService.sendOtp(registerUserDto.email);

    return { message: 'OTP sent to your email. Please verify to complete registration.' };
  }

  async completeRegistration(verifyOtpDto: VerifyOtpDto & RegisterUserDto): Promise<User> {
    console.log('=== REGISTRATION COMPLETION REQUEST ===');
    console.log('Full request body:', JSON.stringify(verifyOtpDto, null, 2));
    
    if (!verifyOtpDto.email) throw new Error('Email is required');
    if (!verifyOtpDto.otp) throw new Error('OTP is required');
    if (!verifyOtpDto.username) throw new Error('Username is required');
    if (!verifyOtpDto.password) throw new Error('Password is required');

    const normalizedEmail = verifyOtpDto.email.toLowerCase().trim();
    const normalizedOtp = verifyOtpDto.otp.trim();
    
    console.log('Registration completion attempt:', {
      email: normalizedEmail,
      otp: normalizedOtp,
      username: verifyOtpDto.username,
      timestamp: new Date().toISOString()
    });

    // Verify OTP
    try {
      const isOtpValid = await this.otpService.verifyOtp(normalizedEmail, normalizedOtp);
      if (!isOtpValid) {
        console.log('OTP verification failed for:', normalizedEmail);
        throw new Error('Invalid or expired OTP');
      }
      console.log('OTP verified successfully for:', normalizedEmail);
    } catch (error) {
      console.error('OTP verification error:', error);
      throw new Error('Invalid or expired OTP');
    }

    // Double-check if user still doesn't exist
    const existingUser = await this.usersRepository.findOne({
      where: {
        $or: [
          { username: verifyOtpDto.username },
          { email: normalizedEmail }
        ]
      }
    });
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(verifyOtpDto.password, salt);

    // Create user
    const user = new User();
    user.username = verifyOtpDto.username;
    user.email = normalizedEmail;
    user.password = hashedPassword;
    user.isEmailVerified = true;
    user.role = 'user'; // Default role, can be changed later

    const savedUser = await this.usersRepository.save(user);
    console.log('User created successfully:', savedUser.email);
    
    return savedUser;
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    await this.otpService.sendOtp(email);
    return { message: 'OTP resent to your email' };
  }
}