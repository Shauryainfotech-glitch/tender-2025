import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentType {
  EMD = 'EMD',
  TENDER_FEE = 'TENDER_FEE',
  PROCESSING_FEE = 'PROCESSING_FEE',
  SECURITY_DEPOSIT = 'SECURITY_DEPOSIT',
  PERFORMANCE_GUARANTEE = 'PERFORMANCE_GUARANTEE',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  NET_BANKING = 'NET_BANKING',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DEMAND_DRAFT = 'DEMAND_DRAFT',
  CHEQUE = 'CHEQUE',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Amount to be paid' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @ApiProperty({ enum: PaymentType, description: 'Type of payment' })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'Tender ID if payment is tender-related' })
  @IsUUID()
  @IsOptional()
  tenderId?: string;

  @ApiPropertyOptional({ description: 'Bid ID if payment is bid-related' })
  @IsUUID()
  @IsOptional()
  bidId?: string;

  @ApiPropertyOptional({ description: 'EMD ID if payment is for EMD' })
  @IsUUID()
  @IsOptional()
  emdId?: string;

  @ApiPropertyOptional({ description: 'Description or purpose of payment' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Contract ID if payment is contract-related' })
  @IsUUID()
  @IsOptional()
  contractId?: string;

  @ApiPropertyOptional({ description: 'Process payment immediately' })
  @IsOptional()
  processImmediately?: boolean;
}