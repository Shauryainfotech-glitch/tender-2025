import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { WorkflowInstance } from './workflow-instance.entity';
import { WorkflowAction } from './workflow-action.entity';
import { User } from '../../auth/entities/user.entity';

export enum StepStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped',
  EXPIRED = 'expired',
  ESCALATED = 'escalated',
}

export enum ActionType {
  APPROVAL = 'approval',
  REJECTION = 'rejection',
  COMMENT = 'comment',
  ESCALATION = 'escalation',
  DELEGATION = 'delegation',
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  UPDATE_FIELD = 'update_field',
  CREATE_TASK = 'create_task',
  CUSTOM = 'custom',
}

@Entity('workflow_steps')
export class WorkflowStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowInstanceId: string;

  @ManyToOne(() => WorkflowInstance, instance => instance.steps)
  @JoinColumn({ name: 'workflowInstanceId' })
  workflowInstance: WorkflowInstance;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  order: number;

  @Column({
    type: 'enum',
    enum: StepStatus,
    default: StepStatus.PENDING,
  })
  status: StepStatus;

  @Column({ nullable: true })
  approverRole: string;

  @Column('simple-array', { nullable: true })
  approverIds: string[];

  @Column({ default: false })
  autoApprove: boolean;

  @Column('jsonb', { nullable: true })
  conditions: any[];

  @Column('jsonb', { nullable: true })
  actions: Array<{
    type: ActionType;
    trigger: string;
    config: Record<string, any>;
  }>;

  @Column({ nullable: true })
  timeoutHours: number;

  @Column('jsonb', { nullable: true })
  escalationConfig: {
    escalateAfterHours: number;
    escalateToRole?: string;
    escalateToUserIds?: string[];
  };

  @Column({ nullable: true })
  approvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  rejectedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'rejectedBy' })
  rejecter: User;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => WorkflowAction, action => action.workflowStep)
  workflowActions: WorkflowAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}