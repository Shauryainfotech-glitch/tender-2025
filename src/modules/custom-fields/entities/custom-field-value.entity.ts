import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CustomField } from './custom-field.entity';

@Entity('custom_field_values')
@Index(['customFieldId', 'entityId'])
@Index(['entityType', 'entityId'])
export class CustomFieldValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customFieldId: number;

  @ManyToOne(() => CustomField, (field) => field.values, { eager: true })
  @JoinColumn({ name: 'customFieldId' })
  customField: CustomField;

  @Column()
  entityType: string;

  @Column()
  entityId: number;

  @Column({ type: 'text', nullable: true })
  textValue: string;

  @Column({ type: 'numeric', nullable: true })
  numberValue: number;

  @Column({ type: 'date', nullable: true })
  dateValue: Date;

  @Column({ type: 'boolean', nullable: true })
  booleanValue: boolean;

  @Column({ type: 'jsonb', nullable: true })
  jsonValue: any;

  @Column({ type: 'text', array: true, nullable: true })
  arrayValue: string[];

  @Column({ type: 'text', nullable: true })
  fileValue: string; // Store file URL or path

  @Column({ type: 'text', nullable: true })
  encryptedValue: string; // For sensitive data

  @Column({ nullable: true })
  displayValue: string; // Formatted value for display

  @Column({ nullable: true })
  sortValue: string; // Value used for sorting

  @Column({ default: true })
  isValid: boolean;

  @Column({ nullable: true })
  validationError: string;

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

  // History tracking
  @Column({ type: 'jsonb', array: true, nullable: true })
  history: Array<{
    value: any;
    changedBy: number;
    changedAt: Date;
    reason?: string;
  }>;
}
