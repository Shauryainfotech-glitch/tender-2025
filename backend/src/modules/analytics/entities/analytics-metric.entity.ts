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
import { User } from '../../auth/entities/user.entity';

export enum MetricType {
  COUNT = 'count',
  SUM = 'sum',
  AVERAGE = 'average',
  PERCENTAGE = 'percentage',
  RATIO = 'ratio',
  CUSTOM = 'custom',
}

export enum MetricCategory {
  TENDER = 'tender',
  BID = 'bid',
  ORGANIZATION = 'organization',
  USER = 'user',
  FINANCIAL = 'financial',
  PERFORMANCE = 'performance',
  COMPLIANCE = 'compliance',
}

export enum AggregationPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

@Entity('analytics_metrics')
@Index(['metricName', 'entityType', 'entityId'])
@Index(['organizationId', 'category', 'recordedAt'])
@Index(['recordedAt'])
export class AnalyticsMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  metricName: string;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  type: MetricType;

  @Column({
    type: 'enum',
    enum: MetricCategory,
  })
  category: MetricCategory;

  @Column('decimal', { precision: 20, scale: 4 })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({
    type: 'enum',
    enum: AggregationPeriod,
    nullable: true,
  })
  aggregationPeriod: AggregationPeriod;

  @Column({ type: 'timestamp' })
  recordedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  periodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  periodEnd: Date;

  @Column('simple-json', { nullable: true })
  dimensions: Record<string, any>;

  @Column('simple-json', { nullable: true })
  tags: string[];

  @Column('text', { nullable: true })
  description: string;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get formattedValue(): string {
    if (this.type === MetricType.PERCENTAGE) {
      return `${this.value}%`;
    }
    if (this.unit) {
      return `${this.value} ${this.unit}`;
    }
    return this.value.toString();
  }
}
