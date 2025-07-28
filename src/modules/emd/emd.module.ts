import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EMDController } from './emd.controller';
import { EMDService } from './emd.service';
import { EMD } from './entities/emd.entity';
import { EMDTransaction } from './entities/emd-transaction.entity';
import { TendersModule } from '../tenders/tenders.module';
import { BidsModule } from '../bids/bids.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EMD, EMDTransaction]),
    TendersModule,
    BidsModule,
  ],
  controllers: [EMDController],
  providers: [EMDService],
  exports: [EMDService],
})
export class EMDModule {}
