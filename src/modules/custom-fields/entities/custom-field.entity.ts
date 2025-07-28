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
import { CustomFieldValue } from './custom-field-value.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  TEXTAREA = 'TEXTAREA',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  URL = 'URL',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  CURRENCY = 'CURRENCY',
  PERCENTAGE = 'PERCENTAGE',
  JSON = 'JSON',
  RICH_TEXT = 'RICH_TEXT',
  COLOR = 'COLOR',
  RATING = 'RATING',
  SLIDER = 'SLIDER',
  ADDRESS = 'ADDRESS',
  LOCATION = 'LOCATION',
  SIGNATURE = 'SIGNATURE',
}

export enum EntityType {
  TENDER = 'TENDER',
  BID = 'BID',
  ORGANIZATION = 'ORGANIZATION',
  USER = 'USER',
  EMD = 'EMD',
  DOCUMENT = 'DOCUMENT',
  CONTRACT = 'CONTRACT',
  VENDOR = 'VENDOR',
}

export interface FieldOptions {
  choices?: Array<{ value: string; label: string; color?: string }>;
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  unique?: boolean;
  multiple?: boolean;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  dateFormat?: string;
  currency?: string;
  precision?: number;
  allowNegative?: boolean;
  rows?: number;
  cols?: number;
  autocomplete?: boolean;
  suggestions?: string[];
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  custom?: string; // Custom validation function as string
  messages?: {
    [key: string]: string;
  };
}

export interface ConditionalLogic {
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'empty' | 'not_empty';
    value: any;
  }>;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
  logic?: 'AND' | 'OR';
}

@Entity('custom_fields')
@Index(['entityType', 'fieldName'])
@Index(['organizationId', 'isActive'])
export class CustomField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fieldName: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: FieldType })
  fieldType: FieldType;

  @Column({ type: 'enum', enum: EntityType })
  entityType: EntityType;

  @Column({ nullable: true })
  section: string; // Group fields into sections

  @Column({ type: 'jsonb', nullable: true })
  options: FieldOptions;

  @Column({ type: 'jsonb', nullable: true })
  validation: ValidationRules;

  @Column({ type: 'jsonb', nullable: true })
  conditionalLogic: ConditionalLogic;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: false })
  isUnique: boolean;

  @Column({ default: false })
  isSearchable: boolean;

  @Column({ default: false })
  isFilterable: boolean;

  @Column({ default: false })
  isSortable: boolean;

  @Column({ default: true })
  isEditable: boolean;

  @Column({ default: true })
  isVisible: boolean;

  @Column({ default: false })
  isSystem: boolean; // System fields cannot be deleted

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ nullable: true })
  helpText: string;

  @Column({ nullable: true })
  tooltip: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  cssClass: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: {
    view?: string[];
    edit?: string[];
    delete?: string[];
  };

  @Column({ nullable: true })
  organizationId: number;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => CustomFieldValue, (value) => value.customField)
  values: CustomFieldValue[];

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

  // Computed field for frontend display
  @Column({ type: 'jsonb', nullable: true })
  displaySettings: {
    width?: string;
    height?: string;
    labelPosition?: 'top' | 'left' | 'right' | 'inline';
    showInGrid?: boolean;
    showInForm?: boolean;
    showInDetail?: boolean;
    groupName?: string;
    columnSpan?: number;
  };

  // Field dependencies for complex forms
  @Column({ type: 'jsonb', nullable: true })
  dependencies: {
    fields?: string[];
    formula?: string;
    calculateOn?: 'change' | 'submit' | 'load';
  };

  // Data transformation rules
  @Column({ type: 'jsonb', nullable: true })
  transformations: {
    input?: string; // Function to transform input
    output?: string; // Function to transform output
    storage?: string; // Function to transform for storage
  };

  // Audit settings
  @Column({ default: true })
  trackChanges: boolean;

  @Column({ default: false })
  encryptValue: boolean;
}
