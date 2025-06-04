import { Module } from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import { UserInfoController } from './user-info.controller';
import { User } from '../auth/entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserInfoController],
  providers: [UserInfoService],
})
export class UserInfoModule {}
