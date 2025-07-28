import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Emd } from './entities/emd.entity';
import { EmdController } from './emd.controller';
import { EmdService } from './emd.service';

@Module({
  imports: [TypeOrmModule.forFeature([Emd])],
  controllers: [EmdController],
  providers: [EmdService],
  exports: [EmdService],
})
export class EmdModule {}