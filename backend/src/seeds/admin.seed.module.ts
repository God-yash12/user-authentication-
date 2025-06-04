import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/auth.entity'; 
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AdminSeedModule {}
