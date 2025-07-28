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
import { Tender } from '../../tenders/entities/tender.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { User } from '../../auth/entities/user.entity';

export enum EmdStatus {
  PENDING = 'pending',
  PAID = 'paid',
  VERIFIED = 'verified',
  REFUNDED = 'refunded',
  FORFEITED = 'forfeited',
  EXPIRED = 'expired',
}

export enum EmdType {
  BANK_GUARANTEE = 'bank_guarantee',
  FIXED_DEPOSIT = 'fixed_deposit',
  DEMAND_DRAFT = 'demand_draft',
  ONLINE_PAYMENT = 'online_payment',
}

@Entity('emds')
@Index(['tenderId', 'vendorId'], { unique: true })
@Index(['status'])
@Index(['referenceNumber'], { unique: true })
export class Emd {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  referenceNumber: string;

  @Column()
  tenderId: string;

  @Column()
  vendorId: string;

  @Column({
    type: 'enum',
    enum: EmdStatus,
    default: EmdStatus.PENDING,
  })
  status: EmdStatus;

  @Column({
    type: 'enum',
    enum: EmdType,
  })
  type: EmdType;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  instrumentNumber: string;

  @Column({ type: 'date', nullable: true })
  instrumentDate: Date;

  @Column({ nullable: true })
  bankBranch: string;

  @Column({ nullable: true })
  ifscCode: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @Column({ nullable: true })
  refundTransactionId: string;

  @Column('text', { nullable: true })
  refundReason: string;

  @Column({ type: 'timestamp', nullable: true })
  forfeitedAt: Date;

  @Column('text', { nullable: true })
  forfeitureReason: string;

  @Column({ type: 'date' })
  validUpto: Date;

  @Column('json', { nullable: true })
  documents: {
    name: string;
    url: string;
    uploadedAt: Date;
  }[];

  @Column('text', { nullable: true })
  remarks: string;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Tender)
  @JoinColumn({ name: 'tenderId' })
  tender: Tender;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'verifiedBy' })
  verifier: User;
}