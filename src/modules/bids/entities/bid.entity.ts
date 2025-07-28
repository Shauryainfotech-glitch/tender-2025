// modules/bids/entities/bid.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tender } from '../../tenders/entities/tender.entity';
import { User } from '../../users/entities/user.entity';

export enum BidStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  QUALIFIED = 'qualified',
  DISQUALIFIED = 'disqualified',
  AWARDED = 'awarded',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  bidNumber: string;

  @Column()
  tenderId: string;

  @ManyToOne(() => Tender, tender => tender.bids)
  @JoinColumn({ name: 'tenderId' })
  tender: Tender;

  @Column()
  bidderId: string;

  @ManyToOne(() => User, user => user.bids)
  @JoinColumn({ name: 'bidderId' })
  bidder: User;

  @Column({ type: 'enum', enum: BidStatus, default: BidStatus.DRAFT })
  status: BidStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  quotedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  emdAmount: number;

  @Column({ nullable: true })
  emdReferenceNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  emdSubmissionDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  technicalProposal: any;

  @Column({ type: 'jsonb', nullable: true })
  commercialProposal: any;

  @Column({ nullable: true })
  deliveryPeriod: string;

  @Column({ nullable: true })
  paymentTerms: string;

  @Column({ nullable: true })
  warrantyPeriod: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'timestamp' })
  submissionDate: Date;

  @Column({ default: false })
  isWithdrawn: boolean;

  @Column({ type: 'timestamp', nullable: true })
  withdrawnAt: Date;

  @Column({ type: 'text', nullable: true })
  withdrawalReason: string;

  @Column({ type: 'jsonb', nullable: true })
  evaluationScores: any;

  @Column({ nullable: true })
  rank: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
