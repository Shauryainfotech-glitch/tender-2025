import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WorkflowInstance } from './workflow-instance.entity';

export enum WorkflowType {
  APPROVAL = 'approval',
  REVIEW = 'review',
  ESCALATION = 'escalation',
  NOTIFICATION = 'notification',
  MULTI_STAGE = 'multi_stage',
  CONDITIONAL = 'conditional',
  PARALLEL = 'parallel',
  CUSTOM = 'custom',
}

@Entity('workflow_templates')
export class WorkflowTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkflowType,
    default: WorkflowType.APPROVAL,
  })
  type: WorkflowType;

  @Column()
  entityType: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 1 })
  version: number;

  @Column('jsonb')
  steps: Array<{
    name: string;
    description: string;
    order: number;
    approverRole?: string;
    approverIds?: string[];
    autoApprove?: boolean;
    conditions?: any[];
    actions: Array<{
      type: string;
      trigger: string;
      config: Record<string, any>;
    }>;
    timeoutHours?: number;
    escalationConfig?: {
      escalateAfterHours: number;
      escalateToRole?: string;
      escalateToUserIds?: string[];
    };
  }>;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => WorkflowInstance, instance => instance.template)
  instances: WorkflowInstance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}