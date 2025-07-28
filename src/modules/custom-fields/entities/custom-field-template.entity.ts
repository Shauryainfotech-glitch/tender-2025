import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('custom_field_templates')
export class CustomFieldTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string; // e.g., 'Tender', 'Vendor', 'Financial'

  @Column({ type: 'jsonb' })
  fields: Array<{
    fieldName: string;
    displayName: string;
    fieldType: string;
    section?: string;
    options?: any;
    validation?: any;
    conditionalLogic?: any;
    displaySettings?: any;
    required?: boolean;
    order?: number;
  }>;

  @Column({ default: false })
  isDefault: boolean; // System-wide templates

  @Column({ nullable: true })
  organizationId: number;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-array', nullable: true })
  applicableEntities: string[]; // Which entities can use this template

  @Column({ nullable: true })
  version: string;

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
}
