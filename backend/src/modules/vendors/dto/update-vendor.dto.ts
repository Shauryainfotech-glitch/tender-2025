import { PartialType } from '@nestjs/swagger';
import { CreateVendorDto } from './create-vendor.dto';
import { VendorStatus } from '../entities/vendor.entity';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
  @ApiPropertyOptional({ enum: VendorStatus, description: 'Vendor status' })
  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;

  @ApiPropertyOptional({ description: 'Vendor rating' })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: 'Verification remarks' })
  @IsString()
  @IsOptional()
  verificationRemarks?: string;

  @ApiPropertyOptional({ description: 'Suspension reason' })
  @IsString()
  @IsOptional()
  suspensionReason?: string;

  @ApiPropertyOptional({ description: 'Blacklist reason' })
  @IsString()
  @IsOptional()
  blacklistReason?: string;
}
