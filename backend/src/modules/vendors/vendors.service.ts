import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, IsNull } from 'typeorm';
import { Vendor, VendorStatus, VerificationStatus, VendorCategory } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Organization } from '../organizations/entities/organization.entity';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  // Add alias for controller compatibility
  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Create a default user context
    return this.register(createVendorDto, { id: 'system' });
  }

  // Vendor Registration
  async register(createVendorDto: CreateVendorDto, user: any): Promise<Vendor> {
    // Check if organization already has a vendor profile
    const existingVendor = await this.vendorRepository.findOne({
      where: { organizationId: createVendorDto.organizationId },
    });

    if (existingVendor) {
      throw new ConflictException('Organization already registered as vendor');
    }

    // Verify organization exists
    const organization = await this.organizationRepository.findOne({
      where: { id: createVendorDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const vendor = this.vendorRepository.create({
      ...createVendorDto,
      createdById: user.id,
      status: VendorStatus.PENDING_VERIFICATION,
      verificationStatus: VerificationStatus.NOT_STARTED,
    });

    const savedVendor = await this.vendorRepository.save(vendor);

    // Trigger verification workflow
    this.initiateVerification(savedVendor.id);

    return savedVendor;
  }

  // Find all vendors with filters
  async findAll(filters: any): Promise<{ data: Vendor[]; total: number }> {
    const query = this.vendorRepository.createQueryBuilder('vendor')
      .leftJoinAndSelect('vendor.organization', 'organization');

    // Apply filters
    if (filters.status) {
      query.andWhere('vendor.status = :status', { status: filters.status });
    }

    if (filters.category) {
      query.andWhere('vendor.category = :category', { category: filters.category });
    }

    if (filters.verificationStatus) {
      query.andWhere('vendor.verificationStatus = :verificationStatus', {
        verificationStatus: filters.verificationStatus,
      });
    }

    if (filters.search) {
      query.andWhere(
        '(vendor.legalName LIKE :search OR vendor.tradeName LIKE :search OR vendor.registrationNumber LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.productCategories && filters.productCategories.length > 0) {
      query.andWhere('vendor.productCategories && :productCategories', {
        productCategories: filters.productCategories,
      });
    }

    if (filters.serviceCategories && filters.serviceCategories.length > 0) {
      query.andWhere('vendor.serviceCategories && :serviceCategories', {
        serviceCategories: filters.serviceCategories,
      });
    }

    if (filters.minRating) {
      query.andWhere('vendor.overallRating >= :minRating', {
        minRating: filters.minRating,
      });
    }

    // Exclude blacklisted by default unless specifically requested
    if (!filters.includeBlacklisted) {
      query.andWhere('vendor.status != :blacklisted', {
        blacklisted: VendorStatus.BLACKLISTED,
      });
    }

    // Sorting
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder || 'ASC';
      query.orderBy(`vendor.${filters.sortBy}`, sortOrder);
    } else {
      query.orderBy('vendor.createdAt', 'DESC');
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: ['organization', 'createdBy', 'accountManager'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto, user?: any): Promise<Vendor> {
    const vendor = await this.findOne(id);

    // Validate status transitions
    if (updateVendorDto.status) {
      this.validateStatusTransition(vendor.status, updateVendorDto.status);
    }

    Object.assign(vendor, updateVendorDto);
    vendor.lastActivityAt = new Date();

    return await this.vendorRepository.save(vendor);
  }

  // Verification Process
  async initiateVerification(vendorId: string): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);

    if (vendor.verificationStatus !== VerificationStatus.NOT_STARTED) {
      throw new BadRequestException('Verification already initiated');
    }

    vendor.verificationStatus = VerificationStatus.IN_PROGRESS;

    // Check required documents
    const requiredDocuments = this.getRequiredDocuments(vendor.category);
    const missingDocuments = this.checkMissingDocuments(vendor.documents || [], requiredDocuments);

    if (missingDocuments.length > 0) {
      vendor.verificationStatus = VerificationStatus.PENDING_DOCUMENTS;
      vendor.verificationRemarks = `Missing documents: ${missingDocuments.join(', ')}`;
    }

    return await this.vendorRepository.save(vendor);
  }

  async submitDocuments(
    vendorId: string,
    documents: Array<{
      type: string;
      name: string;
      url: string;
    }>,
  ): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);

    vendor.documents = vendor.documents || [];
    
    documents.forEach(doc => {
      vendor.documents.push({
        ...doc,
        uploadedAt: new Date(),
        status: 'pending_verification',
      });
    });

    // Check if all required documents are now present
    const requiredDocuments = this.getRequiredDocuments(vendor.category);
    const missingDocuments = this.checkMissingDocuments(vendor.documents, requiredDocuments);

    if (missingDocuments.length === 0 && vendor.verificationStatus === VerificationStatus.PENDING_DOCUMENTS) {
      vendor.verificationStatus = VerificationStatus.UNDER_REVIEW;
    }

    return await this.vendorRepository.save(vendor);
  }

  async verifyVendor(
    vendorId: string,
    decision: 'approve' | 'reject',
    remarks: string,
    user: any,
  ): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);

    if (vendor.verificationStatus === VerificationStatus.APPROVED) {
      throw new BadRequestException('Vendor already verified');
    }

    if (decision === 'approve') {
      vendor.verificationStatus = VerificationStatus.APPROVED;
      vendor.status = VendorStatus.VERIFIED;
      vendor.verifiedAt = new Date();
      vendor.verifiedBy = user.id;
    } else {
      vendor.verificationStatus = VerificationStatus.REJECTED;
      vendor.status = VendorStatus.PENDING_VERIFICATION;
    }

    vendor.verificationRemarks = remarks;

    return await this.vendorRepository.save(vendor);
  }

  // Blacklist Management
  async blacklistVendor(
    vendorId: string,
    reason: string,
    duration: number, // in days
    user: any,
  ): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);

    if (vendor.status === VendorStatus.BLACKLISTED) {
      throw new BadRequestException('Vendor already blacklisted');
    }

    vendor.status = VendorStatus.BLACKLISTED;
    vendor.blacklistDate = new Date();
    vendor.blacklistReason = reason;
    
    if (duration > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + duration);
      vendor.blacklistExpiryDate = expiryDate;
    }

    vendor.blacklistHistory = vendor.blacklistHistory || [];
    vendor.blacklistHistory.push({
      date: new Date(),
      reason,
      duration,
    });

    return await this.vendorRepository.save(vendor);
  }

  async removeFromBlacklist(vendorId: string, userId: string, remarks?: string): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);

    if (vendor.status !== VendorStatus.BLACKLISTED) {
      throw new BadRequestException('Vendor not blacklisted');
    }

    vendor.status = VendorStatus.VERIFIED;
    vendor.blacklistExpiryDate = null;
    
    // Update blacklist history
    if (vendor.blacklistHistory && vendor.blacklistHistory.length > 0) {
      vendor.blacklistHistory[vendor.blacklistHistory.length - 1].removedDate = new Date();
    }

    vendor.verificationRemarks = remarks || 'Removed from blacklist';

    return await this.vendorRepository.save(vendor);
  }

  // Performance Tracking
  async updatePerformanceMetrics(
    vendorId: string,
    metrics: {
      onTimeDeliveryRate?: number;
      qualityScore?: number;
      complianceScore?: number;
    },
  ): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);

    if (metrics.onTimeDeliveryRate !== undefined) {
      vendor.onTimeDeliveryRate = metrics.onTimeDeliveryRate;
    }

    if (metrics.qualityScore !== undefined) {
      vendor.qualityScore = metrics.qualityScore;
    }

    if (metrics.complianceScore !== undefined) {
      vendor.complianceScore = metrics.complianceScore;
    }

    // Recalculate overall rating
    vendor.overallRating = vendor.performanceRating;

    return await this.vendorRepository.save(vendor);
  }

  async addRating(
    vendorId: string,
    rating: {
      score: number;
      category: string;
      comments?: string;
      contractId?: string;
    },
    user: any,
  ): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);

    // This would typically involve a separate ratings table
    // For now, we'll update the overall rating with a weighted average
    const currentTotalRatings = vendor.totalContractsCompleted || 1;
    const newOverallRating = 
      (vendor.overallRating * currentTotalRatings + rating.score) / (currentTotalRatings + 1);

    vendor.overallRating = Math.round(newOverallRating * 100) / 100;

    return await this.vendorRepository.save(vendor);
  }

  async recordContractCompletion(
    vendorId: string,
    contractDetails: {
      contractId: string;
      onTime: boolean;
      qualityMet: boolean;
      complianceMet: boolean;
    },
  ): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);

    vendor.totalContractsCompleted += 1;
    vendor.totalContractsInProgress = Math.max(0, vendor.totalContractsInProgress - 1);

    // Update on-time delivery rate
    const totalDeliveries = vendor.totalContractsCompleted;
    const currentOnTimeCount = Math.round((vendor.onTimeDeliveryRate / 100) * (totalDeliveries - 1));
    const newOnTimeCount = currentOnTimeCount + (contractDetails.onTime ? 1 : 0);
    vendor.onTimeDeliveryRate = (newOnTimeCount / totalDeliveries) * 100;

    return await this.vendorRepository.save(vendor);
  }

  // Analytics
  async getVendorStats(): Promise<any> {
    const totalVendors = await this.vendorRepository.count();
    
    const statusCounts = await this.vendorRepository
      .createQueryBuilder('vendor')
      .select('vendor.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('vendor.status')
      .getRawMany();

    const categoryCounts = await this.vendorRepository
      .createQueryBuilder('vendor')
      .select('vendor.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('vendor.category')
      .getRawMany();

    const topPerformers = await this.vendorRepository.find({
      where: { status: VendorStatus.VERIFIED },
      order: { overallRating: 'DESC' },
      take: 10,
      relations: ['organization'],
    });

    const blacklistedCount = await this.vendorRepository.count({
      where: { status: VendorStatus.BLACKLISTED },
    });

    const pendingVerification = await this.vendorRepository.count({
      where: { verificationStatus: Not(VerificationStatus.APPROVED) },
    });

    return {
      totalVendors,
      statusCounts,
      categoryCounts,
      topPerformers,
      blacklistedCount,
      pendingVerification,
    };
  }

  // Helper methods
  private getRequiredDocuments(category: VendorCategory): string[] {
    const baseDocuments = [
      'business_registration',
      'tax_certificate',
      'bank_details',
      'address_proof',
    ];

    const categorySpecificDocuments: Record<VendorCategory, string[]> = {
      [VendorCategory.MANUFACTURER]: ['manufacturing_license', 'quality_certification'],
      [VendorCategory.DISTRIBUTOR]: ['distribution_license', 'warehouse_certificate'],
      [VendorCategory.SERVICE_PROVIDER]: ['service_license', 'professional_certification'],
      [VendorCategory.CONTRACTOR]: ['contractor_license', 'insurance_certificate'],
      [VendorCategory.CONSULTANT]: ['professional_certification', 'experience_certificate'],
      [VendorCategory.SUPPLIER]: ['supply_license', 'product_certification'],
      [VendorCategory.OTHER]: [],
    };

    return [...baseDocuments, ...(categorySpecificDocuments[category] || [])];
  }

  private checkMissingDocuments(uploadedDocs: any[], requiredDocs: string[]): string[] {
    const uploadedTypes = uploadedDocs.map(doc => doc.type);
    return requiredDocs.filter(req => !uploadedTypes.includes(req));
  }

  private validateStatusTransition(currentStatus: VendorStatus, newStatus: VendorStatus): void {
    const validTransitions: Record<VendorStatus, VendorStatus[]> = {
      [VendorStatus.PENDING_VERIFICATION]: [VendorStatus.VERIFIED, VendorStatus.INACTIVE],
      [VendorStatus.VERIFIED]: [VendorStatus.SUSPENDED, VendorStatus.BLACKLISTED, VendorStatus.INACTIVE],
      [VendorStatus.SUSPENDED]: [VendorStatus.VERIFIED, VendorStatus.BLACKLISTED, VendorStatus.INACTIVE],
      [VendorStatus.BLACKLISTED]: [VendorStatus.VERIFIED, VendorStatus.INACTIVE],
      [VendorStatus.INACTIVE]: [VendorStatus.PENDING_VERIFICATION],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  // Scheduled tasks
  async checkBlacklistExpiry(): Promise<void> {
    const expiredBlacklists = await this.vendorRepository.find({
      where: {
        status: VendorStatus.BLACKLISTED,
        blacklistExpiryDate: Not(IsNull()),
      },
    });

    const today = new Date();

    for (const vendor of expiredBlacklists) {
      if (vendor.blacklistExpiryDate && vendor.blacklistExpiryDate <= today) {
        vendor.status = VendorStatus.VERIFIED;
        vendor.blacklistExpiryDate = null;
        
        if (vendor.blacklistHistory && vendor.blacklistHistory.length > 0) {
          vendor.blacklistHistory[vendor.blacklistHistory.length - 1].removedDate = today;
        }

        await this.vendorRepository.save(vendor);
        this.logger.log(`Vendor ${vendor.registrationNumber} removed from blacklist (expired)`);
      }
    }
  }

  // Additional methods for controller compatibility
  async search(searchTerm: string, filters: any): Promise<{ data: Vendor[]; total: number }> {
    return this.findAll({ ...filters, search: searchTerm });
  }

  async getCategories(): Promise<any> {
    return {
      categories: Object.values(VendorCategory),
      productCategories: [
        'Electronics',
        'Construction Materials',
        'Office Supplies',
        'Medical Equipment',
        'IT Hardware',
        'Industrial Equipment',
        'Safety Equipment',
        'Furniture',
        'Vehicles',
        'Other',
      ],
      serviceCategories: [
        'IT Services',
        'Consulting',
        'Maintenance',
        'Construction',
        'Transportation',
        'Security Services',
        'Cleaning Services',
        'Catering',
        'Training',
        'Other',
      ],
    };
  }

  async getStatistics(): Promise<any> {
    return this.getVendorStats();
  }

  async getPerformance(vendorId: string, query: any): Promise<any> {
    const vendor = await this.findOne(vendorId);
    
    return {
      vendor: {
        id: vendor.id,
        name: vendor.legalName,
        registrationNumber: vendor.registrationNumber,
      },
      metrics: {
        overallRating: vendor.overallRating,
        onTimeDeliveryRate: vendor.onTimeDeliveryRate,
        qualityScore: vendor.qualityScore,
        complianceScore: vendor.complianceScore,
        totalContractsCompleted: vendor.totalContractsCompleted,
        totalContractsInProgress: vendor.totalContractsInProgress,
      },
      trends: [], // Would be populated from historical data
    };
  }

  async getBidHistory(vendorId: string): Promise<any> {
    const vendor = await this.findOne(vendorId);
    
    // This would typically query the bids table
    return {
      vendor: {
        id: vendor.id,
        name: vendor.legalName,
      },
      totalBids: 0,
      wonBids: 0,
      lostBids: 0,
      pendingBids: 0,
      bids: [], // Would be populated from bids table
    };
  }

  async getContracts(vendorId: string): Promise<any> {
    const vendor = await this.findOne(vendorId);
    
    // This would typically query the contracts table
    return {
      vendor: {
        id: vendor.id,
        name: vendor.legalName,
      },
      totalContracts: vendor.totalContractsCompleted + vendor.totalContractsInProgress,
      completedContracts: vendor.totalContractsCompleted,
      activeContracts: vendor.totalContractsInProgress,
      contracts: [], // Would be populated from contracts table
    };
  }

  async verify(vendorId: string, userId: string): Promise<Vendor> {
    return this.verifyVendor(vendorId, 'approve', 'Verified by admin', { id: userId });
  }

  async approve(vendorId: string, userId: string): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);
    vendor.status = VendorStatus.VERIFIED;
    vendor.verifiedAt = new Date();
    vendor.verifiedBy = userId;
    return await this.vendorRepository.save(vendor);
  }

  async reject(vendorId: string, reason: string, userId: string): Promise<Vendor> {
    return this.verifyVendor(vendorId, 'reject', reason, { id: userId });
  }

  async suspend(vendorId: string, suspendData: any, userId: string): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);
    vendor.status = VendorStatus.SUSPENDED;
    vendor.verificationRemarks = suspendData.reason || 'Suspended by admin';
    return await this.vendorRepository.save(vendor);
  }

  async activate(vendorId: string, userId: string): Promise<Vendor> {
    const vendor = await this.findOne(vendorId);
    vendor.status = VendorStatus.VERIFIED;
    vendor.lastActivityAt = new Date();
    return await this.vendorRepository.save(vendor);
  }

  async rate(vendorId: string, ratingData: any, userId: string): Promise<Vendor> {
    return this.addRating(
      vendorId,
      {
        score: ratingData.score,
        category: ratingData.category || 'general',
        comments: ratingData.comments,
        contractId: ratingData.contractId,
      },
      { id: userId },
    );
  }

  async blacklist(vendorId: string, blacklistData: any, userId: string): Promise<Vendor> {
    return this.blacklistVendor(
      vendorId,
      blacklistData.reason,
      blacklistData.duration || 0,
      { id: userId },
    );
  }

  async remove(vendorId: string): Promise<void> {
    const vendor = await this.findOne(vendorId);
    vendor.status = VendorStatus.INACTIVE;
    await this.vendorRepository.save(vendor);
  }
}
