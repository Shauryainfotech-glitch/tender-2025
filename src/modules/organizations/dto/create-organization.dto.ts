// modules/organizations/dto/create-organization.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
  MinLength,
  MaxLength,
  IsArray,
  IsPostalCode,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrganizationType {
  BUYER = 'buyer',
  SUPPLIER = 'supplier',
  BOTH = 'both',
}

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Organization name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Organization type', enum: OrganizationType })
  @IsNotEmpty()
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiProperty({ description: 'Registration number (unique)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  registrationNumber: string;

  @ApiProperty({ description: 'Tax ID number' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  taxId: string;

  @ApiProperty({ description: 'Organization email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Organization phone number' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiPropertyOptional({ description: 'Organization website' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'Organization description' })
  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(1000)
  description: string;

  @ApiProperty({ description: 'Street address' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  address: string;

  @ApiProperty({ description: 'City' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ description: 'Country' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @ApiPropertyOptional({ description: 'Industry sectors', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industrySectors?: string[];

  @ApiPropertyOptional({ description: 'Number of employees' })
  @IsOptional()
  @IsString()
  employeeCount?: string;

  @ApiPropertyOptional({ description: 'Annual revenue range' })
  @IsOptional()
  @IsString()
  annualRevenue?: string;

  @ApiPropertyOptional({ description: 'Certifications', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}
