import { Controller, Get } from '@nestjs/common';
import { GetUserData } from './user.service';
import { User } from 'src/users/entities/user.entity';

@Controller('users')
export class GetUserDataController {
    constructor(private readonly userService: GetUserData) { }

    @Get()
    async findAll(): Promise<Partial<User>[]> {
        return this.userService.findAll();
    }
}           