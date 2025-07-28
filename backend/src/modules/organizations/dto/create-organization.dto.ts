import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { OrganizationType, OrganizationStatus } from '../entities/organization.entity';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsEnum(OrganizationType)
  @IsNotEmpty()
  type: OrganizationType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  pincode: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsString()
  @IsOptional()
  panNumber?: string;

  @IsObject()
  @IsOptional()
  contactPerson?: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  };

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sectors?: string[];

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsObject()
  @IsOptional()
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    ifscCode: string;
    swiftCode?: string;
  };

  @IsEnum(OrganizationStatus)
  @IsOptional()
  status?: OrganizationStatus;
}