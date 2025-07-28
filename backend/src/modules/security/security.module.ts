import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityDeposit } from './entities/security-deposit.entity';
import { InsurancePolicy } from './entities/insurance-policy.entity';
import { BankGuarantee } from './entities/bank-guarantee.entity';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityDeposit, InsurancePolicy, BankGuarantee])],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}