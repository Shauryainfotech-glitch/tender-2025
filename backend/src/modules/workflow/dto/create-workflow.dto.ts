import { IsString, IsArray, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WorkflowType {
  TENDER_APPROVAL = 'TENDER_APPROVAL',
  BID_EVALUATION = 'BID_EVALUATION',
  CONTRACT_APPROVAL = 'CONTRACT_APPROVAL',
  PAYMENT_APPROVAL = 'PAYMENT_APPROVAL',
  VENDOR_ONBOARDING = 'VENDOR_ONBOARDING',
  CUSTOM = 'CUSTOM',
}

export class WorkflowStageDto {
  @ApiProperty({ description: 'Stage name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Stage description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Approvers for this stage' })
  @IsArray()
  @IsOptional()
  approvers?: string[];

  @ApiPropertyOptional({ description: 'Duration in days' })
  @IsOptional()
  duration?: number;
}

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Workflow name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Workflow description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: WorkflowType, description: 'Type of workflow' })
  @IsEnum(WorkflowType)
  type: WorkflowType;

  @ApiPropertyOptional({ description: 'Entity ID this workflow is associated with' })
  @IsUUID()
  @IsOptional()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Entity type (tender, bid, contract, etc.)' })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiProperty({ description: 'Workflow stages', type: [WorkflowStageDto] })
  @IsArray()
  stages: WorkflowStageDto[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}