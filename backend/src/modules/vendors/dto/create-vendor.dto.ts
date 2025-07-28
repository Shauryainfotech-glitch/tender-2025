import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VendorCategory } from '../entities/vendor.entity';

export class CreateVendorDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'Vendor company name' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Registration number' })
  @IsString()
  registrationNumber: string;

  @ApiProperty({ enum: VendorCategory, description: 'Category of vendor' })
  @IsEnum(VendorCategory)
  category: VendorCategory;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact phone' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Company address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Tax ID/GST number' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Categories vendor operates in' })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({ description: 'Contact person name' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Bank account details' })
  @IsOptional()
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    accountHolderName: string;
  };

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
