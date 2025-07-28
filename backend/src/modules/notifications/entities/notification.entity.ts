import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TENDER_CREATED = 'tender_created',
  TENDER_PUBLISHED = 'tender_published',
  TENDER_CLOSING_SOON = 'tender_closing_soon',
  TENDER_CLOSED = 'tender_closed',
  TENDER_CANCELLED = 'tender_cancelled',
  BID_SUBMITTED = 'bid_submitted',
  BID_UPDATED = 'bid_updated',
  BID_WITHDRAWN = 'bid_withdrawn',
  BID_ACCEPTED = 'bid_accepted',
  BID_REJECTED = 'bid_rejected',
  CONTRACT_CREATED = 'contract_created',
  CONTRACT_SIGNED = 'contract_signed',
  CONTRACT_APPROVED = 'contract_approved',
  CONTRACT_REJECTED = 'contract_rejected',
  CONTRACT_TERMINATED = 'contract_terminated',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_DUE = 'payment_due',
  PAYMENT_OVERDUE = 'payment_overdue',
  WORKFLOW_APPROVAL = 'workflow_approval',
  WORKFLOW_REJECTED = 'workflow_rejected',
  WORKFLOW_ESCALATED = 'workflow_escalated',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_VERIFIED = 'document_verified',
  VENDOR_APPROVED = 'vendor_approved',
  VENDOR_REJECTED = 'vendor_rejected',
  EMD_RECEIVED = 'emd_received',
  EMD_REFUNDED = 'emd_refunded',
  SYSTEM_ALERT = 'system_alert',
  CUSTOM = 'custom',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column('jsonb', { nullable: true })
  data: Record<string, any>;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  actionText: string;

  @Column({ nullable: true })
  actionUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ default: false })
  smsSent: boolean;

  @Column({ default: false })
  pushSent: boolean;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}