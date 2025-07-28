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
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

export enum WorkflowType {
  TENDER_APPROVAL = 'tender_approval',
  BID_EVALUATION = 'bid_evaluation',
  CONTRACT_APPROVAL = 'contract_approval',
  VENDOR_VERIFICATION = 'vendor_verification',
  PAYMENT_APPROVAL = 'payment_approval',
  DOCUMENT_APPROVAL = 'document_approval',
  USER_ONBOARDING = 'user_onboarding',
  PURCHASE_REQUEST = 'purchase_request',
  CUSTOM = 'custom',
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled',
}

export enum ActionType {
  APPROVE = 'approve',
  REJECT = 'reject',
  REVIEW = 'review',
  COMMENT = 'comment',
  DELEGATE = 'delegate',
  ESCALATE = 'escalate',
  RETURN = 'return',
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
}

@Entity('workflows')
@Index(['organizationId', 'type'])
@Index(['status', 'isTemplate'])
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkflowType,
  })
  type: WorkflowType;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ nullable: true })
  templateId: string;

  @Column({ default: 1 })
  version: number;

  @Column('simple-json')
  steps: WorkflowStep[];

  @Column('simple-json', { nullable: true })
  conditions: WorkflowCondition[];

  @Column('simple-json', { nullable: true })
  notifications: {
    event: string;
    recipients: string[];
    template: string;
    channels: string[];
  }[];

  @Column('simple-json', { nullable: true })
  settings: {
    allowParallelApproval?: boolean;
    autoApproveOnTimeout?: boolean;
    timeoutHours?: number;
    requireComments?: boolean;
    allowDelegation?: boolean;
    allowSkip?: boolean;
    notifyOnCompletion?: boolean;
  };

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @OneToMany(() => WorkflowInstance, instance => instance.workflow)
  instances: WorkflowInstance[];
}

@Entity('workflow_instances')
@Index(['workflowId', 'status'])
@Index(['entityType', 'entityId'])
@Index(['currentStepId'])
@Index(['createdAt'])
export class WorkflowInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  instanceNumber: string;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column({ nullable: true })
  entityName: string;

  @Column({
    type: 'enum',
    enum: StepStatus,
    default: StepStatus.PENDING,
  })
  status: StepStatus;

  @Column({ nullable: true })
  currentStepId: string;

  @Column({ default: 0 })
  currentStepIndex: number;

  @Column('simple-json')
  stepInstances: StepInstance[];

  @Column('simple-json', { nullable: true })
  context: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  completedBy: string;

  @Column('text', { nullable: true })
  completionRemarks: string;

  @Column({ nullable: true })
  outcome: string;

  @Column('simple-json', { nullable: true })
  history: {
    action: string;
    performedBy: string;
    performedAt: Date;
    fromStep?: string;
    toStep?: string;
    remarks?: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Workflow)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @Column()
  workflowId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiatedById' })
  initiatedBy: User;

  @Column()
  initiatedById: string;
}

// Embedded interfaces
export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  type: 'approval' | 'review' | 'notification' | 'system' | 'conditional';
  order: number;
  assignees?: {
    type: 'user' | 'role' | 'department' | 'dynamic';
    value: string | string[];
  };
  actions: ActionType[];
  dueInHours?: number;
  escalationRules?: {
    hours: number;
    escalateTo: string;
  }[];
  conditions?: WorkflowCondition[];
  onApprove?: {
    nextStepId?: string;
    completeWorkflow?: boolean;
  };
  onReject?: {
    nextStepId?: string;
    terminateWorkflow?: boolean;
  };
  settings?: {
    requireAllApprovals?: boolean;
    minimumApprovals?: number;
    allowComments?: boolean;
    mandatoryComments?: boolean;
    allowAttachments?: boolean;
  };
}

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  nextStepId?: string;
  logic?: 'AND' | 'OR';
}

export interface StepInstance {
  stepId: string;
  stepName: string;
  status: StepStatus;
  assignedTo: string[];
  startedAt?: Date;
  completedAt?: Date;
  dueAt?: Date;
  actions: {
    actionType: ActionType;
    performedBy: string;
    performedAt: Date;
    comments?: string;
    attachments?: string[];
    delegatedTo?: string;
    outcome?: string;
  }[];
  escalations: {
    escalatedAt: Date;
    escalatedTo: string;
    reason: string;
  }[];
}

@Entity('workflow_templates')
export class WorkflowTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({
    type: 'enum',
    enum: WorkflowType,
  })
  type: WorkflowType;

  @Column('simple-json')
  steps: WorkflowStep[];

  @Column('simple-json', { nullable: true })
  defaultSettings: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;
}
