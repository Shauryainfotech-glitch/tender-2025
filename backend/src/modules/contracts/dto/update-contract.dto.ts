import { PartialType } from '@nestjs/swagger';
import { CreateContractDto, ContractStatus } from './create-contract.dto';
import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateContractDto extends PartialType(CreateContractDto) {
  @ApiPropertyOptional({ enum: ContractStatus, description: 'Contract status' })
  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @ApiPropertyOptional({ description: 'Approval remarks' })
  @IsString()
  @IsOptional()
  approvalRemarks?: string;

  @ApiPropertyOptional({ description: 'Execution date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  executionDate?: Date;

  @ApiPropertyOptional({ description: 'Termination reason' })
  @IsString()
  @IsOptional()
  terminationReason?: string;

  @ApiPropertyOptional({ description: 'Amendment details' })
  @IsString()
  @IsOptional()
  amendmentDetails?: string;
}
