// modules/documents/entities/document.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tender } from '../../tenders/entities/tender.entity';
import { User } from '../../users/entities/user.entity';

export enum DocumentType {
  TENDER_NOTICE = 'tender_notice',
  TECHNICAL_SPECS = 'technical_specs',
  COMMERCIAL_TERMS = 'commercial_terms',
  ELIGIBILITY_CRITERIA = 'eligibility_criteria',
  DRAWINGS = 'drawings',
  BOQ = 'boq',
  CORRIGENDUM = 'corrigendum',
  ADDENDUM = 'addendum',
  BID_DOCUMENT = 'bid_document',
  EMD_RECEIPT = 'emd_receipt',
  OTHER = 'other',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ nullable: true })
  tenderId: string;

  @ManyToOne(() => Tender, tender => tender.documents, { nullable: true })
  @JoinColumn({ name: 'tenderId' })
  tender: Tender;

  @Column()
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  version: string;

  @Column({ nullable: true })
  checksum: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
