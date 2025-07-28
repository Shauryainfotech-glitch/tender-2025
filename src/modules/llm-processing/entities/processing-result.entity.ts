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
import { DocumentProcessingJob } from './document-processing-job.entity';

export enum ValidationStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PARTIAL = 'PARTIAL',
  PENDING = 'PENDING',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

@Entity('processing_results')
@Index(['jobId'])
@Index(['validationStatus'])
export class ProcessingResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobId: number;

  @ManyToOne(() => DocumentProcessingJob, (job) => job.results)
  @JoinColumn({ name: 'jobId' })
  job: DocumentProcessingJob;

  @Column({ type: 'jsonb', nullable: true })
  content: any; // Raw result content

  @Column({ type: 'jsonb', nullable: true })
  extractedData: any; // Structured extracted data

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    processingTime?: number;
    tokensUsed?: number;
    confidence?: number;
    version?: string;
  };

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  confidence: number; // 0-1 scale

  @Column({ type: 'enum', enum: ValidationStatus, default: ValidationStatus.PENDING })
  validationStatus: ValidationStatus;

  @Column({ type: 'jsonb', nullable: true })
  validationErrors: Array<{
    field: string;
    error: string;
    severity: 'error' | 'warning' | 'info';
  }>;

  @Column({ type: 'jsonb', nullable: true })
  enrichments: any; // Additional data added during processing

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  categories: string[];

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'jsonb', nullable: true })
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
    position?: { start: number; end: number };
  }>;

  @Column({ type: 'jsonb', nullable: true })
  relationships: Array<{
    type: string;
    source: string;
    target: string;
    confidence: number;
  }>;

  @Column({ default: false })
  isReviewed: boolean;

  @Column({ nullable: true })
  reviewedBy: number;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ default: false })
  requiresHumanReview: boolean;

  @Column({ type: 'jsonb', nullable: true })
  humanFeedback: Array<{
    userId: number;
    feedback: string;
    rating: number;
    timestamp: Date;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Export tracking
  @Column({ default: false })
  isExported: boolean;

  @Column({ nullable: true })
  exportedAt: Date;

  @Column({ nullable: true })
  exportedBy: number;

  @Column({ nullable: true })
  exportFormat: string;

  // Integration tracking
  @Column({ nullable: true })
  integratedWith: string; // System that consumed this result

  @Column({ nullable: true })
  integrationId: string; // External system reference

  @Column({ nullable: true })
  integrationStatus: string;

  @Column({ nullable: true })
  integrationError: string;
}
