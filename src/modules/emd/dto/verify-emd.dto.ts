import { IsNotEmpty, IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyEMDDto {
  @ApiProperty({ description: 'Whether the EMD is valid' })
  @IsNotEmpty()
  @IsBoolean()
  isValid: boolean;

  @ApiPropertyOptional({ description: 'Verification remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
