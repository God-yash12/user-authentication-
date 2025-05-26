import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak - must include upper, lower case, number/special char',
  })
  password: string;

  @IsOptional()
  @IsString()
  recaptchaToken: string;
}