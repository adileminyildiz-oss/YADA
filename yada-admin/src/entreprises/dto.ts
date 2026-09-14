import { IsIn, IsOptional, IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateEntrepriseDto {
  @IsString() @IsNotEmpty()
  denomination!: string;

  @IsOptional() @IsString()
  formeJuridique?: string;

  @IsOptional() @IsString() @Length(9, 9)
  siren?: string;

  @IsOptional() @IsString() @Length(14, 14)
  siret?: string;

  @IsOptional() @IsString()
  codeApe?: string;

  @IsOptional() @IsString()
  ville?: string;

  @IsOptional() @IsIn(['prospect', 'actif', 'clos'])
  statut?: string;
}
