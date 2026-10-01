import { IsNotEmpty, IsString, MinLength } from 'class-validator';


export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
