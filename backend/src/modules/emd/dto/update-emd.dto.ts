import { PartialType } from '@nestjs/mapped-types';
import { CreateEmdDto } from './create-emd.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EmdStatus } from '../entities/emd.entity';

export class UpdateEmdDto extends PartialType(CreateEmdDto) {
  @IsEnum(EmdStatus)
  @IsOptional()
  status?: EmdStatus;
}