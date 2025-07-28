// modules/bids/bids.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { Bid } from 'src/modules/bids/entities/bid.entity';
import { Tender } from 'src/modules/tenders/entities/tender.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Organization } from 'src/modules/organizations/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Tender, User, Organization])],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}
