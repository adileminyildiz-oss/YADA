import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTiersDto {
  @IsIn(['client', 'fournisseur', 'prospect']) type!: string;
  @IsString() @IsNotEmpty() nom!: string;
  @IsOptional() @IsString() fonction?: string;
  @IsOptional() @IsBoolean() principal?: boolean;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() telephone?: string;
}
