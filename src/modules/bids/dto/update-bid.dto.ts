// modules/bids/dto/update-bid.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBidDto } from './create-bid.dto';

export class UpdateBidDto extends PartialType(
  OmitType(CreateBidDto, ['tenderId'] as const)
) {}
