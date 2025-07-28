import { IsString, IsNumber, IsOptional, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from './create-payment.dto';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Payment ID to process' })
  @IsUUID()
  paymentId: string;

  @ApiProperty({ description: 'Payment gateway to use' })
  @IsString()
  gateway: string;

  @ApiPropertyOptional({ description: 'Card details for card payments' })
  @IsObject()
  @IsOptional()
  cardDetails?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    name: string;
  };

  @ApiPropertyOptional({ description: 'Bank details for bank transfers' })
  @IsObject()
  @IsOptional()
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    bankName?: string;
  };

  @ApiPropertyOptional({ description: 'UPI ID for UPI payments' })
  @IsString()
  @IsOptional()
  upiId?: string;

  @ApiPropertyOptional({ description: 'Return URL after payment' })
  @IsString()
  @IsOptional()
  returnUrl?: string;

  @ApiPropertyOptional({ description: 'Webhook URL for payment updates' })
  @IsString()
  @IsOptional()
  webhookUrl?: string;

  @ApiPropertyOptional({ description: 'Additional payment metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}