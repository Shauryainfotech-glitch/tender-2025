import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Tender } from '../../tenders/entities/tender.entity';

export enum OrganizationType {
  GOVERNMENT = 'government',
  PRIVATE = 'private',
  PUBLIC_SECTOR = 'public_sector',
  PSU = 'psu',
  NGO = 'ngo',
  OTHER = 'other',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: OrganizationType,
  })
  type: OrganizationType;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.PENDING_VERIFICATION,
  })
  status: OrganizationStatus;

  @Column({ unique: true, nullable: true })
  registrationNumber: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column('simple-json', { nullable: true })
  contactPersons: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  }[];

  @Column('simple-json', { nullable: true })
  bankDetails: {
    accountNumber: string;
    bankName: string;
    branch: string;
    ifscCode: string;
  };

  @Column('simple-json', { nullable: true })
  preferences: Record<string, any>;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, user => user.organization)
  users: User[];

  @OneToMany(() => Tender, tender => tender.organization)
  tenders: Tender[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;
}