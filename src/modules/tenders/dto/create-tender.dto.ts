// modules/tenders/dto/create-tender.dto.ts
import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsDate, 
  IsBoolean, 
  IsArray,
  IsObject,
  Min,
  Max,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenderType } from '../entities/tender.entity';

export class CreateTenderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TenderType)
  @IsNotEmpty()
  type: TenderType;

  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subCategory?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  estimatedValue: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  emdAmount: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  emdPercentage?: number;

  @IsDateString()
  @IsNotEmpty()
  bidOpeningDate: Date;

  @IsDateString()
  @IsNotEmpty()
  bidClosingDate: Date;

  @IsDateString()
  @IsOptional()
  preQualificationDate?: Date;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  deliveryPeriod?: string;

  @IsString()
  @IsOptional()
  warrantyPeriod?: string;

  @IsObject()
  @IsOptional()
  eligibilityCriteria?: any;

  @IsObject()
  @IsOptional()
  technicalRequirements?: any;

  @IsObject()
  @IsOptional()
  commercialTerms?: any;

  @IsBoolean()
  @IsOptional()
  isMultipleWinnersAllowed?: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxWinners?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
