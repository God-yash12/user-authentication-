import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { Optional } from '@nestjs/common';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  identifier: string; // email or username

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password: string;

  @IsString()
  @IsOptional()
  recaptchaToken: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}