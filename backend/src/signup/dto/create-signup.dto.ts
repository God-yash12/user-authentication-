import { IsEmail, IsString, IsNotEmpty, MinLength, Matches, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { Optional } from '@nestjs/common';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Username can only contain lowercase letters, numbers, and underscores',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsString()
  @IsOptional()
  recaptchaToken: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  otpCode: string;
}