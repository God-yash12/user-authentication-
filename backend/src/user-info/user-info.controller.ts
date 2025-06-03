import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';

@Controller('auth')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) { }

  @Get('user-info')
  findAll() {
    return this.userInfoService.findAll();
  }

  @Get('user-info/:id')
  findOne(@Param('id') id: string) {
    // Fixed: Pass string directly, no conversion needed
    return this.userInfoService.findOne(id);
  }
}