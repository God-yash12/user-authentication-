import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { User } from '../auth/entities/auth.entity';
import { MongoRepository } from 'typeorm/repository/MongoRepository';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserInfoService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) { }

  findAll() {
    return this.userRepository.find({
      select: ['id', 'username', 'email', 'isEmailVerified', 'role', 'createdAt'],
    });
  }

  // Fixed: Accept string instead of number for MongoDB ObjectId
  async findOne(id: string) {
    try {
      return await this.userRepository.findOne({
        select: ['id', 'username', 'email', 'isEmailVerified', 'role', 'createdAt'],
        where: { _id: new ObjectId(id) },
      });
    } catch (error) {
      // Handle invalid ObjectId format
      throw new Error('Invalid user ID format');
    }
  }
}