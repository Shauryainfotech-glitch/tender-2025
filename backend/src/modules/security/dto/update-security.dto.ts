import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SecurityStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export class UpdateSecurityDto {
  @ApiPropertyOptional({ enum: SecurityStatus, description: 'Security status' })
  @IsEnum(SecurityStatus)
  @IsOptional()
  status?: SecurityStatus;

  @ApiPropertyOptional({ description: 'Verification remarks' })
  @IsString()
  @IsOptional()
  verificationRemarks?: string;

  @ApiPropertyOptional({ description: 'Verified by user ID' })
  @IsString()
  @IsOptional()
  verifiedBy?: string;

  @ApiPropertyOptional({ description: 'Verification date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  verifiedAt?: Date;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Updated remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;
}