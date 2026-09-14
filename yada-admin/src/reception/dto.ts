import { IsIn, IsNotEmpty, IsOptional, IsString, IsNumber, IsUUID, IsEmail, IsDateString } from 'class-validator';

export class DepositDto {
  @IsOptional() @IsIn(['achat', 'vente']) sens?: string;
  @IsString() @IsNotEmpty() nomFichier!: string;
  @IsString() @IsNotEmpty() cheminStockage!: string;
  @IsOptional() @IsIn(['manuel', 'email', 'client', 'plateforme']) canal?: string;
  @IsOptional() @IsString() mime?: string;
  @IsOptional() @IsString() hash?: string;
  @IsOptional() @IsString() texteOcr?: string; // couche texte / sortie OCR
  @IsOptional() @IsString() contenuBase64?: string; // octets réels du fichier (upload)
}

export class RapprocherDto {
  @IsUUID() tiersId!: string;
}

export class ComptabiliserDto {
  @IsOptional() @IsUUID() tiersId?: string;
  @IsOptional() @IsString() numero?: string;
  @IsOptional() @IsDateString() dateFacture?: string;
  @IsOptional() @IsNumber() ht?: number;
  @IsOptional() @IsNumber() tva?: number;
  @IsOptional() @IsNumber() ttc?: number;
}

export class ValiderFicheDto {
  @IsOptional() @IsString() raison?: string;
  @IsOptional() @IsString() siret?: string;
  @IsOptional() @IsString() tvaIntra?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() iban?: string;
  @IsOptional() @IsString() compteAuxiliaire?: string;
}
