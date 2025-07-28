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
import { User } from '../../auth/entities/user.entity';

export enum WorkflowType {
  TENDER_APPROVAL = 'tender_approval',
  BID_EVALUATION = 'bid_evaluation',
  CONTRACT_APPROVAL = 'contract_approval',
  PAYMENT_APPROVAL = 'payment_approval',
  VENDOR_REGISTRATION = 'vendor_registration',
  CUSTOM = 'custom',
}

export enum WorkflowStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  approverRole?: string;
  approverUsers?: string[];
  approvalType: 'any' | 'all' | 'specific';
  actions: {
    approve: {
      nextStep?: string;
      notifications?: string[];
    };
    reject: {
      nextStep?: string;
      notifications?: string[];
    };
    sendBack: {
      toStep?: string;
      notifications?: string[];
    };
  };
  conditions?: any;
  sla?: {
    duration: number;
    unit: 'hours' | 'days';
    escalationTo?: string[];
  };
}

@Entity('workflows')
@Index(['type', 'organizationId'])
@Index(['status'])
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

  @Column('json')
  steps: WorkflowStep[];

  @Column('json', { nullable: true })
  triggers: {
    event: string;
    conditions?: any;
  }[];

  @Column('json', { nullable: true })
  settings: {
    allowParallelApproval?: boolean;
    allowSkipSteps?: boolean;
    autoApproveOnTimeout?: boolean;
    requireComments?: boolean;
    notificationSettings?: any;
  };

  @Column({ default: true })
  isDefault: boolean;

  @Column({ nullable: true })
  version: number;

  @Column({ nullable: true })
  parentWorkflowId: string;

  @Column()
  organizationId: string;

  @Column()
  createdById: string;

  @Column({ nullable: true })
  updatedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @OneToMany(() => WorkflowExecution, execution => execution.workflow)
  executions: WorkflowExecution[];
}

// Import this type to avoid circular dependency
export class WorkflowExecution {
  workflow: Workflow;
}