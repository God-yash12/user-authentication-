import { PartialType } from '@nestjs/mapped-types';
import { CreateCaptchaDto } from './create-captcha.dto';

export class UpdateCaptchaDto extends PartialType(CreateCaptchaDto) {}
