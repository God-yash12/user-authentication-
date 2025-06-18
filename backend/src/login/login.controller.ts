import { Controller, Post, Body, HttpStatus, HttpException, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginService } from './login.service';
import { LoginDto, RefreshTokenDto } from './dto/create-login.dto';

@Controller('login')
@UseGuards(ThrottlerGuard)
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.loginService.login(loginDto);
      return {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const result = await this.loginService.refreshToken(refreshTokenDto.refreshToken);
      return {
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
