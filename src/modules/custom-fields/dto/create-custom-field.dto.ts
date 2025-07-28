import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsObject,
  ValidateNested,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TEXTAREA = 'textarea',
  FILE = 'file',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  RICHTEXT = 'richtext',
  COLOR = 'color',
  RATING = 'rating',
  SLIDER = 'slider',
  LOCATION = 'location',
  SIGNATURE = 'signature',
}

export enum FieldScope {
  TENDER = 'tender',
  BID = 'bid',
  ORGANIZATION = 'organization',
  USER = 'user',
  EMD = 'emd',
  DOCUMENT = 'document',
  CONTRACT = 'contract',
  VENDOR = 'vendor',
}

class ValidationRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedExtensions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxFileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customValidator?: string;
}

class SelectOptionDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

class ConditionalLogicDto {
  @ApiProperty()
  @IsString()
  field: string;

  @ApiProperty()
  @IsString()
  operator: string;

  @ApiProperty()
  value: any;

  @ApiProperty()
  @IsString()
  action: string;
}

class DisplaySettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  helpText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tooltip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  suffix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  columnWidth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cssClass?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hideLabel?: boolean;
}

export class CreateCustomFieldDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ enum: FieldType })
  @IsEnum(FieldType)
  fieldType: FieldType;

  @ApiProperty({ enum: FieldScope })
  @IsEnum(FieldScope)
  scope: FieldScope;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isUnique?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSearchable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSortable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isExportable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional({ type: [SelectOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectOptionDto)
  options?: SelectOptionDto[];

  @ApiPropertyOptional({ type: ValidationRuleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ValidationRuleDto)
  validation?: ValidationRuleDto;

  @ApiPropertyOptional({ type: [ConditionalLogicDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionalLogicDto)
  conditionalLogic?: ConditionalLogicDto[];

  @ApiPropertyOptional({ type: DisplaySettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DisplaySettingsDto)
  displaySettings?: DisplaySettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  organizationId?: number;
}
