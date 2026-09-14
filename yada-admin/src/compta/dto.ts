import {
  IsArray, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, IsNumber,
  IsUUID, ValidateNested, ArrayNotEmpty, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExerciceDto {
  @IsDateString() dateDebut!: string;
  @IsDateString() dateFin!: string;
}

export class LigneEcrDto {
  @IsString() @IsNotEmpty() compte!: string;
  @IsOptional() @IsString() libelle?: string;
  @IsOptional() @IsNumber() @Min(0) debit?: number;
  @IsOptional() @IsNumber() @Min(0) credit?: number;
}

export class EcritureDto {
  @IsString() @IsNotEmpty() journal!: string;
  @IsDateString() date!: string;
  @IsOptional() @IsString() piece?: string;
  @IsString() @IsNotEmpty() libelle!: string;
  @IsArray() @ArrayNotEmpty() @ValidateNested({ each: true }) @Type(() => LigneEcrDto)
  lignes!: LigneEcrDto[];
}

export class LettrageDto {
  @IsString() @IsNotEmpty() compte!: string;
  @IsArray() @ArrayNotEmpty() @IsUUID('all', { each: true }) ligneIds!: string[];
}
