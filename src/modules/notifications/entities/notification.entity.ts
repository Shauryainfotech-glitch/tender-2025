// modules/notifications/entities/notification.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../entities/user.entity';

export enum NotificationType {
  TENDER_CREATED = 'tender_created',
  TENDER_PUBLISHED = 'tender_published',
  TENDER_CLOSED = 'tender_closed',
  TENDER_AWARDED = 'tender_awarded',
  BID_SUBMITTED = 'bid_submitted',
  BID_EVALUATED = 'bid_evaluated',
  BID_SELECTED = 'bid_selected',
  BID_REJECTED = 'bid_rejected',
  DOCUMENT_UPLOADED = 'document_uploaded',
  ORGANIZATION_VERIFIED = 'organization_verified',
  USER_REGISTERED = 'user_registered',
  PASSWORD_RESET = 'password_reset',
  GENERAL = 'general',
}

export enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
  BOTH = 'both',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  actionUrl: string;

  @ManyToOne(() => User, (user) => user.notifications)
  recipient: User;

  @Column({ nullable: true })
  recipientEmail: string;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ nullable: true })
  emailSentAt: Date;

  @Column({ nullable: true })
  emailError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
