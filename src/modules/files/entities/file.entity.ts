import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  entityType: string; // tender, bid, organization, user

  @Column({ nullable: true })
  entityId: number;

  @Column({ nullable: true })
  documentType: string; // tender_document, bid_document, etc.

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploadedBy: User;

  @Column()
  uploadedById: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;
}
