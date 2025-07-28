import { PartialType } from '@nestjs/mapped-types';
import { CreateBidDto } from './create-bid.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { BidStatus } from '../entities/bid.entity';

export class UpdateBidDto extends PartialType(CreateBidDto) {
  @IsEnum(BidStatus)
  @IsOptional()
  status?: BidStatus;
}