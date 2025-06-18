import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { CommonModule } from '../common/common.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, CommonModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
