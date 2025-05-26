import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RegisterUserDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
    private httpService: HttpService,
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

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    // Verify reCAPTCHA only if token is provided
    if (registerUserDto.recaptchaToken) {
      const isRecaptchaValid = await this.validateRecaptcha(registerUserDto.recaptchaToken);
      if (!isRecaptchaValid) {
        throw new Error('reCAPTCHA verification failed');
      }
    }

    // Check if username exists
    const existingUser = await this.usersRepository.findOne({
      where: { username: registerUserDto.username },
    });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);

    // Create user
    const user = this.usersRepository.create({
      username: registerUserDto.username,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }
}