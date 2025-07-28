// modules/tenders/entities/tender.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Bid } from '../../bids/entities/bid.entity';
import { Document } from '../../documents/entities/document.entity';

export enum TenderStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  CLOSED = 'closed',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
}

export enum TenderType {
  OPEN = 'open',
  RESTRICTED = 'restricted',
  NEGOTIATED = 'negotiated',
  SINGLE_SOURCE = 'single_source',
}

@Entity('tenders')
export class Tender {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  referenceNumber: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: TenderType })
  type: TenderType;

  @Column({ type: 'enum', enum: TenderStatus, default: TenderStatus.DRAFT })
  status: TenderStatus;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, organization => organization.tenders)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  createdById: string;

  @ManyToOne(() => User, user => user.createdTenders)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subCategory: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  estimatedValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  emdAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  emdPercentage: number;

  @Column({ type: 'timestamp' })
  publishDate: Date;

  @Column({ type: 'timestamp' })
  bidOpeningDate: Date;

  @Column({ type: 'timestamp' })
  bidClosingDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  preQualificationDate: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  deliveryPeriod: string;

  @Column({ nullable: true })
  warrantyPeriod: string;

  @Column({ type: 'jsonb', nullable: true })
  eligibilityCriteria: any;

  @Column({ type: 'jsonb', nullable: true })
  technicalRequirements: any;

  @Column({ type: 'jsonb', nullable: true })
  commercialTerms: any;

  @Column({ default: false })
  isMultipleWinnersAllowed: boolean;

  @Column({ nullable: true })
  maxWinners: number;

  @OneToMany(() => Bid, bid => bid.tender)
  bids: Bid[];

  @OneToMany(() => Document, document => document.tender)
  documents: Document[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
