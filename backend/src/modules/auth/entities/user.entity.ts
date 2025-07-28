import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { Role } from '../../../common/enums/role.enum';
import { Tender } from '../../tenders/entities/tender.entity';
import { Bid } from '../../bids/entities/bid.entity';
import { Contract } from '../../contracts/entities/contract.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { SecurityDeposit } from '../../security/entities/security-deposit.entity';
import { InsurancePolicy } from '../../security/entities/insurance-policy.entity';
import { BankGuarantee } from '../../security/entities/bank-guarantee.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  organizationName: string;

  @ManyToOne(() => Organization, organization => organization.users)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.BUYER,
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationTokenExpires: Date;

  @Column({ nullable: true })
  @Exclude()
  passwordResetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetTokenExpires: Date;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires: Date;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  @Column({ nullable: true })
  lastUserAgent: string;

  @Column('simple-array', { nullable: true })
  permissions: string[];

  @Column({ default: true })
  notificationsEnabled: boolean;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  smsNotifications: boolean;

  @Column('jsonb', { nullable: true })
  preferences: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Tender, tender => tender.createdBy)
  createdTenders: Tender[];

  @OneToMany(() => Bid, bid => bid.vendor)
  bids: Bid[];

  @OneToMany(() => Contract, contract => contract.buyer)
  buyerContracts: Contract[];

  @OneToMany(() => Contract, contract => contract.vendor)
  vendorContracts: Contract[];

  @OneToMany(() => Vendor, vendor => vendor.createdBy)
  vendorProfiles: Vendor[];

  @OneToMany(() => SecurityDeposit, deposit => deposit.createdBy)
  securityDeposits: SecurityDeposit[];

  @OneToMany(() => SecurityDeposit, deposit => deposit.refundedBy)
  refundedDeposits: SecurityDeposit[];

  @OneToMany(() => InsurancePolicy, policy => policy.createdBy)
  insurancePolicies: InsurancePolicy[];

  @OneToMany(() => BankGuarantee, guarantee => guarantee.createdBy)
  bankGuarantees: BankGuarantee[];

  @ManyToMany(() => Tender)
  @JoinTable({
    name: 'user_tender_favorites',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tenderId', referencedColumnName: 'id' },
  })
  favoriteTenders: Tender[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  isAccountLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  incrementLoginAttempts(): void {
    this.loginAttempts++;
    if (this.loginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockedUntil = null;
  }
}