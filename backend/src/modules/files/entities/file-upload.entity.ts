import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('file_uploads')
@Index(['entityType', 'entityId'])
export class FileUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  uploadedBy: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}