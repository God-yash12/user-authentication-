import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CommonService } from './common.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt-strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PassportModule, UsersModule],
  providers: [CommonService, JwtAuthGuard, RolesGuard, JwtStrategy],
  exports: [CommonService, JwtAuthGuard, RolesGuard, JwtStrategy],
})
export class CommonModule {}