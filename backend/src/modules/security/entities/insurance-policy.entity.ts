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

export enum InsurancePolicyType {
  MOTOR = 'motor',
  PROPERTY = 'property',
  LIABILITY = 'liability',
  HEALTH = 'health',
  LIFE = 'life',
  TRAVEL = 'travel',
  OTHER = 'other',
}

export enum InsurancePolicyStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('insurance_policies')
@Index(['policyNumber'], { unique: true })
@Index(['tenderId', 'bidId'])
@Index(['organizationId', 'status'])
@Index(['issueDate', 'expiryDate'])
export class InsurancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  policyNumber: string;

  @Column({
    type: 'enum',
    enum: InsurancePolicyType,
  })
  type: InsurancePolicyType;

  @Column({
    type: 'enum',
    enum: InsurancePolicyStatus,
    default: InsurancePolicyStatus.DRAFT,
  })
  status: InsurancePolicyStatus;

  @Column()
  insuranceCompany: string;

  @Column()
  contactPerson: string;

  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  @Column()
  coverageAmount: number;

  @Column({ length: 3 })
  currency: string;

  @Column('date')
  issueDate: Date;

  @Column('date')
  expiryDate: Date;

  @Column('date', { nullable: true })
  renewalDate: Date;

  @Column({ nullable: true })
  termsAndConditions: string;

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

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isRenewable: boolean;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ nullable: true })
  parentPolicyId: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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
    return this.status === InsurancePolicyStatus.ACTIVE && !this.isExpired;
  }

  get effectivePeriod(): number {
    const issue = new Date(this.issueDate);
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry.getTime() - issue.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isRenewableAllowed(): boolean {
    return this.isRenewable && !this.isExpired;
  }
}
