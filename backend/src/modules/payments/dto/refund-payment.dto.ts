import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RefundReason {
  TENDER_CANCELLED = 'TENDER_CANCELLED',
  BID_REJECTED = 'BID_REJECTED',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',
  TECHNICAL_ERROR = 'TECHNICAL_ERROR',
  USER_REQUEST = 'USER_REQUEST',
  OTHER = 'OTHER',
}

export class RefundPaymentDto {
  @ApiPropertyOptional({ description: 'Amount to refund (defaults to full amount)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiProperty({ enum: RefundReason, description: 'Reason for refund' })
  @IsEnum(RefundReason)
  reason: RefundReason;

  @ApiPropertyOptional({ description: 'Detailed description of refund reason' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Notify user about refund', default: true })
  @IsOptional()
  notifyUser?: boolean = true;

  @ApiPropertyOptional({ description: 'Additional refund metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}