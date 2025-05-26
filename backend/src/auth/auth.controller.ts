import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/create-auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async register(@Body() registerUserDto: RegisterUserDto, @Res() res: Response) {
    try {
      const user = await this.authService.register(registerUserDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Registration failed',
      });
    }
  }
}