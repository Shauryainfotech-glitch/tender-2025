// modules/bids/dto/evaluate-bid.dto.ts
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvaluateBidDto {
  @ApiProperty({ description: 'Technical evaluation score', minimum: 0, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  technicalScore: number;

  @ApiProperty({ description: 'Financial evaluation score', minimum: 0, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  financialScore: number;

  @ApiProperty({ description: 'Overall evaluation score', minimum: 0, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore: number;

  @ApiPropertyOptional({ description: 'Evaluation notes and comments' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  evaluationNotes?: string;
}
