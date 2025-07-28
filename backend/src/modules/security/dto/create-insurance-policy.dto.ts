import { IsString, IsNumber, IsDate, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum InsuranceType {
  LIABILITY = 'LIABILITY',
  PERFORMANCE = 'PERFORMANCE',
  PROPERTY = 'PROPERTY',
  PROFESSIONAL_INDEMNITY = 'PROFESSIONAL_INDEMNITY',
  WORKERS_COMPENSATION = 'WORKERS_COMPENSATION',
  OTHER = 'OTHER',
}

export class CreateInsurancePolicyDto {
  @ApiProperty({ description: 'Policy number' })
  @IsString()
  policyNumber: string;

  @ApiProperty({ description: 'Insurance company name' })
  @IsString()
  insurerName: string;

  @ApiProperty({ enum: InsuranceType, description: 'Type of insurance' })
  @IsEnum(InsuranceType)
  type: InsuranceType;

  @ApiProperty({ description: 'Coverage amount' })
  @IsNumber()
  coverageAmount: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @ApiProperty({ description: 'Policy start date' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Policy expiry date' })
  @Type(() => Date)
  @IsDate()
  expiryDate: Date;

  @ApiProperty({ description: 'Tender ID' })
  @IsUUID()
  tenderId: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Premium amount' })
  @IsNumber()
  @IsOptional()
  premiumAmount?: number;

  @ApiPropertyOptional({ description: 'Additional terms' })
  @IsString()
  @IsOptional()
  terms?: string;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;
}