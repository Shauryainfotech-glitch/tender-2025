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
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Tender } from '../../tenders/entities/tender.entity';
import { User } from '../../auth/entities/user.entity';

export enum ContractType {
  SERVICE = 'service',
  SUPPLY = 'supply',
  WORKS = 'works',
  CONSULTANCY = 'consultancy',
  FRAMEWORK = 'framework',
  MAINTENANCE = 'maintenance',
  LICENSE = 'license',
  OTHER = 'other',
}

export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum PaymentTerms {
  ADVANCE = 'advance',
  ON_DELIVERY = 'on_delivery',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  MILESTONE = 'milestone',
  CUSTOM = 'custom',
}

@Entity('contracts')
@Index(['contractNumber'], { unique: true })
@Index(['tenderId', 'vendorId'])
@Index(['status', 'startDate', 'endDate'])
@Index(['vendorId', 'status'])
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  contractNumber: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ContractType,
  })
  type: ContractType;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  status: ContractStatus;

  @Column('decimal', { precision: 15, scale: 2 })
  contractValue: number;

  @Column({ length: 3 })
  currency: string;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentTerms,
    default: PaymentTerms.NET_30,
  })
  paymentTerms: PaymentTerms;

  @Column('text', { nullable: true })
  paymentTermsDetails: string;

  @Column('text', { nullable: true })
  scopeOfWork: string;

  @Column('simple-json', { nullable: true })
  deliverables: {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    status: string;
    amount?: number;
  }[];

  @Column('simple-json', { nullable: true })
  milestones: {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    paymentPercentage: number;
    status: string;
    completedAt?: Date;
  }[];

  @Column('text', { nullable: true })
  termsAndConditions: string;

  @Column('simple-json', { nullable: true })
  specialConditions: string[];

  @Column('simple-json', { nullable: true })
  penalties: {
    type: string;
    description: string;
    amount?: number;
    percentage?: number;
  }[];

  @Column({ nullable: true })
  performanceGuaranteeRequired: boolean;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  performanceGuaranteeAmount: number;

  @Column({ nullable: true })
  insuranceRequired: boolean;

  @Column('simple-json', { nullable: true })
  insuranceDetails: {
    type: string;
    coverageAmount: number;
    provider?: string;
    policyNumber?: string;
  }[];

  // Digital Signature Fields
  @Column({ default: false })
  requiresDigitalSignature: boolean;

  @Column('simple-json', { nullable: true })
  signatures: {
    partyName: string;
    partyRole: string;
    signedBy: string;
    signedAt: Date;
    signatureHash: string;
    ipAddress?: string;
    certificate?: string;
  }[];

  @Column({ nullable: true })
  documentUrl: string;

  @Column({ nullable: true })
  documentHash: string;

  @Column({ nullable: true })
  templateId: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvalRemarks: string;

  @Column({ type: 'timestamp', nullable: true })
  signedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  suspendedAt: Date;

  @Column({ nullable: true })
  suspensionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  terminatedAt: Date;

  @Column({ nullable: true })
  terminationReason: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ default: false })
  isRenewable: boolean;

  @Column({ nullable: true })
  renewalNoticePeriodDays: number;

  @Column({ nullable: true })
  parentContractId: string;

  @Column({ default: false })
  isAmendment: boolean;

  @Column({ nullable: true })
  amendmentNumber: number;

  @Column('simple-json', { nullable: true })
  amendments: {
    number: number;
    date: Date;
    description: string;
    approvedBy: string;
    documentUrl?: string;
  }[];

  // Performance tracking
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  performanceScore: number;

  @Column('simple-json', { nullable: true })
  performanceMetrics: {
    metric: string;
    target: number;
    actual: number;
    score: number;
    evaluatedAt: Date;
  }[];

  @Column('simple-json', { nullable: true })
  disputeHistory: {
    id: string;
    date: Date;
    description: string;
    status: string;
    resolution?: string;
    resolvedAt?: Date;
  }[];

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'vendorId' })
  vendor: Organization;

  @Column()
  vendorId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'buyerId' })
  buyer: Organization;

  @Column()
  buyerId: string;

  @ManyToOne(() => Tender, { nullable: true })
  @JoinColumn({ name: 'tenderId' })
  tender: Tender;

  @Column({ nullable: true })
  tenderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'contractManagerId' })
  contractManager: User;

  @Column({ nullable: true })
  contractManagerId: string;

  // Computed properties
  get isActive(): boolean {
    return this.status === ContractStatus.ACTIVE;
  }

  get daysToExpiry(): number {
    if (!this.endDate) return -1;
    const today = new Date();
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get contractDuration(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get completionPercentage(): number {
    if (!this.milestones || this.milestones.length === 0) return 0;
    const completed = this.milestones.filter(m => m.status === 'completed').length;
    return (completed / this.milestones.length) * 100;
  }

  get requiresRenewalAction(): boolean {
    if (!this.isRenewable || this.status !== ContractStatus.ACTIVE) return false;
    const daysToExpiry = this.daysToExpiry;
    return daysToExpiry > 0 && daysToExpiry <= (this.renewalNoticePeriodDays || 30);
  }
}
