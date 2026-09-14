import { IsIn, IsOptional, IsString, IsNotEmpty, Length, IsUUID, IsDateString } from 'class-validator';

const ETAPES = ['nouveau', 'qualifie', 'proposition', 'gagne', 'perdu'];
const STATUTS = ['prospect', 'actif', 'clos'];

export class CreateEntrepriseDto {
  @IsString() @IsNotEmpty() denomination!: string;
  @IsOptional() @IsString() formeJuridique?: string;
  @IsOptional() @IsString() @Length(9, 9) siren?: string;
  @IsOptional() @IsString() @Length(14, 14) siret?: string;
  @IsOptional() @IsString() codeApe?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsIn(STATUTS) statut?: string;
  @IsOptional() @IsIn(ETAPES) etapeCrm?: string;
  @IsOptional() @IsString() origine?: string;
  @IsOptional() @IsUUID() collaborateurId?: string;
}

export class PatchEntrepriseDto {
  @IsOptional() @IsString() @IsNotEmpty() denomination?: string;
  @IsOptional() @IsString() formeJuridique?: string;
  @IsOptional() @IsString() @Length(9, 9) siren?: string;
  @IsOptional() @IsString() @Length(14, 14) siret?: string;
  @IsOptional() @IsString() codeApe?: string;
  @IsOptional() @IsString() tvaIntra?: string;
  @IsOptional() @IsString() rcsVille?: string;
  @IsOptional() capital?: number;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsString() codePostal?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsDateString() dateCreation?: string;
  @IsOptional() @IsString() origine?: string;
  @IsOptional() @IsString() noteCrm?: string;
  @IsOptional() @IsDateString() prochaineAction?: string;
  @IsOptional() @IsUUID() collaborateurId?: string;
}

export class EtapeDto {
  @IsIn(ETAPES) etape!: string;
  @IsOptional() @IsIn(['formalite', 'comptabilite', 'juridique', 'fiscal', 'social', 'conseil'])
  missionType?: string;
}
