import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, LessThan, MoreThan } from 'typeorm';
import { Contract, ContractStatus, ContractType } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  // Add method overload for controller compatibility
  async create(createContractDto: CreateContractDto, filesOrUser: Express.Multer.File[] | any, userId?: string): Promise<Contract> {
    let user: any;
    let files: Express.Multer.File[] = [];
    
    if (Array.isArray(filesOrUser)) {
      files = filesOrUser;
      user = { id: userId };
    } else {
      user = filesOrUser;
    }

    const contract = await this.createContract(createContractDto, user);
    
    // Process uploaded files if any - store in metadata for now
    if (files && files.length > 0) {
      contract.metadata = contract.metadata || {};
      contract.metadata.documents = files.map(file => ({
        name: file.originalname,
        url: file.path,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      }));
      await this.contractRepository.save(contract);
    }
    
    return contract;
  }

  private async createContract(createContractDto: CreateContractDto, user: any): Promise<Contract> {
    const contractNumber = createContractDto.contractNumber || await this.generateContractNumber();
    
    // Create new contract instance
    const contract = new Contract();
    contract.contractNumber = contractNumber;
    contract.title = createContractDto.title;
    contract.description = createContractDto.description;
    contract.type = this.mapContractType(createContractDto.type);
    contract.contractValue = createContractDto.value;
    contract.currency = createContractDto.currency || 'INR';
    contract.startDate = createContractDto.startDate;
    contract.endDate = createContractDto.endDate;
    contract.tenderId = createContractDto.tenderId;
    contract.vendorId = createContractDto.vendorId;
    contract.buyerId = user.organizationId || user.id;
    contract.createdById = user.id;
    contract.status = ContractStatus.DRAFT;
    contract.paymentTermsDetails = createContractDto.paymentTerms;
    contract.termsAndConditions = createContractDto.terms ? JSON.stringify(createContractDto.terms) : null;
    contract.metadata = createContractDto.metadata;
    
    return await this.contractRepository.save(contract);
  }

  private mapContractType(dtoType: string): ContractType {
    const typeMap: Record<string, ContractType> = {
      'PURCHASE_ORDER': ContractType.SUPPLY,
      'SERVICE_AGREEMENT': ContractType.SERVICE,
      'SUPPLY_CONTRACT': ContractType.SUPPLY,
      'FRAMEWORK_AGREEMENT': ContractType.FRAMEWORK,
      'MAINTENANCE_CONTRACT': ContractType.MAINTENANCE,
      'OTHER': ContractType.OTHER,
    };
    return typeMap[dtoType] || ContractType.OTHER;
  }

  async findAll(filters: any, user?: any): Promise<{ data: Contract[]; total: number }> {
    const query = this.contractRepository.createQueryBuilder('contract')
      .leftJoinAndSelect('contract.vendor', 'vendor')
      .leftJoinAndSelect('contract.buyer', 'buyer')
      .leftJoinAndSelect('contract.tender', 'tender');

    // Apply filters
    if (filters.status) {
      query.andWhere('contract.status = :status', { status: filters.status });
    }

    if (filters.type) {
      query.andWhere('contract.type = :type', { type: filters.type });
    }

    if (filters.vendorId) {
      query.andWhere('contract.vendorId = :vendorId', { vendorId: filters.vendorId });
    }

    if (filters.buyerId) {
      query.andWhere('contract.buyerId = :buyerId', { buyerId: filters.buyerId });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('contract.startDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.search) {
      query.andWhere(
        '(contract.title LIKE :search OR contract.contractNumber LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Apply role-based filtering if user is provided
    if (user) {
      if (user.role === 'vendor') {
        query.andWhere('contract.vendorId = :vendorId', { vendorId: user.organizationId });
      } else if (user.role === 'buyer') {
        query.andWhere('contract.buyerId = :buyerId', { buyerId: user.organizationId });
      }
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string, user: any): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['vendor', 'buyer', 'tender', 'createdBy', 'contractManager'],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Check access permissions
    this.checkAccess(contract, user);

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto, userOrUserId: any | string): Promise<Contract> {
    const user = typeof userOrUserId === 'string' ? { id: userOrUserId, role: 'admin' } : userOrUserId;
    const contract = await this.findOne(id, user);

    // Map update DTO properties
    if (updateContractDto.status) {
      const mappedStatus = this.mapContractStatus(updateContractDto.status);
      this.validateStatusTransition(contract.status, mappedStatus);
      contract.status = mappedStatus;
    }

    if (updateContractDto.type) {
      contract.type = this.mapContractType(updateContractDto.type);
    }

    if (updateContractDto.value !== undefined) {
      contract.contractValue = updateContractDto.value;
    }

    // Update other simple fields
    const simpleFields = ['title', 'description', 'currency', 'startDate', 'endDate', 'vendorId'];
    simpleFields.forEach(field => {
      if (updateContractDto[field] !== undefined) {
        contract[field] = updateContractDto[field];
      }
    });

    if (updateContractDto.paymentTerms) {
      contract.paymentTermsDetails = updateContractDto.paymentTerms;
    }

    if (updateContractDto.terms) {
      contract.termsAndConditions = JSON.stringify(updateContractDto.terms);
    }

    if (updateContractDto.metadata) {
      contract.metadata = { ...contract.metadata, ...updateContractDto.metadata };
    }

    return await this.contractRepository.save(contract);
  }

  // Contract Lifecycle Management
  async submitForApproval(id: string, user: any): Promise<Contract> {
    const contract = await this.findOne(id, user);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only draft contracts can be submitted for approval');
    }

    contract.status = ContractStatus.PENDING_APPROVAL;
    return await this.contractRepository.save(contract);
  }

  async approve(id: string, userIdOrRemarks: string, userOrRemarks?: any | string): Promise<Contract> {
    let remarks: string;
    let user: any;
    
    if (userOrRemarks) {
      remarks = userIdOrRemarks;
      user = typeof userOrRemarks === 'string' ? { id: userOrRemarks, role: 'admin' } : userOrRemarks;
    } else {
      remarks = 'Approved';
      user = { id: userIdOrRemarks, role: 'admin' };
    }
    const contract = await this.findOne(id, user);

    if (contract.status !== ContractStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending contracts can be approved');
    }

    contract.status = ContractStatus.APPROVED;
    contract.approvedAt = new Date();
    contract.approvedBy = user.id;
    contract.approvalRemarks = remarks;

    return await this.contractRepository.save(contract);
  }

  async reject(id: string, reason: string, userOrUserId: any | string): Promise<Contract> {
    const user = typeof userOrUserId === 'string' ? { id: userOrUserId, role: 'admin' } : userOrUserId;
    const contract = await this.findOne(id, user);

    if (contract.status !== ContractStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending contracts can be rejected');
    }

    contract.status = ContractStatus.DRAFT;
    contract.approvalRemarks = `Rejected: ${reason}`;

    return await this.contractRepository.save(contract);
  }

  async activate(id: string, user: any): Promise<Contract> {
    const contract = await this.findOne(id, user);

    if (contract.status !== ContractStatus.APPROVED) {
      throw new BadRequestException('Only approved contracts can be activated');
    }

    if (!contract.signatures || contract.signatures.length < 2) {
      throw new BadRequestException('Contract must be signed by all parties before activation');
    }

    contract.status = ContractStatus.ACTIVE;
    contract.activatedAt = new Date();

    return await this.contractRepository.save(contract);
  }

  async suspend(id: string, reason: string, user: any): Promise<Contract> {
    const contract = await this.findOne(id, user);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only active contracts can be suspended');
    }

    contract.status = ContractStatus.SUSPENDED;
    contract.suspendedAt = new Date();
    contract.suspensionReason = reason;

    return await this.contractRepository.save(contract);
  }

  async resume(id: string, user: any): Promise<Contract> {
    const contract = await this.findOne(id, user);

    if (contract.status !== ContractStatus.SUSPENDED) {
      throw new BadRequestException('Only suspended contracts can be resumed');
    }

    contract.status = ContractStatus.ACTIVE;

    return await this.contractRepository.save(contract);
  }

  async terminate(id: string, reasonOrData: string | any, userOrUserId: any | string): Promise<Contract> {
    const user = typeof userOrUserId === 'string' ? { id: userOrUserId, role: 'admin' } : userOrUserId;
    const reason = typeof reasonOrData === 'string' ? reasonOrData : reasonOrData.reason;
    const contract = await this.findOne(id, user);

    if (!['ACTIVE', 'SUSPENDED'].includes(contract.status)) {
      throw new BadRequestException('Only active or suspended contracts can be terminated');
    }

    contract.status = ContractStatus.TERMINATED;
    contract.terminatedAt = new Date();
    contract.terminationReason = reason;

    return await this.contractRepository.save(contract);
  }

  async complete(id: string, user: any): Promise<Contract> {
    const contract = await this.findOne(id, user);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only active contracts can be marked as completed');
    }

    // Check if all milestones are completed
    if (contract.milestones && contract.milestones.length > 0) {
      const incompleteMilestones = contract.milestones.filter(m => m.status !== 'completed');
      if (incompleteMilestones.length > 0) {
        throw new BadRequestException('All milestones must be completed before marking contract as complete');
      }
    }

    contract.status = ContractStatus.COMPLETED;
    contract.completedAt = new Date();

    return await this.contractRepository.save(contract);
  }

  // Digital Signature Integration
  async addSignature(
    id: string,
    signature: {
      partyName: string;
      partyRole: string;
      signatureData: string;
      certificate?: string;
    },
    user: any,
  ): Promise<Contract> {
    const contract = await this.findOne(id, user);

    if (contract.status !== ContractStatus.APPROVED) {
      throw new BadRequestException('Only approved contracts can be signed');
    }

    const signatureHash = crypto
      .createHash('sha256')
      .update(signature.signatureData)
      .digest('hex');

    const newSignature = {
      partyName: signature.partyName,
      partyRole: signature.partyRole,
      signedBy: user.id,
      signedAt: new Date(),
      signatureHash,
      ipAddress: user.ipAddress,
      certificate: signature.certificate,
    };

    contract.signatures = contract.signatures || [];
    contract.signatures.push(newSignature);

    if (contract.signatures.length === 2) {
      contract.signedAt = new Date();
    }

    return await this.contractRepository.save(contract);
  }

  // Contract Templates
  async createFromTemplate(templateId: string, data: any, user: any): Promise<Contract> {
    // This would fetch template from a template service
    // For now, we'll create a basic contract
    const contractData = {
      ...data,
      templateId,
      createdById: user.id,
    };

    return this.create(contractData, user);
  }

  // Performance Tracking
  async updatePerformanceMetrics(
    id: string,
    metrics: {
      metric: string;
      target: number;
      actual: number;
      score: number;
    }[],
    user: any,
  ): Promise<Contract> {
    const contract = await this.findOne(id, user);

    contract.performanceMetrics = contract.performanceMetrics || [];
    
    metrics.forEach(metric => {
      contract.performanceMetrics.push({
        ...metric,
        evaluatedAt: new Date(),
      });
    });

    // Calculate overall performance score
    const totalScore = contract.performanceMetrics.reduce((sum, m) => sum + m.score, 0);
    contract.performanceScore = totalScore / contract.performanceMetrics.length;

    return await this.contractRepository.save(contract);
  }

  // Contract Amendments
  async createAmendment(
    id: string,
    amendment: {
      description: string;
      changes: any;
      documentUrl?: string;
    },
    user: any,
  ): Promise<Contract> {
    const contract = await this.findOne(id, user);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only active contracts can be amended');
    }

    const amendmentNumber = (contract.amendments?.length || 0) + 1;

    contract.amendments = contract.amendments || [];
    contract.amendments.push({
      number: amendmentNumber,
      date: new Date(),
      description: amendment.description,
      approvedBy: user.id,
      documentUrl: amendment.documentUrl,
    });

    // Apply changes
    Object.assign(contract, amendment.changes);

    return await this.contractRepository.save(contract);
  }

  // Analytics and Reporting
  async getContractStats(filters: any, user: any): Promise<any> {
    const query = this.contractRepository.createQueryBuilder('contract');

    // Apply role-based filtering
    if (user.role === 'vendor') {
      query.andWhere('contract.vendorId = :vendorId', { vendorId: user.organizationId });
    } else if (user.role === 'buyer') {
      query.andWhere('contract.buyerId = :buyerId', { buyerId: user.organizationId });
    }

    const totalContracts = await query.getCount();

    const statusCounts = await query
      .select('contract.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('contract.status')
      .getRawMany();

    const totalValue = await query
      .select('SUM(contract.contractValue)', 'total')
      .getRawOne();

    const expiringContracts = await this.contractRepository.count({
      where: {
        status: ContractStatus.ACTIVE,
        endDate: LessThan(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      },
    });

    return {
      totalContracts,
      statusCounts,
      totalValue: totalValue.total || 0,
      expiringContracts,
    };
  }

  // Helper Methods
  private async generateContractNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.contractRepository.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `CONT-${year}-${sequence}`;
  }

  private checkAccess(contract: Contract, user: any): void {
    if (user.role === 'admin') return;

    if (user.role === 'vendor' && contract.vendorId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === 'buyer' && contract.buyerId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }
  }

  async remove(id: string, user?: any): Promise<void> {
    const contract = await this.findOne(id, user || { role: 'admin' });

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only draft contracts can be deleted');
    }

    await this.contractRepository.remove(contract);
  }

  private mapContractStatus(dtoStatus: string): ContractStatus {
    const statusMap: Record<string, ContractStatus> = {
      'DRAFT': ContractStatus.DRAFT,
      'PENDING_APPROVAL': ContractStatus.PENDING_APPROVAL,
      'APPROVED': ContractStatus.APPROVED,
      'ACTIVE': ContractStatus.ACTIVE,
      'EXECUTED': ContractStatus.ACTIVE,
      'TERMINATED': ContractStatus.TERMINATED,
      'EXPIRED': ContractStatus.EXPIRED,
      'CANCELLED': ContractStatus.CANCELLED,
    };
    return statusMap[dtoStatus] || ContractStatus.DRAFT;
  }

  private validateStatusTransition(currentStatus: ContractStatus, newStatus?: ContractStatus): void {
    if (!newStatus || currentStatus === newStatus) return;

    const validTransitions: Record<ContractStatus, ContractStatus[]> = {
      [ContractStatus.DRAFT]: [ContractStatus.PENDING_APPROVAL, ContractStatus.CANCELLED],
      [ContractStatus.PENDING_APPROVAL]: [ContractStatus.APPROVED, ContractStatus.DRAFT, ContractStatus.CANCELLED],
      [ContractStatus.APPROVED]: [ContractStatus.ACTIVE, ContractStatus.CANCELLED],
      [ContractStatus.ACTIVE]: [ContractStatus.SUSPENDED, ContractStatus.TERMINATED, ContractStatus.COMPLETED],
      [ContractStatus.SUSPENDED]: [ContractStatus.ACTIVE, ContractStatus.TERMINATED],
      [ContractStatus.TERMINATED]: [],
      [ContractStatus.COMPLETED]: [],
      [ContractStatus.EXPIRED]: [],
      [ContractStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  // Scheduled Tasks (to be called by a cron job)
  async checkExpiringContracts(): Promise<void> {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const expiringContracts = await this.contractRepository.find({
      where: {
        status: ContractStatus.ACTIVE,
        endDate: LessThan(thirtyDaysFromNow),
      },
      relations: ['vendor', 'buyer', 'contractManager'],
    });

    for (const contract of expiringContracts) {
      // Send notifications
      this.logger.log(`Contract ${contract.contractNumber} is expiring soon`);
      
      // If renewable and within renewal notice period
      if (contract.requiresRenewalAction) {
        // Trigger renewal workflow
        this.logger.log(`Contract ${contract.contractNumber} requires renewal action`);
      }
    }
  }

  async markExpiredContracts(): Promise<void> {
    const today = new Date();
    
    await this.contractRepository.update(
      {
        status: ContractStatus.ACTIVE,
        endDate: LessThan(today),
      },
      {
        status: ContractStatus.EXPIRED,
      }
    );
  }

  // Additional methods for controller compatibility
  async getTemplates(): Promise<any> {
    return {
      templates: [
        {
          id: '1',
          name: 'Standard Purchase Agreement',
          description: 'Standard template for purchase agreements',
          category: 'purchase',
        },
        {
          id: '2',
          name: 'Service Level Agreement',
          description: 'Template for service agreements',
          category: 'service',
        },
        {
          id: '3',
          name: 'Supply Contract',
          description: 'Template for supply contracts',
          category: 'supply',
        },
      ],
    };
  }

  async getStatistics(filters: any): Promise<any> {
    return this.getContractStats(filters, { role: 'admin' });
  }

  async getExpiring(days: number, user: any): Promise<Contract[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const query = this.contractRepository.createQueryBuilder('contract')
      .where('contract.status = :status', { status: ContractStatus.ACTIVE })
      .andWhere('contract.endDate BETWEEN :today AND :futureDate', {
        today: new Date(),
        futureDate,
      });

    if (user.role === 'vendor') {
      query.andWhere('contract.vendorId = :vendorId', { vendorId: user.organizationId });
    } else if (user.role === 'buyer') {
      query.andWhere('contract.buyerId = :buyerId', { buyerId: user.organizationId });
    }

    return query.getMany();
  }

  async getHistory(id: string): Promise<any> {
    const contract = await this.contractRepository.findOne({ where: { id } });
    
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // In a real implementation, this would fetch from an audit log
    return {
      contractId: id,
      history: [
        {
          action: 'Created',
          date: contract.createdAt,
          user: 'System',
          details: 'Contract created',
        },
      ],
    };
  }

  async getDocuments(id: string, user: any): Promise<any> {
    const contract = await this.findOne(id, user);
    
    return {
      contractId: id,
      documents: contract.metadata?.documents || [],
    };
  }

  async sign(id: string, signData: any, user: any): Promise<Contract> {
    return this.addSignature(
      id,
      {
        partyName: signData.partyName || user.name,
        partyRole: signData.partyRole || user.role,
        signatureData: signData.signature,
        certificate: signData.certificate,
      },
      user,
    );
  }

  async execute(id: string, userId: string): Promise<Contract> {
    return this.activate(id, { id: userId, role: 'admin' });
  }

  async renew(id: string, renewData: any, userId: string): Promise<Contract> {
    const contract = await this.findOne(id, { id: userId, role: 'admin' });
    
    if (contract.status !== ContractStatus.ACTIVE && contract.status !== ContractStatus.EXPIRED) {
      throw new BadRequestException('Only active or expired contracts can be renewed');
    }

    // Create a new contract based on the existing one
    const newContract = await this.create(
      {
        ...renewData,
        title: `${contract.title} (Renewed)`,
        type: contract.type,
        vendorId: contract.vendorId,
        buyerId: contract.buyerId,
        parentContractId: contract.id,
      },
      { id: userId },
    );

    // Mark old contract as superseded in metadata
    contract.metadata = contract.metadata || {};
    contract.metadata.supersededBy = newContract.id;
    await this.contractRepository.save(contract);

    return newContract;
  }

  async amend(id: string, amendmentData: any, userId: string): Promise<Contract> {
    return this.createAmendment(
      id,
      {
        description: amendmentData.description,
        changes: amendmentData.changes,
        documentUrl: amendmentData.documentUrl,
      },
      { id: userId, role: 'admin' },
    );
  }

  async addDocuments(id: string, files: Express.Multer.File[], userId: string): Promise<Contract> {
    const contract = await this.findOne(id, { id: userId, role: 'admin' });
    
    contract.metadata = contract.metadata || {};
    contract.metadata.documents = contract.metadata.documents || [];
    
    files.forEach(file => {
      contract.metadata.documents.push({
        id: uuidv4(),
        name: file.originalname,
        url: file.path,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
        uploadedBy: userId,
      });
    });

    return await this.contractRepository.save(contract);
  }

  async removeDocument(id: string, documentId: string, userId: string): Promise<Contract> {
    const contract = await this.findOne(id, { id: userId, role: 'admin' });
    
    if (!contract.metadata?.documents) {
      throw new NotFoundException('Document not found');
    }

    contract.metadata.documents = contract.metadata.documents.filter(doc => doc.id !== documentId);
    
    return await this.contractRepository.save(contract);
  }
}
