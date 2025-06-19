import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";



export class GetUserData {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) { }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find({
      select: [
        'email',
        'username',
        'fullName',
        'createdAt',
        'loginAttempts',
        'isEmailVerified',
        'role',
      ],
    });

    return users;
  }

}