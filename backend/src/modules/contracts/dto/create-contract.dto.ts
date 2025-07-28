import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ContractType {
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  SERVICE_AGREEMENT = 'SERVICE_AGREEMENT',
  SUPPLY_CONTRACT = 'SUPPLY_CONTRACT',
  FRAMEWORK_AGREEMENT = 'FRAMEWORK_AGREEMENT',
  MAINTENANCE_CONTRACT = 'MAINTENANCE_CONTRACT',
  OTHER = 'OTHER',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  EXECUTED = 'EXECUTED',
  TERMINATED = 'TERMINATED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export class ContractTermDto {
  @ApiProperty({ description: 'Term title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Term description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Term category' })
  @IsString()
  @IsOptional()
  category?: string;
}

export class CreateContractDto {
  @ApiProperty({ description: 'Contract title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Contract number' })
  @IsString()
  contractNumber: string;

  @ApiProperty({ enum: ContractType, description: 'Type of contract' })
  @IsEnum(ContractType)
  type: ContractType;

  @ApiProperty({ description: 'Contract value' })
  @IsNumber()
  value: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @ApiProperty({ description: 'Start date' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'End date' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({ description: 'Tender ID' })
  @IsUUID()
  tenderId: string;

  @ApiProperty({ description: 'Vendor/Organization ID' })
  @IsUUID()
  vendorId: string;

  @ApiPropertyOptional({ description: 'Contract description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions', type: [ContractTermDto] })
  @IsArray()
  @IsOptional()
  terms?: ContractTermDto[];

  @ApiPropertyOptional({ description: 'Payment terms' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Delivery terms' })
  @IsString()
  @IsOptional()
  deliveryTerms?: string;

  @ApiPropertyOptional({ description: 'Penalty clauses' })
  @IsString()
  @IsOptional()
  penaltyClauses?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
