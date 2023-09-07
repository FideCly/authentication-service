import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginRequest, RegisterRequest, ValidateRequest } from './auth.pb';
import { IsNotEmpty } from 'class-validator';
import { IsEnum } from 'class-validator';
import { Role } from './auth.enum';

export class LoginRequestDto implements LoginRequest {
  @IsNotEmpty()
  @IsEmail()
  public readonly email: string;

  @IsNotEmpty()
  @IsString()
  public readonly password: string;
}

export class RegisterRequestDto implements RegisterRequest {
  @IsNotEmpty()
  @IsEmail()
  public readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  public readonly password: string;

  @IsNotEmpty()
  @IsEnum(Role)
  public readonly role: Role;
}

export class ValidateRequestDto implements ValidateRequest {
  @IsNotEmpty()
  @IsString()
  public readonly token: string;
}
