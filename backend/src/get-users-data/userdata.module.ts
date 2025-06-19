import { Module } from "@nestjs/common";
import { GetUserDataController } from "./user.controller";
import { GetUserData } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [GetUserDataController],
  providers: [GetUserData],
})
export class UserDataModule {}
