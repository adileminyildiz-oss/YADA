import {
  IsArray, IsIn, IsNotEmpty, IsOptional, IsString, IsNumber, IsUUID,
  IsDateString, Min, ValidateNested, ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LigneDto {
  @IsString() @IsNotEmpty() designation!: string;
  @IsNumber() @Min(0) quantite!: number;
  @IsNumber() @Min(0) prixUnitaireHt!: number;
  @IsNumber() @Min(0) tauxTva!: number;
  @IsOptional() @IsNumber() @Min(0) remisePct?: number;
  @IsOptional() @IsIn(['bien', 'service', 'prestation']) nature?: string;
  @IsOptional() @IsString() compteProduit?: string;
}

export class CreateFactureDto {
  @IsOptional() @IsIn(['devis', 'facture', 'avoir', 'acompte']) type?: string;
  @IsOptional() @IsUUID() tiersId?: string;
  @IsOptional() @IsDateString() dateEmission?: string;
  @IsOptional() @IsDateString() dateEcheance?: string;
  @IsOptional() @IsIn(['normal', 'franchise', 'autoliquidation', 'intracom']) regimeTva?: string;
  @IsOptional() @IsString() devise?: string;
  @IsOptional() @IsString() conditions?: string;
  @IsOptional() @IsUUID() factureOrigineId?: string;
  @IsArray() @ArrayNotEmpty() @ValidateNested({ each: true }) @Type(() => LigneDto)
  lignes!: LigneDto[];
}

export class ReglementDto {
  @IsNumber() @Min(0.01) montant!: number;
  @IsOptional() @IsIn(['virement', 'cb', 'cheque', 'prelevement', 'especes']) moyen?: string;
  @IsOptional() @IsDateString() dateReglement?: string;
}
