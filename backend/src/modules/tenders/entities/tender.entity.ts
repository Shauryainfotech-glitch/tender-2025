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
import { User } from '../../auth/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Bid } from '../../bids/entities/bid.entity';

export enum TenderStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  EVALUATION = 'evaluation',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum TenderType {
  OPEN = 'open',
  LIMITED = 'limited',
  SINGLE = 'single',
  TWO_STAGE = 'two_stage',
  EXPRESSION_OF_INTEREST = 'expression_of_interest',
}

export enum TenderCategory {
  GOODS = 'goods',
  SERVICES = 'services',
  WORKS = 'works',
  CONSULTANCY = 'consultancy',
  OTHER = 'other',
}

@Entity('tenders')
@Index(['referenceNumber'], { unique: true })
@Index(['status', 'publishDate'])
@Index(['category', 'type'])
export class Tender {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  referenceNumber: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TenderStatus,
    default: TenderStatus.DRAFT,
  })
  status: TenderStatus;

  @Column({
    type: 'enum',
    enum: TenderType,
  })
  type: TenderType;

  @Column({
    type: 'enum',
    enum: TenderCategory,
  })
  category: TenderCategory;

  @Column('decimal', { precision: 15, scale: 2 })
  estimatedValue: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  emdAmount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  emdPercentage: number;

  @Column({ type: 'timestamp' })
  publishDate: Date;

  @Column({ type: 'timestamp' })
  bidStartDate: Date;

  @Column({ type: 'timestamp' })
  bidEndDate: Date;

  @Column({ type: 'timestamp' })
  openingDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  clarificationDeadline: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  deliveryPeriod: string;

  @Column({ nullable: true })
  paymentTerms: string;

  @Column('simple-array', { nullable: true })
  eligibilityCriteria: string[];

  @Column('simple-json', { nullable: true })
  technicalRequirements: Record<string, any>;

  @Column('simple-json', { nullable: true })
  evaluationCriteria: {
    technical: number;
    financial: number;
    other?: Record<string, number>;
  };

  @Column('simple-array', { nullable: true })
  requiredDocuments: string[];

  @Column('simple-json', { nullable: true })
  contactDetails: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };

  @Column({ default: false })
  isMultipleWinnersAllowed: boolean;

  @Column({ nullable: true })
  maxWinners: number;

  @Column({ default: true })
  isEmdRequired: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column('simple-array', { nullable: true })
  invitedVendors: string[];

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  bidCount: number;

  @Column('simple-json', { nullable: true })
  attachments: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];

  @Column('simple-json', { nullable: true })
  amendments: {
    date: Date;
    description: string;
    attachments?: {
      name: string;
      url: string;
    }[];
  }[];

  @Column('simple-json', { nullable: true })
  clarifications: {
    question: string;
    answer: string;
    date: Date;
    askedBy?: string;
  }[];

  @Column('text', { nullable: true })
  cancellationReason: string;

  @Column({ type: 'timestamp', nullable: true })
  cancellationDate: Date;

  @Column({ nullable: true })
  awardedTo: string;

  @Column({ type: 'timestamp', nullable: true })
  awardedDate: Date;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  awardedAmount: number;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, organization => organization.tenders)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: string;

  @ManyToOne(() => User, user => user.createdTenders)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @OneToMany(() => Bid, bid => bid.tender)
  bids: Bid[];
}