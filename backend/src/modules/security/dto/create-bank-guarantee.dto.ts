import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsDateString, IsBoolean, IsObject, Min, IsUUID, IsEmail, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GuaranteeType, GuaranteeStatus } from '../entities/bank-guarantee.entity';

class NotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Days before expiry to send alert' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  expiryAlert?: number;

  @ApiPropertyOptional({ description: 'Send alert when claimed' })
  @IsOptional()
  @IsBoolean()
  claimAlert?: boolean;

  @ApiPropertyOptional({ description: 'Send alert when released' })
  @IsOptional()
  @IsBoolean()
  releaseAlert?: boolean;

  @ApiPropertyOptional({ description: 'Email recipients for notifications' })
  @IsOptional()
  @IsString({ each: true })
  emailRecipients?: string[];
}

export class CreateBankGuaranteeDto {
  @ApiProperty({ 
    description: 'Type of bank guarantee',
    enum: GuaranteeType,
    example: GuaranteeType.EMD
  })
  @IsEnum(GuaranteeType)
  @IsNotEmpty()
  type: GuaranteeType;

  @ApiProperty({ description: 'Name of the issuing bank' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ description: 'Bank branch name' })
  @IsString()
  @IsNotEmpty()
  bankBranch: string;

  @ApiPropertyOptional({ description: 'Bank address' })
  @IsOptional()
  @IsString()
  bankAddress?: string;

  @ApiPropertyOptional({ description: 'Bank SWIFT code' })
  @IsOptional()
  @IsString()
  bankSwiftCode?: string;

  @ApiPropertyOptional({ description: 'Bank contact number' })
  @IsOptional()
  @IsString()
  bankContactNumber?: string;

  @ApiPropertyOptional({ description: 'Bank contact email' })
  @IsOptional()
  @IsEmail()
  bankContactEmail?: string;

  @ApiPropertyOptional({ description: 'Bank officer name' })
  @IsOptional()
  @IsString()
  bankOfficerName?: string;

  @ApiProperty({ description: 'Guarantee amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Currency code (3 letters)', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'Issue date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({ description: 'Expiry date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiPropertyOptional({ description: 'Claim period in days after expiry' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  claimPeriodDays?: number;

  @ApiProperty({ description: 'Beneficiary name' })
  @IsString()
  @IsNotEmpty()
  beneficiaryName: string;

  @ApiPropertyOptional({ description: 'Beneficiary address' })
  @IsOptional()
  @IsString()
  beneficiaryAddress?: string;

  @ApiPropertyOptional({ description: 'Purpose of the guarantee' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Bank reference number' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Tender ID' })
  @IsOptional()
  @IsUUID()
  tenderId?: string;

  @ApiPropertyOptional({ description: 'Bid ID' })
  @IsOptional()
  @IsUUID()
  bidId?: string;

  @ApiPropertyOptional({ description: 'Requires physical verification' })
  @IsOptional()
  @IsBoolean()
  requiresPhysicalVerification?: boolean;

  @ApiPropertyOptional({ description: 'Is electronic guarantee' })
  @IsOptional()
  @IsBoolean()
  isElectronic?: boolean;

  @ApiPropertyOptional({ description: 'Electronic verification code' })
  @IsOptional()
  @IsString()
  electronicVerificationCode?: string;

  @ApiPropertyOptional({ description: 'Is auto-renewable' })
  @IsOptional()
  @IsBoolean()
  isAutoRenewable?: boolean;

  @ApiPropertyOptional({ description: 'Renewal days before expiry' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  renewalDays?: number;

  @ApiPropertyOptional({ description: 'Parent guarantee ID for renewals' })
  @IsOptional()
  @IsUUID()
  parentGuaranteeId?: string;

  @ApiPropertyOptional({ description: 'Notification settings', type: NotificationSettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notificationSettings?: NotificationSettingsDto;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
