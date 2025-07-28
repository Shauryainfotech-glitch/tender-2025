import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tender } from '../../tenders/entities/tender.entity';
import { Bid } from '../../bids/entities/bid.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { EMDTransaction } from './emd-transaction.entity';

export enum EMDStatus {
  PENDING = 'pending',
  PAID = 'paid',
  VERIFIED = 'verified',
  REFUNDED = 'refunded',
  FORFEITED = 'forfeited',
  EXPIRED = 'expired',
}

export enum PaymentMethod {
  BANK_GUARANTEE = 'bank_guarantee',
  DEMAND_DRAFT = 'demand_draft',
  ONLINE_PAYMENT = 'online_payment',
  NEFT = 'neft',
  RTGS = 'rtgs',
}

@Entity('emds')
export class EMD {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  emdNumber: string;

  @ManyToOne(() => Tender, tender => tender.emds)
  @JoinColumn({ name: 'tenderId' })
  tender: Tender;

  @Column()
  tenderId: number;

  @ManyToOne(() => Bid, bid => bid.emd, { nullable: true })
  @JoinColumn({ name: 'bidId' })
  bid: Bid;

  @Column({ nullable: true })
  bidId: number;

  @ManyToOne(() => Organization, organization => organization.emds)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  instrumentNumber: string; // DD/Cheque/Transaction number

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  branchName: string;

  @Column({ type: 'date', nullable: true })
  instrumentDate: Date;

  @Column({ type: 'date' })
  validityDate: Date;

  @Column({
    type: 'enum',
    enum: EMDStatus,
    default: EMDStatus.PENDING,
  })
  status: EMDStatus;

  @Column({ nullable: true })
  verificationRemarks: string;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  refundReason: string;

  @Column({ nullable: true })
  refundedAt: Date;

  @Column({ nullable: true })
  forfeitureReason: string;

  @Column({ nullable: true })
  forfeitedAt: Date;

  @OneToMany(() => EMDTransaction, transaction => transaction.emd)
  transactions: EMDTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
