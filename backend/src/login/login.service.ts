import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from '../auth/entities/auth.entity';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login.dto';

// Response interfaces
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    role: string;
    createdAt?: Date;
  };
  tokens: AuthTokens;
}

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
    private configService: ConfigService,
    private httpService: HttpService,
    private jwtService: JwtService,
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

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    console.log('=== LOGIN REQUEST ===');
    console.log('Login attempt for email:', loginUserDto.email);

    // Validate input
    if (!loginUserDto.email || !loginUserDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    // Validate reCAPTCHA if provided
    if (loginUserDto.recaptchaToken) {
      const isRecaptchaValid = await this.validateRecaptcha(loginUserDto.recaptchaToken);
      if (!isRecaptchaValid) {
        throw new BadRequestException('reCAPTCHA verification failed');
      }
    }

    // Find user by email
    const user = await this.findByEmail(loginUserDto.email);
    if (!user) {
      console.log('User not found for email:', loginUserDto.email);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', user.email);
      throw new UnauthorizedException('Invalid email or password');
    }

    console.log('Login successful for user:', user.email);

    // Update last login time
    await this.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token to user
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
      },
      tokens,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email: email.toLowerCase().trim() }
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id }
    });
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
      iat: Math.floor(Date.now() / 1000),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(
        { 
          sub: user.id, 
          email: user.email,
          tokenType: 'refresh',
          iat: Math.floor(Date.now() / 1000),
        }, 
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Hash the refresh token before storing for security
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
      updatedAt: new Date(),
    });
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      updatedAt: new Date(),
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if it's actually a refresh token
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find user
      const user = await this.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }


      // Verify stored refresh token matches
      if (user.refreshToken) {
        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
          console.log('Stored refresh token does not match for user:', user.email);
          throw new UnauthorizedException('Invalid refresh token');
        }
      } else {
        throw new UnauthorizedException('No refresh token found for user');
      }

      console.log('Refresh token validated for user:', user.email);

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update stored refresh token with new one
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      console.error('Refresh token validation error:', error.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      // Remove refresh token from database
      await this.usersRepository.update(userId, {
        refreshToken: undefined,
        updatedAt: new Date(),
      });

      console.log('User logged out successfully:', userId);
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw new BadRequestException('Logout failed');
    }
  }

  async validateAccessToken(token: string): Promise<any> {
    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });



      return {
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
        isEmailVerified: payload.isEmailVerified,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      console.error('Access token validation error:', error.message);
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}