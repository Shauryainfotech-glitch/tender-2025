import { IsString, IsNumber, IsDate, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DepositType {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DEMAND_DRAFT = 'DEMAND_DRAFT',
  FIXED_DEPOSIT = 'FIXED_DEPOSIT',
  OTHER = 'OTHER',
}

export class CreateSecurityDepositDto {
  @ApiProperty({ description: 'Deposit amount' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @ApiProperty({ enum: DepositType, description: 'Type of deposit' })
  @IsEnum(DepositType)
  type: DepositType;

  @ApiProperty({ description: 'Tender ID' })
  @IsUUID()
  tenderId: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Bank name' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Branch name' })
  @IsString()
  @IsOptional()
  branchName?: string;

  @ApiProperty({ description: 'Deposit date' })
  @Type(() => Date)
  @IsDate()
  depositDate: Date;

  @ApiPropertyOptional({ description: 'Maturity date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  maturityDate?: Date;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;
}