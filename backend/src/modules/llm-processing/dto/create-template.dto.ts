import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsObject, ValidateNested, IsUUID, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TemplateType {
  TENDER_ANALYSIS = 'tender_analysis',
  BID_EVALUATION = 'bid_evaluation',
  COMPLIANCE_CHECK = 'compliance_check',
  DOCUMENT_SUMMARY = 'document_summary',
  RISK_ASSESSMENT = 'risk_assessment',
  COMPARISON_REPORT = 'comparison_report',
  EXTRACTION = 'extraction',
  CUSTOM = 'custom',
}

export enum TemplateCategory {
  ANALYSIS = 'analysis',
  EVALUATION = 'evaluation',
  COMPLIANCE = 'compliance',
  REPORTING = 'reporting',
  EXTRACTION = 'extraction',
  GENERATION = 'generation',
}

export enum OutputFormat {
  TEXT = 'text',
  JSON = 'json',
  MARKDOWN = 'markdown',
  HTML = 'html',
  PDF = 'pdf',
  STRUCTURED = 'structured',
}

export class PromptVariableDto {
  @ApiProperty({ description: 'Variable name to use in the template' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the variable' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Data type of the variable', example: 'string' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ description: 'Whether this variable is required' })
  @IsOptional()
  @IsBoolean()
  required?: boolean = true;

  @ApiPropertyOptional({ description: 'Default value for the variable' })
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional({ description: 'Example value for documentation' })
  @IsOptional()
  example?: any;

  @ApiPropertyOptional({ description: 'Validation pattern for the variable' })
  @IsOptional()
  @IsString()
  validationPattern?: string;
}

export class PromptSectionDto {
  @ApiProperty({ description: 'Section identifier' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Section title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Section prompt content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Order of the section' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Whether this section is conditional' })
  @IsOptional()
  @IsBoolean()
  conditional?: boolean = false;

  @ApiPropertyOptional({ description: 'Condition expression for conditional sections' })
  @IsOptional()
  @IsString()
  condition?: string;
}

export class OutputSchemaDto {
  @ApiProperty({ description: 'Field name in the output' })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({ description: 'Field data type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ description: 'Field description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this field is required' })
  @IsOptional()
  @IsBoolean()
  required?: boolean = true;

  @ApiPropertyOptional({ description: 'Nested schema for object fields' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutputSchemaDto)
  properties?: OutputSchemaDto[];
}

export class ModelConfigDto {
  @ApiPropertyOptional({ description: 'Specific model to use', default: 'gpt-4' })
  @IsOptional()
  @IsString()
  model?: string = 'gpt-4';

  @ApiPropertyOptional({ description: 'Temperature for response generation', minimum: 0, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number = 0.7;

  @ApiPropertyOptional({ description: 'Maximum tokens for response', minimum: 100, maximum: 8000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(8000)
  maxTokens?: number = 2000;

  @ApiPropertyOptional({ description: 'Top P parameter for nucleus sampling', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  topP?: number = 1;

  @ApiPropertyOptional({ description: 'Frequency penalty', minimum: -2, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  frequencyPenalty?: number = 0;

  @ApiPropertyOptional({ description: 'Presence penalty', minimum: -2, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  presencePenalty?: number = 0;
}

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Type of template',
    enum: TemplateType,
    example: TemplateType.TENDER_ANALYSIS
  })
  @IsEnum(TemplateType)
  @IsNotEmpty()
  type: TemplateType;

  @ApiProperty({ 
    description: 'Template category',
    enum: TemplateCategory,
    example: TemplateCategory.ANALYSIS
  })
  @IsEnum(TemplateCategory)
  @IsNotEmpty()
  category: TemplateCategory;

  @ApiProperty({ description: 'System prompt for the template' })
  @IsString()
  @IsNotEmpty()
  systemPrompt: string;

  @ApiProperty({ description: 'Main prompt sections', type: [PromptSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromptSectionDto)
  promptSections: PromptSectionDto[];

  @ApiPropertyOptional({ description: 'Variables used in the template', type: [PromptVariableDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromptVariableDto)
  variables?: PromptVariableDto[];

  @ApiProperty({ 
    description: 'Output format for the template',
    enum: OutputFormat,
    default: OutputFormat.JSON
  })
  @IsEnum(OutputFormat)
  @IsOptional()
  outputFormat?: OutputFormat = OutputFormat.JSON;

  @ApiPropertyOptional({ description: 'Output schema definition', type: [OutputSchemaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutputSchemaDto)
  outputSchema?: OutputSchemaDto[];

  @ApiProperty({ description: 'Model configuration', type: ModelConfigDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ModelConfigDto)
  modelConfig: ModelConfigDto;

  @ApiPropertyOptional({ description: 'Example input for testing' })
  @IsOptional()
  @IsObject()
  exampleInput?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Example output for reference' })
  @IsOptional()
  @IsObject()
  exampleOutput?: any;

  @ApiPropertyOptional({ description: 'Tags for template organization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Knowledge base IDs to use with this template' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  knowledgeBaseIds?: string[];

  @ApiPropertyOptional({ description: 'Post-processing instructions' })
  @IsOptional()
  @IsString()
  postProcessing?: string;

  @ApiPropertyOptional({ description: 'Validation rules for output' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  validationRules?: string[];

  @ApiPropertyOptional({ description: 'Enable template versioning' })
  @IsOptional()
  @IsBoolean()
  enableVersioning?: boolean = true;

  @ApiPropertyOptional({ description: 'Template visibility (public/private)' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @ApiPropertyOptional({ description: 'Custom metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
