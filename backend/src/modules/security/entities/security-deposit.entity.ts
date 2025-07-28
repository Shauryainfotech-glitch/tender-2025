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

export enum DepositType {
  CASH = 'cash',
  BANK_GUARANTEE = 'bank_guarantee',
  INSURANCE_POLICY = 'insurance_policy',
  FIXED_DEPOSIT = 'fixed_deposit',
  LETTER_OF_CREDIT = 'letter_of_credit',
  OTHER = 'other',
}

export enum DepositStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  REFUNDED = 'refunded',
  FORFEITED = 'forfeited',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('security_deposits')
@Index(['depositNumber'], { unique: true })
@Index(['tenderId', 'bidId'])
@Index(['organizationId', 'status'])
@Index(['issueDate', 'expiryDate'])
export class SecurityDeposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  depositNumber: string;

  @Column({
    type: 'enum',
    enum: DepositType,
  })
  type: DepositType;

  @Column({
    type: 'enum',
    enum: DepositStatus,
    default: DepositStatus.DRAFT,
  })
  status: DepositStatus;

  @Column()
  depositorName: string;

  @Column()
  depositorContact: string;

  @Column()
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column('date')
  issueDate: Date;

  @Column('date')
  expiryDate: Date;

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
  refundedAt: Date;

  @Column({ nullable: true })
  refundedBy: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  refundedAmount: number;

  @Column({ nullable: true })
  refundReason: string;

  @Column({ nullable: true })
  refundReferenceNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  parentDepositId: string;

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

  get isRefundable(): boolean {
    return this.status === DepositStatus.ACTIVE && !this.isExpired;
  }
}
