import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Tender } from '../../tenders/entities/tender.entity';
import { Bid } from '../../bids/entities/bid.entity';
import { User } from '../../auth/entities/user.entity';

export enum GuaranteeType {
  EMD = 'emd', // Earnest Money Deposit
  PERFORMANCE = 'performance',
  ADVANCE_PAYMENT = 'advance_payment',
  RETENTION = 'retention',
  WARRANTY = 'warranty',
}

export enum GuaranteeStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  CLAIMED = 'claimed',
  RELEASED = 'released',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('bank_guarantees')
@Index(['guaranteeNumber'], { unique: true })
@Index(['tenderId', 'bidId'])
@Index(['organizationId', 'status'])
@Index(['issueDate', 'expiryDate'])
export class BankGuarantee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  guaranteeNumber: string;

  @Column({
    type: 'enum',
    enum: GuaranteeType,
  })
  type: GuaranteeType;

  @Column({
    type: 'enum',
    enum: GuaranteeStatus,
    default: GuaranteeStatus.DRAFT,
  })
  status: GuaranteeStatus;

  @Column()
  bankName: string;

  @Column()
  bankBranch: string;

  @Column({ nullable: true })
  bankAddress: string;

  @Column({ nullable: true })
  bankSwiftCode: string;

  @Column({ nullable: true })
  bankContactNumber: string;

  @Column({ nullable: true })
  bankContactEmail: string;

  @Column({ nullable: true })
  bankOfficerName: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column('date')
  issueDate: Date;

  @Column('date')
  expiryDate: Date;

  @Column({ nullable: true })
  claimPeriodDays: number;

  @Column()
  beneficiaryName: string;

  @Column({ nullable: true })
  beneficiaryAddress: string;

  @Column({ nullable: true })
  purpose: string;

  @Column('text', { nullable: true })
  termsAndConditions: string;

  @Column({ nullable: true })
  referenceNumber: string;

  @Column({ nullable: true })
  documentUrl: string;

  @Column({ nullable: true })
  documentHash: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ nullable: true })
  verificationRemarks: string;

  @Column({ type: 'timestamp', nullable: true })
  claimedAt: Date;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  claimedAmount: number;

  @Column({ nullable: true })
  claimReason: string;

  @Column({ nullable: true })
  claimReferenceNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  releasedAt: Date;

  @Column({ nullable: true })
  releasedBy: string;

  @Column({ nullable: true })
  releaseRemarks: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isAutoRenewable: boolean;

  @Column({ nullable: true })
  renewalDays: number;

  @Column({ nullable: true })
  parentGuaranteeId: string;

  // Security features
  @Column({ default: false })
  requiresPhysicalVerification: boolean;

  @Column({ default: false })
  isElectronic: boolean;

  @Column({ nullable: true })
  electronicVerificationCode: string;

  @Column({ nullable: true })
  qrCodeData: string;

  // Risk assessment
  @Column({ nullable: true })
  riskLevel: string;

  @Column({ nullable: true })
  riskScore: number;

  @Column('text', { nullable: true })
  riskAssessmentNotes: string;

  // Notification settings
  @Column('simple-json', { nullable: true })
  notificationSettings: {
    expiryAlert?: number; // Days before expiry
    claimAlert?: boolean;
    releaseAlert?: boolean;
    emailRecipients?: string[];
  };

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: string;

  @ManyToOne(() => Tender, { nullable: true })
  @JoinColumn({ name: 'tenderId' })
  tender: Tender;

  @Column({ nullable: true })
  tenderId: string;

  @ManyToOne(() => Bid, { nullable: true })
  @JoinColumn({ name: 'bidId' })
  bid: Bid;

  @Column({ nullable: true })
  bidId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @Column({ nullable: true })
  approvedById: string;

  // Computed properties
  get isExpired(): boolean {
    return new Date() > new Date(this.expiryDate);
  }

  get daysToExpiry(): number {
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isClaimable(): boolean {
    return this.status === GuaranteeStatus.ACTIVE && !this.isExpired;
  }

  get effectivePeriod(): number {
    const issue = new Date(this.issueDate);
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry.getTime() - issue.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
