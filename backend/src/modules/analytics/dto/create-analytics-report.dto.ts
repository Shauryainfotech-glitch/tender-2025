import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsDecimal, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '../entities/analytics-report.entity';

export class CreateAnalyticsReportDto {
  @ApiProperty({ description: 'Report title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Type of report',
    enum: ReportType,
    example: ReportType.DASHBOARD
  })
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @ApiProperty({ description: 'Report description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'SQL or other query for fetching data' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ description: 'Visualization options', type: Object })
  @IsObject()
  visualizationOptions: Record<string, any>;

  @ApiPropertyOptional({ description: 'Execution duration in seconds', minimum: 0 })
  @IsOptional()
  @IsDecimal()
  executionDurationSeconds?: number;

  @ApiPropertyOptional({ description: 'Is the report active?' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filters for the report', type: Object })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metadata key-value pairs', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
