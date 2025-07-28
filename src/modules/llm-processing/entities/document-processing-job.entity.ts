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
import { ProcessingTemplate } from './processing-template.entity';
import { ProcessingResult } from './processing-result.entity';

export enum ProcessingStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETRYING = 'RETRYING',
}

export enum ProcessingType {
  TENDER_EXTRACTION = 'TENDER_EXTRACTION',
  BID_ANALYSIS = 'BID_ANALYSIS',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  DOCUMENT_SUMMARY = 'DOCUMENT_SUMMARY',
  DATA_EXTRACTION = 'DATA_EXTRACTION',
  CLASSIFICATION = 'CLASSIFICATION',
  TRANSLATION = 'TRANSLATION',
  COMPARISON = 'COMPARISON',
  VALIDATION = 'VALIDATION',
  CUSTOM = 'CUSTOM',
}

export interface ProcessingConfig {
  extractFields?: string[];
  includeMetadata?: boolean;
  outputFormat?: 'json' | 'text' | 'structured';
  language?: string;
  customPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  confidenceThreshold?: number;
  enableOCR?: boolean;
  pageRange?: { start: number; end: number };
  splitBySection?: boolean;
}

@Entity('document_processing_jobs')
@Index(['status', 'createdAt'])
@Index(['userId', 'status'])
@Index(['documentId'])
export class DocumentProcessingJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  jobId: string;

  @Column({ type: 'enum', enum: ProcessingType })
  type: ProcessingType;

  @Column({ type: 'enum', enum: ProcessingStatus, default: ProcessingStatus.PENDING })
  status: ProcessingStatus;

  @Column()
  documentId: number;

  @Column()
  documentName: string;

  @Column()
  documentUrl: string;

  @Column({ nullable: true })
  documentType: string;

  @Column({ nullable: true })
  documentSize: number;

  @Column({ nullable: true })
  templateId: number;

  @ManyToOne(() => ProcessingTemplate, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template: ProcessingTemplate;

  @Column({ type: 'jsonb', nullable: true })
  config: ProcessingConfig;

  @Column({ type: 'text', nullable: true })
  customInstructions: string;

  @Column({ nullable: true })
  knowledgeBaseId: number;

  @Column({ type: 'simple-array', nullable: true })
  knowledgeBaseIds: number[]; // Multiple knowledge bases

  @Column({ default: 1 })
  priority: number; // 1-5, higher is more urgent

  @Column({ default: 0 })
  retryCount: number;

  @Column({ default: 3 })
  maxRetries: number;

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  processingTime: number; // in milliseconds

  @Column({ type: 'decimal', nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', nullable: true })
  actualCost: number;

  @Column({ nullable: true })
  llmModel: string; // e.g., 'gpt-4', 'claude-3'

  @Column({ nullable: true })
  llmProvider: string; // e.g., 'openai', 'anthropic'

  @Column({ type: 'jsonb', nullable: true })
  llmResponse: any;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: any;

  @Column({ nullable: true })
  resultId: number;

  @OneToMany(() => ProcessingResult, (result) => result.job)
  results: ProcessingResult[];

  @Column()
  userId: number;

  @Column({ nullable: true })
  organizationId: number;

  @Column({ nullable: true })
  relatedEntityType: string; // e.g., 'tender', 'bid'

  @Column({ nullable: true })
  relatedEntityId: number;

  @Column({ nullable: true })
  callbackUrl: string; // Webhook for completion notification

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Progress tracking
  @Column({ default: 0 })
  progress: number; // 0-100

  @Column({ nullable: true })
  currentStep: string;

  @Column({ type: 'jsonb', array: true, nullable: true })
  steps: Array<{
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    output?: any;
    error?: string;
  }>;

  // Token usage tracking
  @Column({ default: 0 })
  promptTokens: number;

  @Column({ default: 0 })
  completionTokens: number;

  @Column({ default: 0 })
  totalTokens: number;
}
