import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankGuarantee, GuaranteeStatus } from './entities/bank-guarantee.entity';
import { InsurancePolicy, InsurancePolicyStatus } from './entities/insurance-policy.entity';
import { SecurityDeposit, DepositStatus } from './entities/security-deposit.entity';
import { CreateBankGuaranteeDto } from './dto/create-bank-guarantee.dto';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { CreateSecurityDepositDto } from './dto/create-security-deposit.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(BankGuarantee)
    private bankGuaranteeRepository: Repository<BankGuarantee>,
    @InjectRepository(InsurancePolicy)
    private insurancePolicyRepository: Repository<InsurancePolicy>,
    @InjectRepository(SecurityDeposit)
    private securityDepositRepository: Repository<SecurityDeposit>,
  ) {}

  // Bank Guarantee methods
  async createBankGuarantee(
    createBankGuaranteeDto: CreateBankGuaranteeDto,
    file: Express.Multer.File,
    userId: string
  ) {
    const bankGuarantee = this.bankGuaranteeRepository.create({
      ...createBankGuaranteeDto,
      documentUrl: file?.path,
      createdById: userId,
    });
    return this.bankGuaranteeRepository.save(bankGuarantee);
  }

  async findAllBankGuarantees(query: any) {
    const qb = this.bankGuaranteeRepository.createQueryBuilder('bg');
    
    if (query.organizationId) {
      qb.andWhere('bg.organizationId = :organizationId', { organizationId: query.organizationId });
    }
    
    if (query.status) {
      qb.andWhere('bg.status = :status', { status: query.status });
    }
    
    if (query.tenderId) {
      qb.andWhere('bg.tenderId = :tenderId', { tenderId: query.tenderId });
    }
    
    return qb.getMany();
  }

  async findOneBankGuarantee(id: string, user: any) {
    const bankGuarantee = await this.bankGuaranteeRepository.findOne({
      where: { id },
      relations: ['organization', 'tender'],
    });
    
    if (!bankGuarantee) {
      throw new NotFoundException('Bank guarantee not found');
    }
    
    // Check access permissions
    if (user.role !== 'admin' && user.organization?.id !== bankGuarantee.organization.id) {
      throw new ForbiddenException('Access denied');
    }
    
    return bankGuarantee;
  }

  async verifyBankGuarantee(id: string, userId: string) {
    const bankGuarantee = await this.findOneBankGuarantee(id, { role: 'admin' });
    bankGuarantee.status = GuaranteeStatus.VERIFIED;
    bankGuarantee.verifiedBy = userId;
    bankGuarantee.verifiedAt = new Date();
    return this.bankGuaranteeRepository.save(bankGuarantee);
  }

  async releaseBankGuarantee(id: string, userId: string) {
    const bankGuarantee = await this.findOneBankGuarantee(id, { role: 'admin' });
    bankGuarantee.status = GuaranteeStatus.RELEASED;
    bankGuarantee.releasedBy = userId;
    bankGuarantee.releasedAt = new Date();
    return this.bankGuaranteeRepository.save(bankGuarantee);
  }

  // Insurance Policy methods
  async createInsurancePolicy(
    createInsurancePolicyDto: CreateInsurancePolicyDto,
    file: Express.Multer.File,
    userId: string
  ) {
    const insurancePolicy = this.insurancePolicyRepository.create({
      ...createInsurancePolicyDto,
      documentUrl: file?.path,
      createdBy: userId,
    } as any);
    return this.insurancePolicyRepository.save(insurancePolicy);
  }

  async findAllInsurancePolicies(query: any) {
    const qb = this.insurancePolicyRepository.createQueryBuilder('ip');
    
    if (query.organizationId) {
      qb.andWhere('ip.organizationId = :organizationId', { organizationId: query.organizationId });
    }
    
    if (query.status) {
      qb.andWhere('ip.status = :status', { status: query.status });
    }
    
    if (query.tenderId) {
      qb.andWhere('ip.tenderId = :tenderId', { tenderId: query.tenderId });
    }
    
    return qb.getMany();
  }

  async findOneInsurancePolicy(id: string, user: any) {
    const insurancePolicy = await this.insurancePolicyRepository.findOne({
      where: { id },
      relations: ['organization', 'tender'],
    });
    
    if (!insurancePolicy) {
      throw new NotFoundException('Insurance policy not found');
    }
    
    // Check access permissions
    if (user.role !== 'admin' && user.organization?.id !== insurancePolicy.organization.id) {
      throw new ForbiddenException('Access denied');
    }
    
    return insurancePolicy;
  }

  async verifyInsurancePolicy(id: string, userId: string) {
    const insurancePolicy = await this.findOneInsurancePolicy(id, { role: 'admin' });
    insurancePolicy.status = InsurancePolicyStatus.VERIFIED;
    insurancePolicy.verifiedBy = userId;
    insurancePolicy.verifiedAt = new Date();
    return this.insurancePolicyRepository.save(insurancePolicy);
  }

  // Security Deposit methods
  async createSecurityDeposit(
    createSecurityDepositDto: CreateSecurityDepositDto,
    userId: string
  ) {
    const securityDeposit = this.securityDepositRepository.create({
      ...createSecurityDepositDto,
      createdBy: userId,
    } as any);
    return this.securityDepositRepository.save(securityDeposit);
  }

  async findAllSecurityDeposits(query: any) {
    const qb = this.securityDepositRepository.createQueryBuilder('sd');
    
    if (query.organizationId) {
      qb.andWhere('sd.organizationId = :organizationId', { organizationId: query.organizationId });
    }
    
    if (query.status) {
      qb.andWhere('sd.status = :status', { status: query.status });
    }
    
    if (query.tenderId) {
      qb.andWhere('sd.tenderId = :tenderId', { tenderId: query.tenderId });
    }
    
    return qb.getMany();
  }

  async findOneSecurityDeposit(id: string, user: any) {
    const securityDeposit = await this.securityDepositRepository.findOne({
      where: { id },
      relations: ['organization', 'tender'],
    });
    
    if (!securityDeposit) {
      throw new NotFoundException('Security deposit not found');
    }
    
    // Check access permissions
    if (user.role !== 'admin' && user.organization?.id !== securityDeposit.organization.id) {
      throw new ForbiddenException('Access denied');
    }
    
    return securityDeposit;
  }

  async refundSecurityDeposit(id: string, userId: string) {
    const securityDeposit = await this.findOneSecurityDeposit(id, { role: 'admin' });
    securityDeposit.status = DepositStatus.REFUNDED;
    securityDeposit.refundedBy = userId;
    securityDeposit.refundedAt = new Date();
    return this.securityDepositRepository.save(securityDeposit);
  }

  // General methods
  async findByOrganization(organizationId: string) {
    const [bankGuarantees, insurancePolicies, securityDeposits] = await Promise.all([
      this.bankGuaranteeRepository.find({ where: { organizationId } }),
      this.insurancePolicyRepository.find({ where: { organizationId } }),
      this.securityDepositRepository.find({ where: { organizationId } }),
    ]);

    return {
      bankGuarantees,
      insurancePolicies,
      securityDeposits,
    };
  }

  async findByTender(tenderId: string) {
    const [bankGuarantees, insurancePolicies, securityDeposits] = await Promise.all([
      this.bankGuaranteeRepository.find({ where: { tenderId } }),
      this.insurancePolicyRepository.find({ where: { tenderId } }),
      this.securityDepositRepository.find({ where: { tenderId } }),
    ]);

    return {
      bankGuarantees,
      insurancePolicies,
      securityDeposits,
    };
  }

  async getStatistics(query: any) {
    const bgQuery = this.bankGuaranteeRepository.createQueryBuilder('bg');
    const ipQuery = this.insurancePolicyRepository.createQueryBuilder('ip');
    const sdQuery = this.securityDepositRepository.createQueryBuilder('sd');

    if (query.organizationId) {
      bgQuery.andWhere('bg.organizationId = :organizationId', { organizationId: query.organizationId });
      ipQuery.andWhere('ip.organizationId = :organizationId', { organizationId: query.organizationId });
      sdQuery.andWhere('sd.organizationId = :organizationId', { organizationId: query.organizationId });
    }

    const [
      totalBankGuarantees,
      totalInsurancePolicies,
      totalSecurityDeposits,
      activeBankGuarantees,
      activeInsurancePolicies,
      activeSecurityDeposits,
    ] = await Promise.all([
      bgQuery.getCount(),
      ipQuery.getCount(),
      sdQuery.getCount(),
      bgQuery.clone().andWhere('bg.status = :status', { status: GuaranteeStatus.ACTIVE }).getCount(),
      ipQuery.clone().andWhere('ip.status = :status', { status: InsurancePolicyStatus.ACTIVE }).getCount(),
      sdQuery.clone().andWhere('sd.status = :status', { status: DepositStatus.ACTIVE }).getCount(),
    ]);

    return {
      totalBankGuarantees,
      totalInsurancePolicies,
      totalSecurityDeposits,
      activeBankGuarantees,
      activeInsurancePolicies,
      activeSecurityDeposits,
      total: totalBankGuarantees + totalInsurancePolicies + totalSecurityDeposits,
      active: activeBankGuarantees + activeInsurancePolicies + activeSecurityDeposits,
    };
  }

  async getExpiring(days: number, user: any) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const bgQuery = this.bankGuaranteeRepository
      .createQueryBuilder('bg')
      .where('bg.expiryDate <= :expiryDate', { expiryDate })
      .andWhere('bg.status = :status', { status: GuaranteeStatus.ACTIVE });

    const ipQuery = this.insurancePolicyRepository
      .createQueryBuilder('ip')
      .where('ip.expiryDate <= :expiryDate', { expiryDate })
      .andWhere('ip.status = :status', { status: InsurancePolicyStatus.ACTIVE });

    if (user.role !== 'admin' && user.organization) {
      bgQuery.andWhere('bg.organizationId = :organizationId', { organizationId: user.organization.id });
      ipQuery.andWhere('ip.organizationId = :organizationId', { organizationId: user.organization.id });
    }

    const [bankGuarantees, insurancePolicies] = await Promise.all([
      bgQuery.getMany(),
      ipQuery.getMany(),
    ]);

    return {
      bankGuarantees,
      insurancePolicies,
    };
  }
}