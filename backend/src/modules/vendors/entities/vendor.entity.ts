import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../auth/entities/user.entity';

export enum VendorStatus {
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
  INACTIVE = 'inactive',
}

export enum VendorCategory {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  SERVICE_PROVIDER = 'service_provider',
  CONTRACTOR = 'contractor',
  CONSULTANT = 'consultant',
  SUPPLIER = 'supplier',
  OTHER = 'other',
}

export enum VerificationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PENDING_DOCUMENTS = 'pending_documents',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('vendors')
@Index(['registrationNumber'], { unique: true })
@Index(['organizationId'], { unique: true })
@Index(['status', 'category'])
@Index(['verificationStatus'])
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  registrationNumber: string;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.PENDING_VERIFICATION,
  })
  status: VendorStatus;

  @Column({
    type: 'enum',
    enum: VendorCategory,
  })
  category: VendorCategory;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.NOT_STARTED,
  })
  verificationStatus: VerificationStatus;

  // Business Information
  @Column()
  legalName: string;

  @Column({ nullable: true })
  tradeName: string;

  @Column({ nullable: true })
  registrationDate: Date;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  businessLicenseNumber: string;

  @Column('simple-array', { nullable: true })
  businessTypes: string[];

  @Column('simple-array', { nullable: true })
  productCategories: string[];

  @Column('simple-array', { nullable: true })
  serviceCategories: string[];

  // Contact Information
  @Column()
  primaryContactName: string;

  @Column()
  primaryContactEmail: string;

  @Column()
  primaryContactPhone: string;

  @Column({ nullable: true })
  secondaryContactName: string;

  @Column({ nullable: true })
  secondaryContactEmail: string;

  @Column({ nullable: true })
  secondaryContactPhone: string;

  @Column()
  businessAddress: string;

  @Column({ nullable: true })
  billingAddress: string;

  @Column({ nullable: true })
  website: string;

  // Financial Information
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ nullable: true })
  creditRating: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankBranch: string;

  @Column({ nullable: true })
  bankSwiftCode: string;

  // Compliance and Certifications
  @Column('simple-json', { nullable: true })
  certifications: {
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate: Date;
    documentUrl?: string;
  }[];

  @Column('simple-json', { nullable: true })
  licenses: {
    type: string;
    number: string;
    issuer: string;
    issueDate: Date;
    expiryDate: Date;
    documentUrl?: string;
  }[];

  @Column('simple-json', { nullable: true })
  insurances: {
    type: string;
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    expiryDate: Date;
    documentUrl?: string;
  }[];

  // Verification Documents
  @Column('simple-json', { nullable: true })
  documents: {
    type: string;
    name: string;
    url: string;
    uploadedAt: Date;
    verifiedAt?: Date;
    verifiedBy?: string;
    status: string;
    remarks?: string;
  }[];

  // Performance Metrics
  @Column('decimal', { precision: 5, scale: 2, nullable: true, default: 0 })
  overallRating: number;

  @Column({ default: 0 })
  totalContractsCompleted: number;

  @Column({ default: 0 })
  totalContractsInProgress: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true, default: 100 })
  onTimeDeliveryRate: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true, default: 0 })
  qualityScore: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true, default: 0 })
  complianceScore: number;

  @Column({ default: 0 })
  totalDisputes: number;

  @Column({ default: 0 })
  resolvedDisputes: number;

  // Blacklist Information
  @Column({ nullable: true })
  blacklistDate: Date;

  @Column({ nullable: true })
  blacklistReason: string;

  @Column({ nullable: true })
  blacklistExpiryDate: Date;

  @Column('simple-json', { nullable: true })
  blacklistHistory: {
    date: Date;
    reason: string;
    duration: number;
    removedDate?: Date;
  }[];

  // Vendor Capabilities
  @Column('simple-json', { nullable: true })
  capabilities: {
    category: string;
    subcategory: string;
    description: string;
    capacity?: string;
    certifications?: string[];
  }[];

  @Column('simple-json', { nullable: true })
  pastProjects: {
    title: string;
    client: string;
    value: number;
    startDate: Date;
    endDate: Date;
    description: string;
    reference?: string;
  }[];

  // Preferences and Settings
  @Column('simple-json', { nullable: true })
  preferences: {
    preferredCategories?: string[];
    minimumOrderValue?: number;
    paymentTerms?: string[];
    deliveryTerms?: string[];
    communicationLanguages?: string[];
  };

  @Column('simple-json', { nullable: true })
  workingAreas: {
    country: string;
    states?: string[];
    cities?: string[];
  }[];

  // Additional Information
  @Column('text', { nullable: true })
  notes: string;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ nullable: true })
  verificationRemarks: string;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ unique: true })
  organizationId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'accountManagerId' })
  accountManager: User;

  @Column({ nullable: true })
  accountManagerId: string;

  // Computed properties
  get isActive(): boolean {
    return this.status === VendorStatus.VERIFIED;
  }

  get isBlacklisted(): boolean {
    return this.status === VendorStatus.BLACKLISTED;
  }

  get requiresVerification(): boolean {
    return this.verificationStatus !== VerificationStatus.APPROVED;
  }

  get performanceRating(): number {
    const weights = {
      overallRating: 0.3,
      onTimeDeliveryRate: 0.25,
      qualityScore: 0.25,
      complianceScore: 0.2,
    };

    return (
      (this.overallRating || 0) * weights.overallRating +
      (this.onTimeDeliveryRate || 0) * weights.onTimeDeliveryRate / 100 * 5 +
      (this.qualityScore || 0) * weights.qualityScore +
      (this.complianceScore || 0) * weights.complianceScore
    );
  }

  get disputeResolutionRate(): number {
    if (this.totalDisputes === 0) return 100;
    return (this.resolvedDisputes / this.totalDisputes) * 100;
  }

  @BeforeInsert()
  generateRegistrationNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.registrationNumber = `VND-${year}-${random}`;
  }
}
