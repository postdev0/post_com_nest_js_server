import { IsString, IsStrongPassword } from 'class-validator';

export class PasswordDto {
  @IsString()
  @IsStrongPassword()
  password: string;
}

export class UsernameDto {
  @IsString()
  username: string;
}

export class ChangePasswordDto {
  @IsString()
  password: string;

  @IsString()
  @IsStrongPassword()
  newPassword: string;
}
