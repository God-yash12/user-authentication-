// import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

// export class RegisterUserDto {
//   @IsNotEmpty()
//   @IsString()
//   @MinLength(3)
//   @MaxLength(20)
//   username: string;

//   @IsNotEmpty()
//   @IsString()
//   @MinLength(8)
//   @MaxLength(32)
//   @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
//     message: 'Password too weak - must include upper, lower case, number/special char',
//   })
//   password: string;

//   // @IsNotEmpty()
//   @IsOptional()
//   @IsString()
//   recaptchaToken: string;
// }


import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  recaptchaToken?: string;
}

export class VerifyOtpDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class ResendOtpDto {
  @IsEmail()
  @IsString()
  email: string;
}


