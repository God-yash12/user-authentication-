import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm'; // Use MongoRepository for MongoDB
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>, // MongoRepository instead of Repository
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Check if email or username already exists
    const existingUser = await this.userRepository.findOne({
      where: {
        $or: [
          { email: userData.email?.toLowerCase() },
          { username: userData.username?.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === userData.email?.toLowerCase()) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === userData.username?.toLowerCase()) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password!, saltRounds);

    const user = this.userRepository.create({
      ...userData,
      email: userData.email?.toLowerCase(),
      username: userData.username?.toLowerCase(),
      password: hashedPassword,
      role: userData.role ?? UserRole.USER,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email: email.toLowerCase() } 
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { username: username.toLowerCase() } 
    });
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        $or: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() }
        ]
      }
    });
  }

  // Method 1: Using ObjectId directly
  async findById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) return null;
    return this.userRepository.findOne({ 
      where: { _id: new ObjectId(id) } 
    });
  }

  // Method 2: Using MongoRepository's findOneById (recommended)
  async findByIdSimple(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) return null;
    return this.userRepository.findOneById(new ObjectId(id));
  }

  async updateOTP(userId: string, otpCode: string, otpExpiresAt: Date): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    
    // Method 1: Using updateOne (MongoDB native method)
    await this.userRepository.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          otpCode,
          otpExpiresAt,
        }
      }
    );
  }

  async verifyOTP(userId: string, otpCode: string): Promise<boolean> {
    if (!ObjectId.isValid(userId)) {
      return false;
    }

    const user = await this.userRepository.findOne({ 
      where: { _id: new ObjectId(userId) } 
    });
    
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return false;
    }

    if (user.otpExpiresAt < new Date()) {
      return false;
    }

    if (user.otpCode === otpCode) {
      await this.userRepository.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            isEmailVerified: true,
            otpCode: null,
            otpExpiresAt: null,
          }
        }
      );
      return true;
    }

    return false;
  }

  async incrementLoginAttempts(userId: string): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      return;
    }

    const user = await this.userRepository.findOne({ 
      where: { _id: new ObjectId(userId) } 
    });
    if (!user) return;

    const updates: any = { loginAttempts: user.loginAttempts + 1 };

    // Lock account after 5 failed attempts for 15 minutes
    if (user.loginAttempts + 1 >= 5) {
      updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await this.userRepository.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    );
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      return;
    }

    await this.userRepository.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          loginAttempts: 0,
          lockUntil: null,
        }
      }
    );
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          refreshToken: hashedRefreshToken,
        }
      }
    );
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    if (!ObjectId.isValid(userId)) {
      return false;
    }

    const user = await this.userRepository.findOne({ 
      where: { _id: new ObjectId(userId) } 
    });
    
    if (!user || !user.refreshToken) {
      return false;
    }
    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  // Additional MongoDB-specific methods

  // Using MongoDB aggregation
  async findUsersWithAggregation(): Promise<User[]> {
    return this.userRepository.aggregate([
      { $match: { isEmailVerified: true } },
      { $sort: { createdAt: -1 } }
    ]).toArray();
  }

  // Using MongoDB's findAndModify
  async findAndUpdateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    if (!ObjectId.isValid(userId)) return null;
    
    const result = await this.userRepository.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    return result ? result.value : null;
  }

  // Bulk operations
  async bulkUpdateUsers(userIds: string[], updates: Partial<User>): Promise<void> {
    const objectIds = userIds
      .filter(id => ObjectId.isValid(id))
      .map(id => new ObjectId(id));
    
    await this.userRepository.updateMany(
      { _id: { $in: objectIds } },
      { $set: updates }
    );
  }
}