import { PartialType } from '@nestjs/swagger';
import { CreateUserInfoDto } from './create-user-info.dto';

export class UpdateUserInfoDto extends PartialType(CreateUserInfoDto) {}
