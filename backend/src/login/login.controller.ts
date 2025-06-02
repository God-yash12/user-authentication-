import { 
  Controller, 
  Post, 
  Body, 
  UnauthorizedException,
  BadRequestException,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { LoginService } from './login.service';
import { 
  LoginUserDto, 
  RefreshTokenDto, 
  LogoutDto, 
  ValidateTokenDto,
} from './dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const result = await this.loginService.login(loginUserDto);
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Login failed. Please try again.');
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const tokens = await this.loginService.refreshTokens(refreshTokenDto.refreshToken);
      return {
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDto) {
    try {
      const result = await this.loginService.logout(logoutDto.userId);
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      throw new BadRequestException('Logout failed');
    }
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() validateTokenDto: ValidateTokenDto) {
    try {
      const payload = await this.loginService.validateAccessToken(validateTokenDto.token);
      return { 
        success: true,
        valid: true, 
        data: {
          user: {
            userId: payload.userId,
            email: payload.email,
            username: payload.username,
            isEmailVerified: payload.isEmailVerified,
          }
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Additional utility endpoint - get current user info
  @UseGuards(JwtAuthGuard)
  @Post('user-info')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Request() req) {
    try {
      const user = await this.loginService.findById(req.user.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
          }
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Unable to fetch user information');
    }
  }
}