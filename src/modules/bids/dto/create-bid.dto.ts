// modules/bids/dto/create-bid.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsPositive,
  IsOptional,
  ValidateNested,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TechnicalSpecDto {
  @ApiProperty({ description: 'Technical specification item name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Technical specification value' })
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class CreateBidDto {
  @ApiProperty({ description: 'ID of the tender to bid on' })
  @IsNotEmpty()
  @IsUUID()
  tenderId: string;

  @ApiProperty({ description: 'Bid amount', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;

  @ApiProperty({ description: 'Detailed proposal description' })
  @IsNotEmpty()
  @IsString()
  @MinLength(100)
  @MaxLength(5000)
  proposalDescription: string;

  @ApiPropertyOptional({ description: 'Validity period in days', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  validityPeriod?: number;

  @ApiPropertyOptional({ description: 'Delivery terms' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryTerms?: string;

  @ApiPropertyOptional({ description: 'Payment terms' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Technical specifications', type: [TechnicalSpecDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnicalSpecDto)
  technicalSpecs?: TechnicalSpecDto[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
