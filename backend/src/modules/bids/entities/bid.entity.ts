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
import { User } from '../../auth/entities/user.entity';
import { Tender } from '../../tenders/entities/tender.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum BidStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_EVALUATION = 'under_evaluation',
  SHORTLISTED = 'shortlisted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  DISQUALIFIED = 'disqualified',
}

export enum BidType {
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  COMBINED = 'combined',
}

@Entity('bids')
@Index(['referenceNumber'], { unique: true })
@Index(['status', 'tenderId'])
@Index(['vendorId', 'tenderId'], { unique: true })
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  referenceNumber: string;

  @Column()
  tenderId: string;

  @Column()
  vendorId: string;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: BidStatus,
    default: BidStatus.DRAFT,
  })
  status: BidStatus;

  @Column({
    type: 'enum',
    enum: BidType,
    default: BidType.COMBINED,
  })
  type: BidType;

  @Column('decimal', { precision: 15, scale: 2 })
  quotedAmount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ nullable: true })
  deliveryPeriod: string;

  @Column('text', { nullable: true })
  technicalProposal: string;

  @Column('text', { nullable: true })
  commercialProposal: string;

  @Column('simple-json', { nullable: true })
  technicalScore: {
    total: number;
    breakdown: Record<string, number>;
  };

  @Column('simple-json', { nullable: true })
  financialScore: {
    total: number;
    breakdown: Record<string, number>;
  };

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  overallScore: number;

  @Column({ nullable: true })
  ranking: number;

  @Column('simple-json', { nullable: true })
  submittedDocuments: {
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }[];

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  evaluatedAt: Date;

  @Column({ nullable: true })
  evaluatedBy: string;

  @Column('text', { nullable: true })
  evaluationRemarks: string;

  @Column('simple-json', { nullable: true })
  deviations: {
    clause: string;
    description: string;
    impact: string;
  }[];

  @Column({ default: false })
  isEmdPaid: boolean;

  @Column({ nullable: true })
  emdTransactionId: string;

  @Column({ type: 'timestamp', nullable: true })
  emdPaidAt: Date;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  emdAmount: number;

  @Column({ default: false })
  isSecurityDepositPaid: boolean;

  @Column({ nullable: true })
  securityDepositId: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { nullable: true })
  internalComments: string;

  @Column('simple-json', { nullable: true })
  clarifications: {
    question: string;
    answer: string;
    date: Date;
  }[];

  @Column({ nullable: true })
  withdrawalReason: string;

  @Column({ type: 'timestamp', nullable: true })
  withdrawnAt: Date;

  @Column({ nullable: true })
  disqualificationReason: string;

  @Column({ type: 'timestamp', nullable: true })
  disqualifiedAt: Date;

  @Column({ default: false })
  isTechnicalBidOpened: boolean;

  @Column({ default: false })
  isFinancialBidOpened: boolean;

  @Column({ type: 'timestamp', nullable: true })
  technicalBidOpenedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  financialBidOpenedAt: Date;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Tender, tender => tender.bids)
  @JoinColumn({ name: 'tenderId' })
  tender: Tender;

  @ManyToOne(() => User, user => user.bids)
  @JoinColumn({ name: 'vendorId' })
  vendor: User;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}