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
import { Organization } from '../../organizations/entities/organization.entity';

export enum KnowledgeType {
  TENDER_RULES = 'TENDER_RULES',
  COMPLIANCE_REQUIREMENTS = 'COMPLIANCE_REQUIREMENTS',
  TECHNICAL_SPECIFICATIONS = 'TECHNICAL_SPECIFICATIONS',
  EVALUATION_CRITERIA = 'EVALUATION_CRITERIA',
  LEGAL_TERMS = 'LEGAL_TERMS',
  INDUSTRY_STANDARDS = 'INDUSTRY_STANDARDS',
  BEST_PRACTICES = 'BEST_PRACTICES',
  FAQ = 'FAQ',
  GLOSSARY = 'GLOSSARY',
  CUSTOM = 'CUSTOM',
}

export enum KnowledgeSource {
  MANUAL_ENTRY = 'MANUAL_ENTRY',
  DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
  WEB_SCRAPING = 'WEB_SCRAPING',
  API_INTEGRATION = 'API_INTEGRATION',
  AI_GENERATED = 'AI_GENERATED',
  USER_FEEDBACK = 'USER_FEEDBACK',
}

export interface KnowledgeMetadata {
  author?: string;
  version?: string;
  lastReviewedAt?: Date;
  reviewedBy?: string;
  confidenceScore?: number;
  usage_count?: number;
  relevance_score?: number;
  tags?: string[];
  references?: Array<{
    title: string;
    url?: string;
    type: string;
  }>;
}

@Entity('knowledge_bases')
@Index(['type', 'isActive'])
@Index(['organizationId', 'type'])
@Index('knowledge_base_search_idx', { synchronize: false })
export class KnowledgeBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: KnowledgeType })
  type: KnowledgeType;

  @Column({ type: 'enum', enum: KnowledgeSource })
  source: KnowledgeSource;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  structuredData: any; // For storing structured information

  @Column({ type: 'simple-array', nullable: true })
  categories: string[];

  @Column({ type: 'simple-array', nullable: true })
  keywords: string[];

  @Column({ nullable: true })
  language: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean; // Available to all organizations

  @Column({ nullable: true })
  organizationId: number;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  parentId: number; // For hierarchical knowledge

  @Column({ type: 'simple-array', nullable: true })
  applicableEntities: string[]; // Which entities can use this knowledge

  @Column({ type: 'jsonb', nullable: true })
  metadata: KnowledgeMetadata;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: 1 })
  priority: number; // Higher priority knowledge is preferred

  @Column({ default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confidenceScore: number; // 0-1 scale

  @Column({ nullable: true })
  sourceDocumentId: number;

  @Column({ nullable: true })
  sourceDocumentUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  embeddingVector: number[]; // For semantic search

  @Column({ nullable: true })
  embeddingModel: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastUsedAt: Date;

  // Version control
  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  previousVersionId: number;

  @Column({ default: false })
  isLatestVersion: boolean;

  // Validation and quality
  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ type: 'jsonb', array: true, nullable: true })
  validationHistory: Array<{
    action: string;
    performedBy: number;
    performedAt: Date;
    notes?: string;
  }>;
}
