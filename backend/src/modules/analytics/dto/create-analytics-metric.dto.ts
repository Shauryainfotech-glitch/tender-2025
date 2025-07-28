import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsUUID, IsDateString, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetricType, MetricCategory, AggregationPeriod } from '../entities/analytics-metric.entity';

export class CreateAnalyticsMetricDto {
  @ApiProperty({ description: 'Metric name' })
  @IsString()
  @IsNotEmpty()
  metricName: string;

  @ApiProperty({ 
    description: 'Type of metric',
    enum: MetricType,
    example: MetricType.COUNT
  })
  @IsEnum(MetricType)
  @IsNotEmpty()
  type: MetricType;

  @ApiProperty({ 
    description: 'Category of metric',
    enum: MetricCategory,
    example: MetricCategory.TENDER
  })
  @IsEnum(MetricCategory)
  @IsNotEmpty()
  category: MetricCategory;

  @ApiProperty({ description: 'Metric value', minimum: 0 })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Entity type this metric relates to' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID this metric relates to' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ 
    description: 'Aggregation period',
    enum: AggregationPeriod
  })
  @IsOptional()
  @IsEnum(AggregationPeriod)
  aggregationPeriod?: AggregationPeriod;

  @ApiProperty({ description: 'When the metric was recorded' })
  @IsDateString()
  @IsNotEmpty()
  recordedAt: string;

  @ApiPropertyOptional({ description: 'Period start date' })
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @ApiPropertyOptional({ description: 'Period end date' })
  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @ApiPropertyOptional({ description: 'Additional dimensions', type: Object })
  @IsOptional()
  @IsObject()
  dimensions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Metric description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
