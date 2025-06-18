import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      success: true,
      data: user,
    };
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminOnlyRoute(@CurrentUser() user: any) {
    return {
      success: true,
      message: 'This is an admin-only route',
      data: user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser('id') userId: string) {
    // Here you could add the token to a blacklist or clear refresh token
    // For simplicity, we're just returning success
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}