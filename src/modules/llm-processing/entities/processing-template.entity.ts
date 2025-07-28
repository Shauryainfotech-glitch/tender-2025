import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { ProcessingType } from './document-processing-job.entity';

export interface TemplatePrompt {
  system?: string;
  user?: string;
  assistant?: string;
  examples?: Array<{
    input: string;
    output: string;
  }>;
  variables?: string[]; // Placeholders in the prompt
}

export interface ExtractionSchema {
  fields: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
    description?: string;
    required?: boolean;
    validation?: any;
    children?: ExtractionSchema; // For nested objects
  }>;
}

export interface ProcessingSteps {
  steps: Array<{
    name: string;
    type: 'extraction' | 'validation' | 'transformation' | 'enrichment';
    config: any;
    condition?: string; // JavaScript expression
    continueOnError?: boolean;
  }>;
}

@Entity('processing_templates')
export class ProcessingTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProcessingType })
  type: ProcessingType;

  @Column({ type: 'jsonb' })
  prompt: TemplatePrompt;

  @Column({ type: 'jsonb', nullable: true })
  extractionSchema: ExtractionSchema;

  @Column({ type: 'jsonb', nullable: true })
  processingSteps: ProcessingSteps;

  @Column({ default: 'gpt-4' })
  defaultModel: string;

  @Column({ default: 'openai' })
  defaultProvider: string;

  @Column({ type: 'jsonb', nullable: true })
  modelConfig: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  preprocessingRules: Array<{
    type: 'regex' | 'function' | 'normalize';
    pattern?: string;
    replacement?: string;
    function?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  postprocessingRules: Array<{
    type: 'validate' | 'transform' | 'enrich';
    config: any;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  supportedFileTypes: string[];

  @Column({ nullable: true })
  maxFileSize: number; // in MB

  @Column({ type: 'simple-array', nullable: true })
  requiredKnowledgeTypes: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean; // System default template

  @Column({ nullable: true })
  organizationId: number;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  successRate: number; // 0-1 scale

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageCost: number;

  @Column({ nullable: true })
  averageProcessingTime: number; // in milliseconds

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Version control
  @Column({ default: '1.0.0' })
  version: string;

  @Column({ type: 'jsonb', array: true, nullable: true })
  changelog: Array<{
    version: string;
    changes: string;
    changedBy: number;
    changedAt: Date;
  }>;

  // Quality metrics
  @Column({ type: 'jsonb', nullable: true })
  qualityMetrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    lastEvaluatedAt?: Date;
  };

  // Access control
  @Column({ type: 'simple-array', nullable: true })
  allowedRoles: string[];

  @Column({ type: 'simple-array', nullable: true })
  allowedUsers: number[];
}
