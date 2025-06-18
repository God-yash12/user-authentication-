import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CommonService } from '../common/common.service';
import { LoginDto } from './dto/create-login.dto';

@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly commonService: CommonService,
  ) {}

  async login(loginDto: LoginDto) {
    // Verify reCAPTCHA
    // const isValidCaptcha = await this.commonService.verifyRecaptcha(loginDto.recaptchaToken);
    // if (!isValidCaptcha) {
    //   throw new BadRequestException('Invalid reCAPTCHA token');
    // }

    // Find user by email or username
    const user = await this.usersService.findByEmailOrUsername(loginDto.identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60));
      throw new ForbiddenException(`Account is locked. Try again in ${remainingTime} minutes.`);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      await this.usersService.incrementLoginAttempts(user._id.toString());
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.usersService.resetLoginAttempts(user._id.toString());

    // Generate tokens
    const payload = { 
      sub: user._id.toString(), 
      email: user.email, 
      username: user.username,
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token
    await this.usersService.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user: {
        userId: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Validate refresh token
      const isValidRefreshToken = await this.usersService.validateRefreshToken(
        user._id.toString(),
        refreshToken,
      );

      if (!isValidRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const newPayload = {
        sub: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });

      return {
        accessToken: newAccessToken,
        expiresIn: 900,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}