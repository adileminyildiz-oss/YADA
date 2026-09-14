import { IsIn, IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class DeclarationDto {
  @IsIn(['tva', 'is', 'ir', 'cvae', 'cfe', 'liasse']) type!: string;
  @IsString() @IsNotEmpty() periode!: string;
  @IsOptional() @IsDateString() dateEcheance?: string;
  @IsOptional() @IsNumber() montant?: number;
}

export class StatutDeclarationDto {
  @IsIn(['planifiee', 'a_faire', 'deposee']) statut!: string;
}

export class ProposerDto {
  @IsString() @IsNotEmpty() libelle!: string;
  @IsOptional() @IsUUID() receptionId?: string;
}

export class StatutSuggestionDto {
  @IsIn(['en_attente', 'acceptee', 'corrigee', 'refusee']) statut!: string;
}
