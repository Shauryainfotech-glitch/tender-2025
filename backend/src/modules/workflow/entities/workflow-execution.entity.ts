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
import { Workflow } from './workflow.entity';
import { User } from '../../auth/entities/user.entity';

export enum WorkflowExecutionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface ExecutionStep {
  stepId: string;
  stepName: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped';
  assignedTo?: string[];
  startedAt?: Date;
  completedAt?: Date;
  completedBy?: string;
  action?: 'approve' | 'reject' | 'sendBack';
  comments?: string;
  attachments?: string[];
  history?: {
    action: string;
    userId: string;
    timestamp: Date;
    comments?: string;
  }[];
}

@Entity('workflow_executions')
@Index(['workflowId', 'status'])
@Index(['entityType', 'entityId'])
@Index(['currentStep'])
export class WorkflowExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowId: string;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column({
    type: 'enum',
    enum: WorkflowExecutionStatus,
    default: WorkflowExecutionStatus.PENDING,
  })
  status: WorkflowExecutionStatus;

  @Column({ nullable: true })
  currentStep: string;

  @Column('json')
  steps: ExecutionStep[];

  @Column('json', { nullable: true })
  context: any;

  @Column('json', { nullable: true })
  variables: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  outcome: string;

  @Column('text', { nullable: true })
  finalComments: string;

  @Column()
  initiatedById: string;

  @Column({ nullable: true })
  cancelledById: string;

  @Column('text', { nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Workflow, workflow => workflow.executions)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiatedById' })
  initiatedBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cancelledById' })
  cancelledBy: User;
}