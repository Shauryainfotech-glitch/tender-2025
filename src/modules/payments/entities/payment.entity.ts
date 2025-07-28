import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Tender } from '../../tenders/entities/tender.entity';
import { Contract } from '../../../backend/src/modules/contracts/entities/contract.entity';
import { Vendor } from '../../../backend/src/modules/vendors/entities/vendor.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentType {
  TENDER_FEE = 'tender_fee',
  EMD = 'emd',
  PERFORMANCE_GUARANTEE = 'performance_guarantee',
  CONTRACT_PAYMENT = 'contract_payment',
  MILESTONE_PAYMENT = 'milestone_payment',
  ADVANCE_PAYMENT = 'advance_payment',
  FINAL_PAYMENT = 'final_payment',
  PENALTY = 'penalty',
  REFUND = 'refund',
  OTHER = 'other',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  NET_BANKING = 'net_banking',
  UPI = 'upi',
  WALLET = 'wallet',
  CHEQUE = 'cheque',
  DEMAND_DRAFT = 'demand_draft',
  CASH = 'cash',
}

export enum PaymentMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

@Entity('payments')
@Index(['transactionNumber'], { unique: true })
@Index(['organizationId', 'status'])
@Index(['vendorId', 'status'])
@Index(['contractId'])
@Index(['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  transactionNumber: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentMode,
  })
  paymentMode: PaymentMode;

  @Column({ nullable: true })
  referenceNumber: string;

  @Column({ nullable: true })
  gatewayTransactionId: string;

  @Column({ nullable: true })
  gatewayName: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankBranch: string;

  @Column({ nullable: true })
  ifscCode: string;

  @Column({ nullable: true })
  upiId: string;

  @Column({ nullable: true })
  chequeNumber: string;

  @Column({ nullable: true })
  chequeDate: Date;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  remarks: string;

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column({ nullable: true })
  invoiceDate: Date;

  @Column({ nullable: true })
  invoiceUrl: string;

  @Column({ nullable: true })
  receiptNumber: string;

  @Column({ nullable: true })
  receiptUrl: string;

  // Tax Information
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  subtotal: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  taxRate: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  taxAmount: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  discount: number;

  @Column('simple-json', { nullable: true })
  taxBreakdown: {
    type: string;
    rate: number;
    amount: number;
  }[];

  // Processing Information
  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  processedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  @Column('simple-json', { nullable: true })
  gatewayResponse: Record<string, any>;

  // Refund Information
  @Column({ default: false })
  isRefundable: boolean;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  refundedAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @Column({ nullable: true })
  refundReason: string;

  @Column({ nullable: true })
  refundTransactionId: string;

  @Column('simple-json', { nullable: true })
  refundHistory: {
    amount: number;
    date: Date;
    reason: string;
    transactionId: string;
  }[];

  // Reconciliation
  @Column({ default: false })
  isReconciled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;

  @Column({ nullable: true })
  reconciledBy: string;

  @Column({ nullable: true })
  reconciliationRemarks: string;

  // Approval Workflow
  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvalRemarks: string;

  @Column('simple-json', { nullable: true })
  approvalHistory: {
    action: string;
    performedBy: string;
    performedAt: Date;
    remarks?: string;
  }[];

  // Compliance and Audit
  @Column({ nullable: true })
  tdsRate: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  tdsAmount: number;

  @Column({ nullable: true })
  panNumber: string;

  @Column({ nullable: true })
  gstNumber: string;

  @Column({ nullable: true })
  tanNumber: string;

  // Additional Information
  @Column('simple-json', { nullable: true })
  beneficiaryDetails: {
    name: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    address?: string;
  };

  @Column('simple-json', { nullable: true })
  milestoneDetails: {
    milestoneId: string;
    milestoneName: string;
    percentage: number;
  };

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  reminderSentAt: Date;

  @Column({ default: 0 })
  reminderCount: number;

  @Column('simple-json', { nullable: true })
  attachments: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }[];

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

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'vendorId' })
  vendor: Organization;

  @Column({ nullable: true })
  vendorId: string;

  @ManyToOne(() => Tender, { nullable: true })
  @JoinColumn({ name: 'tenderId' })
  tender: Tender;

  @Column({ nullable: true })
  tenderId: string;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ nullable: true })
  contractId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: string;

  // Computed properties
  get isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  get isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  get totalAmount(): number {
    const subtotal = this.subtotal || this.amount;
    const tax = this.taxAmount || 0;
    const discount = this.discount || 0;
    return subtotal + tax - discount;
  }

  get netAmount(): number {
    return this.totalAmount - (this.tdsAmount || 0);
  }

  get isOverdue(): boolean {
    if (!this.dueDate || this.isCompleted) return false;
    return new Date() > new Date(this.dueDate);
  }

  get daysPastDue(): number {
    if (!this.isOverdue) return 0;
    const today = new Date();
    const due = new Date(this.dueDate);
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  @BeforeInsert()
  generateTransactionNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.transactionNumber = `PAY-${year}${month}-${random}`;
  }
}
