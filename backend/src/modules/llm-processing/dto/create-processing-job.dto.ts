import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsArray, ValidateNested, IsUUID, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ProcessingJobType {
  DOCUMENT_ANALYSIS = 'document_analysis',
  TENDER_EXTRACTION = 'tender_extraction',
  BID_EVALUATION = 'bid_evaluation',
  COMPLIANCE_CHECK = 'compliance_check',
  RISK_ASSESSMENT = 'risk_assessment',
  SUMMARY_GENERATION = 'summary_generation',
  COMPARISON = 'comparison',
  TRANSLATION = 'translation',
}

export enum ProcessingPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class ProcessingOptionsDto {
  @ApiPropertyOptional({ description: 'Extract structured data from documents' })
  @IsOptional()
  @IsBoolean()
  extractStructuredData?: boolean;

  @ApiPropertyOptional({ description: 'Generate summary of the content' })
  @IsOptional()
  @IsBoolean()
  generateSummary?: boolean;

  @ApiPropertyOptional({ description: 'Perform compliance checks' })
  @IsOptional()
  @IsBoolean()
  performComplianceCheck?: boolean;

  @ApiPropertyOptional({ description: 'Analyze risks and red flags' })
  @IsOptional()
  @IsBoolean()
  analyzeRisks?: boolean;

  @ApiPropertyOptional({ description: 'Language for translation', example: 'en' })
  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @ApiPropertyOptional({ description: 'Custom prompt for processing' })
  @IsOptional()
  @IsString()
  customPrompt?: string;

  @ApiPropertyOptional({ description: 'Maximum tokens for response', minimum: 100, maximum: 4000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(4000)
  maxTokens?: number;

  @ApiPropertyOptional({ description: 'Temperature for LLM creativity', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;
}

export class DocumentReferenceDto {
  @ApiProperty({ description: 'Document ID to process' })
  @IsUUID()
  @IsNotEmpty()
  documentId: string;

  @ApiPropertyOptional({ description: 'Specific pages to process', example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  pages?: number[];

  @ApiPropertyOptional({ description: 'Sections to focus on' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sections?: string[];
}

export class CreateProcessingJobDto {
  @ApiProperty({ 
    description: 'Type of processing job',
    enum: ProcessingJobType,
    example: ProcessingJobType.DOCUMENT_ANALYSIS
  })
  @IsEnum(ProcessingJobType)
  @IsNotEmpty()
  type: ProcessingJobType;

  @ApiProperty({ description: 'Name for the processing job' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the processing job' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Priority of the job',
    enum: ProcessingPriority,
    default: ProcessingPriority.NORMAL
  })
  @IsEnum(ProcessingPriority)
  @IsOptional()
  priority?: ProcessingPriority = ProcessingPriority.NORMAL;

  @ApiPropertyOptional({ description: 'Entity type this job relates to', example: 'tender' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID this job relates to' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'Documents to process', type: [DocumentReferenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentReferenceDto)
  documents: DocumentReferenceDto[];

  @ApiPropertyOptional({ description: 'Template ID to use for processing' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Knowledge base ID to use for context' })
  @IsOptional()
  @IsUUID()
  knowledgeBaseId?: string;

  @ApiProperty({ description: 'Processing options', type: ProcessingOptionsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ProcessingOptionsDto)
  options: ProcessingOptionsDto;

  @ApiPropertyOptional({ description: 'Metadata for the job' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Webhook URL for job completion notification' })
  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @ApiPropertyOptional({ description: 'Schedule job for later execution (ISO 8601 date)' })
  @IsOptional()
  @IsString()
  scheduledAt?: string;
}
