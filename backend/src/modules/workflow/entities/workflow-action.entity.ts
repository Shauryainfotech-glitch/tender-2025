import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkflowStep } from './workflow-step.entity';
import { User } from '../../auth/entities/user.entity';

export enum ActionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying',
}

export enum ActionTrigger {
  STEP_ACTIVATED = 'step_activated',
  STEP_APPROVED = 'step_approved',
  STEP_REJECTED = 'step_rejected',
  STEP_TIMEOUT = 'step_timeout',
  STEP_ESCALATED = 'step_escalated',
  WORKFLOW_STARTED = 'workflow_started',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_CANCELLED = 'workflow_cancelled',
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  CONDITION_MET = 'condition_met',
}

@Entity('workflow_actions')
export class WorkflowAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowStepId: string;

  @ManyToOne(() => WorkflowStep, step => step.workflowActions)
  @JoinColumn({ name: 'workflowStepId' })
  workflowStep: WorkflowStep;

  @Column()
  type: string;

  @Column({
    type: 'enum',
    enum: ActionTrigger,
    default: ActionTrigger.MANUAL,
  })
  trigger: ActionTrigger;

  @Column({
    type: 'enum',
    enum: ActionStatus,
    default: ActionStatus.PENDING,
  })
  status: ActionStatus;

  @Column('jsonb')
  config: {
    templateId?: string;
    recipients?: string[];
    subject?: string;
    body?: string;
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    payload?: any;
    field?: string;
    value?: any;
    assigneeId?: string;
    assigneeRole?: string;
    dueDate?: Date;
    priority?: string;
    [key: string]: any;
  };

  @Column({ nullable: true })
  executedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'executedBy' })
  executor: User;

  @Column({ type: 'timestamp', nullable: true })
  executedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ default: 3 })
  maxRetries: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRetryAt: Date;

  @Column('jsonb', { nullable: true })
  result: {
    success: boolean;
    message?: string;
    data?: any;
    error?: any;
  };

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}