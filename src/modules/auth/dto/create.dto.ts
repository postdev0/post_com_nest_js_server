import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  dob: string;
}

export class VerifyOtpDto {
  @IsString()
  otpToken: string;

  @IsString()
  otp: string;
}

export class LoginDto {
  @IsString()
  user: string;

  @IsString()
  password: string;
}

export class SSOLoginDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  picture: string;
}

export class NewAccessTokenDto {
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordVerifyEmailDto {
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @IsString()
  otpToken: string;

  @IsString()
  otp: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
