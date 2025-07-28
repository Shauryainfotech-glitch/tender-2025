import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT',
  WITHDRAW = 'WITHDRAW',
  PUBLISH = 'PUBLISH',
  CLOSE = 'CLOSE',
  AWARD = 'AWARD',
  VERIFY = 'VERIFY',
  REFUND = 'REFUND',
  FORFEIT = 'FORFEIT',
}

export enum AuditModule {
  AUTH = 'AUTH',
  USER = 'USER',
  ORGANIZATION = 'ORGANIZATION',
  TENDER = 'TENDER',
  BID = 'BID',
  EMD = 'EMD',
  DOCUMENT = 'DOCUMENT',
  NOTIFICATION = 'NOTIFICATION',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
  REPORT = 'REPORT',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['module', 'action', 'createdAt'])
@Index(['entityType', 'entityId'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuditModule })
  module: AuditModule;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: number;

  @Column({ nullable: true })
  entityName: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, any>;

  @Column({ nullable: true })
  description: string;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: true })
  organizationId: number;

  @Column({ nullable: true })
  organizationName: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  requestId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  endpoint: string;

  @Column({ nullable: true })
  method: string;

  @Column({ type: 'jsonb', nullable: true })
  requestBody: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  responseBody: Record<string, any>;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  isSensitive: boolean;

  @Column({ default: false })
  isSystemAction: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Computed fields
  @Column({ type: 'int', nullable: true })
  executionTime: number; // in milliseconds

  @Column({ nullable: true })
  browserInfo: string;

  @Column({ nullable: true })
  osInfo: string;

  @Column({ nullable: true })
  deviceType: string;
}
