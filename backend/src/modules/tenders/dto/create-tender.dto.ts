import { IsString, IsEnum, IsNumber, IsOptional, IsDate, IsBoolean, IsArray, IsObject, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TenderType, TenderCategory } from '../entities/tender.entity';

export class CreateTenderDto {
  @IsString()
  referenceNumber: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TenderType)
  type: TenderType;

  @IsEnum(TenderCategory)
  category: TenderCategory;

  @IsNumber()
  @Min(0)
  estimatedValue: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  emdAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  emdPercentage?: number;

  @IsDate()
  @Type(() => Date)
  publishDate: Date;

  @IsDate()
  @Type(() => Date)
  bidStartDate: Date;

  @IsDate()
  @Type(() => Date)
  bidEndDate: Date;

  @IsDate()
  @Type(() => Date)
  openingDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  clarificationDeadline?: Date;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  deliveryPeriod?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eligibilityCriteria?: string[];

  @IsObject()
  @IsOptional()
  technicalRequirements?: Record<string, any>;

  @IsObject()
  @IsOptional()
  evaluationCriteria?: {
    technical: number;
    financial: number;
    other?: Record<string, number>;
  };

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredDocuments?: string[];

  @IsObject()
  @IsOptional()
  contactDetails?: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };

  @IsBoolean()
  @IsOptional()
  isMultipleWinnersAllowed?: boolean;

  @IsNumber()
  @IsOptional()
  maxWinners?: number;

  @IsBoolean()
  @IsOptional()
  isEmdRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  invitedVendors?: string[];

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}