import { PartialType } from '@nestjs/swagger';
import { CreateResetPasswordDto } from './create-reset-password.dto';

export class UpdateResetPasswordDto extends PartialType(CreateResetPasswordDto) {}
