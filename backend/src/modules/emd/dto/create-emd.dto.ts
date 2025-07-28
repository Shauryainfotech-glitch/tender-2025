import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { EmdType } from '../entities/emd.entity';

export class CreateEmdDto {
  @IsUUID()
  @IsNotEmpty()
  tenderId: string;

  @IsEnum(EmdType)
  @IsNotEmpty()
  type: EmdType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  instrumentNumber?: string;

  @IsDateString()
  @IsOptional()
  instrumentDate?: string;

  @IsString()
  @IsOptional()
  bankBranch?: string;

  @IsString()
  @IsOptional()
  ifscCode?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}