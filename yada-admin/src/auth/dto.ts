import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @IsNotEmpty()
  organisation!: string;

  @IsEmail()
  email!: string;

  @IsString() @MinLength(8)
  motDePasse!: string;

  @IsString() @IsNotEmpty()
  nom!: string;

  @IsString() @IsNotEmpty()
  prenom!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString() @IsNotEmpty()
  motDePasse!: string;
}
