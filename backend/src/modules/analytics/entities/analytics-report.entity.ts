import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReportType {
  DASHBOARD = 'dashboard',
  STATISTICAL = 'statistical',
  COMPARATIVE = 'comparative',
  TREND = 'trend',
  CUSTOM = 'custom',
}

@Entity('analytics_reports')
export class AnalyticsReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column()
  description: string;

  @Column('text')
  query: string;

  @Column('simple-json')
  visualizationOptions: Record<string, any>;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  executionDurationSeconds: number;

  @Column({ default: false })
  isActive: boolean;

  @Column('simple-json', { nullable: true })
  filters: Record<string, any>;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
