import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditLogFilters {
  page: number;
  limit: number;
  entityType?: string;
  entityId?: string;
  action?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createAuditLog(data: {
    entityType: string;
    entityId: string;
    action: string;
    userId: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...data,
      timestamp: new Date(),
    });

    return this.auditLogRepository.save(auditLog);
  }

  async getAuditLogs(filters: AuditLogFilters) {
    const { page, limit, entityType, entityId, action, userId, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const query = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user');

    if (entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (action) {
      query.andWhere('audit.action = :action', { action });
    }

    if (userId) {
      query.andWhere('audit.userId = :userId', { userId });
    }

    if (startDate && endDate) {
      query.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const [logs, total] = await query
      .orderBy('audit.timestamp', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditLogById(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!auditLog) {
      throw new NotFoundException('Audit log not found');
    }

    return auditLog;
  }

  async getUserAuditTrail(
    userId: string,
    pagination: { page: number; limit: number },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { userId },
      order: { timestamp: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEntityAuditTrail(
    entityType: string,
    entityId: string,
    pagination: { page: number; limit: number },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { entityType, entityId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exportAuditLogs(options: {
    format: 'csv' | 'excel' | 'pdf';
    startDate?: Date;
    endDate?: Date;
    entityType?: string;
  }) {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user');

    if (options.entityType) {
      query.andWhere('audit.entityType = :entityType', {
        entityType: options.entityType,
      });
    }

    if (options.startDate && options.endDate) {
      query.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    }

    const logs = await query.orderBy('audit.timestamp', 'DESC').getMany();

    // Export implementation would depend on the specific libraries used
    return {
      message: 'Export functionality to be implemented',
      format: options.format,
      count: logs.length,
    };
  }

  async getAuditStatistics(period: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - period);

    const logs = await this.auditLogRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
    });

    // Group by action
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by entity type
    const entityTypeCounts = logs.reduce((acc, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by day
    const dailyCounts = logs.reduce((acc, log) => {
      const date = log.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      period,
      totalActions: logs.length,
      actionBreakdown: actionCounts,
      entityTypeBreakdown: entityTypeCounts,
      dailyActivity: Object.entries(dailyCounts).map(([date, count]) => ({
        date,
        count,
      })),
    };
  }

  async getSecurityEvents(filters: {
    page: number;
    limit: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }) {
    const { page, limit, severity } = filters;
    const skip = (page - 1) * limit;

    // Security-related actions
    const securityActions = [
      'login',
      'logout',
      'failed_login',
      'password_change',
      'permission_change',
      'role_change',
      'unauthorized_access',
    ];

    const query = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .where('audit.action IN (:...actions)', { actions: securityActions });

    if (severity) {
      // Map severity to specific actions
      const severityMap = {
        low: ['login', 'logout'],
        medium: ['password_change'],
        high: ['permission_change', 'role_change'],
        critical: ['failed_login', 'unauthorized_access'],
      };
      query.andWhere('audit.action IN (:...severityActions)', {
        severityActions: severityMap[severity],
      });
    }

    const [events, total] = await query
      .orderBy('audit.timestamp', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: events.map(event => ({
        ...event,
        severity: this.getEventSeverity(event.action),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  private getEventSeverity(action: string): string {
    const severityMap: Record<string, string> = {
      login: 'low',
      logout: 'low',
      password_change: 'medium',
      permission_change: 'high',
      role_change: 'high',
      failed_login: 'critical',
      unauthorized_access: 'critical',
    };
    return severityMap[action] || 'low';
  }

  async getComplianceReport(filters: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (filters.startDate && filters.endDate) {
      query.where('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const logs = await query.getMany();

    // Compliance metrics
    const userActivityCount = logs.filter(log => 
      ['create', 'update', 'delete'].includes(log.action)
    ).length;

    const securityEventCount = logs.filter(log =>
      ['login', 'logout', 'failed_login', 'password_change'].includes(log.action)
    ).length;

    const dataAccessCount = logs.filter(log =>
      log.action === 'view' || log.action === 'export'
    ).length;

    // Group by user for activity analysis
    const userActivity = logs.reduce((acc, log) => {
      if (!acc[log.userId]) {
        acc[log.userId] = {
          userId: log.userId,
          actions: 0,
          lastActivity: log.timestamp,
        };
      }
      acc[log.userId].actions++;
      if (log.timestamp > acc[log.userId].lastActivity) {
        acc[log.userId].lastActivity = log.timestamp;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      period: {
        start: filters.startDate,
        end: filters.endDate,
      },
      summary: {
        totalEvents: logs.length,
        userActivityCount,
        securityEventCount,
        dataAccessCount,
        uniqueUsers: Object.keys(userActivity).length,
      },
      userActivity: Object.values(userActivity),
      complianceScore: this.calculateComplianceScore(logs),
    };
  }

  private calculateComplianceScore(logs: AuditLog[]): number {
    // Simple compliance score calculation
    // In a real implementation, this would be more sophisticated
    const factors = {
      hasAuditLogs: logs.length > 0 ? 20 : 0,
      regularActivity: logs.length > 100 ? 20 : logs.length / 5,
      securityEvents: logs.filter(l => 
        ['login', 'logout'].includes(l.action)
      ).length > 0 ? 20 : 0,
      dataTracking: logs.filter(l => 
        ['create', 'update', 'delete'].includes(l.action)
      ).length > 0 ? 20 : 0,
      recentActivity: logs.some(l => 
        l.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ) ? 20 : 0,
    };

    return Object.values(factors).reduce((sum, score) => sum + score, 0);
  }
}