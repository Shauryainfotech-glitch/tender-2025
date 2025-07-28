import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsObject, ValidateNested, IsUUID, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum KnowledgeBaseType {
  TENDER_DOCUMENTS = 'tender_documents',
  COMPLIANCE_RULES = 'compliance_rules',
  EVALUATION_CRITERIA = 'evaluation_criteria',
  TECHNICAL_SPECIFICATIONS = 'technical_specifications',
  LEGAL_FRAMEWORK = 'legal_framework',
  BEST_PRACTICES = 'best_practices',
  HISTORICAL_DATA = 'historical_data',
  CUSTOM = 'custom',
}

export enum KnowledgeBaseScope {
  GLOBAL = 'global',
  ORGANIZATION = 'organization',
  DEPARTMENT = 'department',
  PROJECT = 'project',
  USER = 'user',
}

export class DocumentSourceDto {
  @ApiProperty({ description: 'Source document ID' })
  @IsUUID()
  @IsNotEmpty()
  documentId: string;

  @ApiPropertyOptional({ description: 'Document title for reference' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Specific sections to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sections?: string[];

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class VectorConfigDto {
  @ApiPropertyOptional({ description: 'Chunk size for text splitting', minimum: 100, maximum: 2000, default: 500 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(2000)
  chunkSize?: number = 500;

  @ApiPropertyOptional({ description: 'Chunk overlap for context preservation', minimum: 0, maximum: 200, default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  chunkOverlap?: number = 50;

  @ApiPropertyOptional({ description: 'Embedding model to use', default: 'text-embedding-ada-002' })
  @IsOptional()
  @IsString()
  embeddingModel?: string = 'text-embedding-ada-002';

  @ApiPropertyOptional({ description: 'Enable semantic chunking' })
  @IsOptional()
  @IsBoolean()
  semanticChunking?: boolean;

  @ApiPropertyOptional({ description: 'Maximum number of chunks to retrieve', minimum: 1, maximum: 20, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxRetrievedChunks?: number = 5;
}

export class AccessControlDto {
  @ApiPropertyOptional({ description: 'Roles that can access this knowledge base' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];

  @ApiPropertyOptional({ description: 'Specific user IDs with access' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  allowedUsers?: string[];

  @ApiPropertyOptional({ description: 'Organization IDs with access' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  allowedOrganizations?: string[];

  @ApiPropertyOptional({ description: 'Make this knowledge base public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}

export class CreateKnowledgeBaseDto {
  @ApiProperty({ description: 'Name of the knowledge base' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the knowledge base' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Type of knowledge base',
    enum: KnowledgeBaseType,
    example: KnowledgeBaseType.TENDER_DOCUMENTS
  })
  @IsEnum(KnowledgeBaseType)
  @IsNotEmpty()
  type: KnowledgeBaseType;

  @ApiProperty({ 
    description: 'Scope of the knowledge base',
    enum: KnowledgeBaseScope,
    default: KnowledgeBaseScope.ORGANIZATION
  })
  @IsEnum(KnowledgeBaseScope)
  @IsOptional()
  scope?: KnowledgeBaseScope = KnowledgeBaseScope.ORGANIZATION;

  @ApiPropertyOptional({ description: 'Organization ID for organization-scoped knowledge bases' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Department ID for department-scoped knowledge bases' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Project ID for project-scoped knowledge bases' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'Source documents for the knowledge base', type: [DocumentSourceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentSourceDto)
  documents: DocumentSourceDto[];

  @ApiPropertyOptional({ description: 'Categories for organizing content' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Tags for quick filtering' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Vector database configuration', type: VectorConfigDto })
  @IsObject()
  @ValidateNested()
  @Type(() => VectorConfigDto)
  vectorConfig: VectorConfigDto;

  @ApiProperty({ description: 'Access control settings', type: AccessControlDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AccessControlDto)
  accessControl: AccessControlDto;

  @ApiPropertyOptional({ description: 'Enable automatic updates from source documents' })
  @IsOptional()
  @IsBoolean()
  autoUpdate?: boolean = false;

  @ApiPropertyOptional({ description: 'Update frequency in hours (if autoUpdate is true)', minimum: 1, maximum: 168 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  updateFrequencyHours?: number;

  @ApiPropertyOptional({ description: 'Enable versioning for the knowledge base' })
  @IsOptional()
  @IsBoolean()
  enableVersioning?: boolean = true;

  @ApiPropertyOptional({ description: 'Custom metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
