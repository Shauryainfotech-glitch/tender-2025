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
import { User } from '../../auth/entities/user.entity';
import { Invoice } from './invoice.entity';
import { Transaction } from './transaction.entity';
import { Contract } from '../../contracts/entities/contract.entity';
import { Tender } from '../../tenders/entities/tender.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIAL_REFUND = 'partial_refund',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  NET_BANKING = 'net_banking',
  WALLET = 'wallet',
  CASH = 'cash',
  CHEQUE = 'cheque',
  DEMAND_DRAFT = 'demand_draft',
}

export enum PaymentType {
  TENDER_FEE = 'tender_fee',
  EMD = 'emd',
  PERFORMANCE_GUARANTEE = 'performance_guarantee',
  SECURITY_DEPOSIT = 'security_deposit',
  CONTRACT_PAYMENT = 'contract_payment',
  MILESTONE_PAYMENT = 'milestone_payment',
  ADVANCE_PAYMENT = 'advance_payment',
  FINAL_PAYMENT = 'final_payment',
  OTHER = 'other',
}

@Entity('payments')
@Index(['paymentNumber'], { unique: true })
@Index(['status'])
@Index(['paymentMethod'])
@Index(['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  paymentNumber: string;

  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  gatewayTransactionId: string;

  @Column({ type: 'json', nullable: true })
  gatewayResponse: any;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'json', nullable: true })
  payerDetails: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };

  @Column({ type: 'json', nullable: true })
  payeeDetails: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    bankDetails?: any;
  };

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  tenderId: string;

  @ManyToOne(() => Tender)
  @JoinColumn({ name: 'tenderId' })
  tender: Tender;

  @Column({ nullable: true })
  contractId: string;

  @ManyToOne(() => Contract)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ nullable: true })
  invoiceId: string;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @OneToMany(() => Transaction, transaction => transaction.payment)
  transactions: Transaction[];

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  verifiedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'verifiedById' })
  verifiedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}