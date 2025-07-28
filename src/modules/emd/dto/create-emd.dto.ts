import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/emd.entity';

export class CreateEMDDto {
  @ApiProperty({ description: 'Tender ID for which EMD is being submitted' })
  @IsNotEmpty()
  @IsNumber()
  tenderId: number;

  @ApiPropertyOptional({ description: 'Bid ID if EMD is for a specific bid' })
  @IsOptional()
  @IsNumber()
  bidId?: number;

  @ApiProperty({ description: 'Organization ID submitting the EMD' })
  @IsNotEmpty()
  @IsNumber()
  organizationId: number;

  @ApiProperty({ description: 'EMD amount', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'INR' })
  @IsNotEmpty()
  @IsString()
  currency: string = 'INR';

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment instrument number (DD/BG/Cheque number)' })
  @IsNotEmpty()
  @IsString()
  instrumentNumber: string;

  @ApiProperty({ description: 'Instrument date' })
  @IsNotEmpty()
  @IsDateString()
  instrumentDate: Date;

  @ApiProperty({ description: 'Issuing bank name' })
  @IsNotEmpty()
  @IsString()
  issuingBank: string;

  @ApiPropertyOptional({ description: 'Issuing bank branch' })
  @IsOptional()
  @IsString()
  issuingBranch?: string;

  @ApiProperty({ description: 'EMD validity date' })
  @IsNotEmpty()
  @IsDateString()
  validityDate: Date;

  @ApiPropertyOptional({ description: 'Payment reference number' })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Additional remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
