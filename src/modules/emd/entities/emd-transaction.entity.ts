import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EMD } from './emd.entity';

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  FORFEITURE = 'forfeiture',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionStatus {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('emd_transactions')
export class EMDTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionNumber: string;

  @ManyToOne(() => EMD, emd => emd.transactions)
  @JoinColumn({ name: 'emdId' })
  emd: EMD;

  @Column()
  emdId: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.INITIATED,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  referenceNumber: string; // Bank/Payment gateway reference

  @Column({ nullable: true })
  paymentGateway: string;

  @Column({ nullable: true })
  remarks: string;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Additional transaction details

  @Column({ nullable: true })
  initiatedBy: number;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
