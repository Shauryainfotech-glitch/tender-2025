import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  IsObject,
  IsNumber,
  Min,
} from 'class-validator';
import { CustomFieldType, CustomFieldEntity } from '../entities/custom-field.entity';

export class CreateCustomFieldDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CustomFieldType)
  @IsNotEmpty()
  type: CustomFieldType;

  @IsEnum(CustomFieldEntity)
  @IsNotEmpty()
  entityType: CustomFieldEntity;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsObject()
  @IsOptional()
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsString()
  @IsOptional()
  helpText?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsObject()
  @IsOptional()
  conditionalLogic?: {
    show?: boolean;
    when?: string;
    operator?: string;
    value?: any;
  };
}