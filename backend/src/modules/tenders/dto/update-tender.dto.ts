import { PartialType } from '@nestjs/mapped-types';
import { CreateTenderDto } from './create-tender.dto';
import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TenderStatus } from '../entities/tender.entity';

export class UpdateTenderDto extends PartialType(CreateTenderDto) {
  @IsEnum(TenderStatus)
  @IsOptional()
  status?: TenderStatus;

  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  cancellationDate?: Date;

  @IsString()
  @IsOptional()
  awardedTo?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  awardedDate?: Date;
}