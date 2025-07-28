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

export enum CustomFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  TEXTAREA = 'textarea',
  FILE = 'file',
}

export enum CustomFieldEntity {
  TENDER = 'tender',
  BID = 'bid',
  VENDOR = 'vendor',
  CONTRACT = 'contract',
  PAYMENT = 'payment',
}

@Entity('custom_fields')
@Index(['entityType', 'organizationId'])
@Index(['fieldKey'], { unique: true })
export class CustomField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  fieldKey: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CustomFieldType,
  })
  type: CustomFieldType;

  @Column({
    type: 'enum',
    enum: CustomFieldEntity,
  })
  entityType: CustomFieldEntity;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  options: string[]; // For select/multiselect types

  @Column('json', { nullable: true })
  validation: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };

  @Column({ nullable: true })
  defaultValue: string;

  @Column({ nullable: true })
  placeholder: string;

  @Column({ nullable: true })
  helpText: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ nullable: true })
  groupName: string;

  @Column('json', { nullable: true })
  conditionalLogic: {
    show?: boolean;
    when?: string;
    operator?: string;
    value?: any;
  };

  @Column()
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}