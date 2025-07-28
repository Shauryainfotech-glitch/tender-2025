import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomFieldDto } from './create-custom-field.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCustomFieldDto extends PartialType(CreateCustomFieldDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}