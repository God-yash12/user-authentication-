import { 
  Controller, 
  Post, 
  Body, 
  UnauthorizedException,
  BadRequestException,
  UseGuards,
  Request,
  Response,
  HttpCode,
  HttpStatus,
  Req,
  Res
} from '@nestjs/common';
import { Response as ExpressResponse, Request as ExpressRequest } from 'express';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        username: string;
        isEmailVerified: boolean;
      };
    }
  }
}
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
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: ExpressResponse
  ) {
    try {
      const result = await this.loginService.login(loginUserDto);
      
      // Set tokens as secure HTTP cookies
      this.setTokenCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          // Remove these lines if you want cookies-only approach
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
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: ExpressResponse
  ) {
    try {
      // Try to get refresh token from cookie first, then fallback to body
      const refreshToken = request.cookies?.refreshToken || refreshTokenDto.refreshToken;
      
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not provided');
      }

      const tokens = await this.loginService.refreshTokens(refreshToken);
      
      // Set new tokens as cookies
      this.setTokenCookies(response, tokens.accessToken, tokens.refreshToken);
      
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
  async logout(
    @Body() logoutDto: LogoutDto,
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: ExpressResponse
  ) {
    try {
      // Try to get userId from request user (if authenticated) or from body
      const userId = request.user?.userId || logoutDto.userId;
      
      if (userId) {
        const result = await this.loginService.logout(userId);
      }
      
      // Clear token cookies
      this.clearTokenCookies(response);
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      // Still clear cookies even if logout fails
      this.clearTokenCookies(response);
      throw new BadRequestException('Logout failed');
    }
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(
    @Body() validateTokenDto: ValidateTokenDto,
    @Req() request: ExpressRequest
  ) {
    try {
      // Try to get token from cookie first, then fallback to body
      const token = request.cookies?.accessToken || validateTokenDto.token;
      
      if (!token) {
        throw new UnauthorizedException('Access token not provided');
      }

      const payload = await this.loginService.validateAccessToken(token);
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

  // Helper method to set token cookies
  private setTokenCookies(response: ExpressResponse, accessToken: string, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set access token cookie
    response.cookie('accessToken', accessToken, {
      httpOnly: true,              // Prevents XSS - can't be accessed via JavaScript
      secure: isProduction,        // Only send over HTTPS in production
      sameSite: 'strict',          // CSRF protection - 'strict', 'lax', or 'none'
      maxAge: 15 * 60 * 1000,      // 15 minutes (should match JWT expiry)
      path: '/',                   // Available to all routes
    });

    // Set refresh token cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (should match JWT expiry)
      path: '/',
    });
  }

  // Helper method to clear token cookies
  private clearTokenCookies(response: ExpressResponse): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    });

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    });
  }
}