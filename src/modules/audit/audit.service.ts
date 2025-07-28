import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AuditLog, AuditAction, AuditModule } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditQueryDto } from './dto/audit-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create(createAuditLogDto);
      
      // Calculate changes if both old and new values are provided
      if (createAuditLogDto.oldValue && createAuditLogDto.newValue) {
        auditLog.changes = this.calculateChanges(
          createAuditLogDto.oldValue,
          createAuditLogDto.newValue,
        );
      }

      // Parse user agent for browser and OS info
      if (createAuditLogDto.userAgent) {
        const agentInfo = this.parseUserAgent(createAuditLogDto.userAgent);
        auditLog.browserInfo = agentInfo.browser;
        auditLog.osInfo = agentInfo.os;
        auditLog.deviceType = agentInfo.deviceType;
      }

      return await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  async findAll(query: AuditQueryDto): Promise<PaginatedResult<AuditLog>> {
    const {
      page = 1,
      limit = 10,
      module,
      action,
      userId,
      organizationId,
      entityType,
      entityId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    // Apply filters
    if (module) {
      queryBuilder.andWhere('audit.module = :module', { module });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (organizationId) {
      queryBuilder.andWhere('audit.organizationId = :organizationId', {
        organizationId,
      });
    }

    if (entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`audit.${sortBy}`, sortOrder);

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByEntity(
    entityType: string,
    entityId: number,
  ): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: {
        entityType,
        entityId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findUserActivity(
    userId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLog[]> {
    const whereConditions: any = { userId };

    if (startDate && endDate) {
      whereConditions.createdAt = Between(startDate, endDate);
    }

    return await this.auditLogRepository.find({
      where: whereConditions,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getActivitySummary(
    organizationId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (organizationId) {
      queryBuilder.where('audit.organizationId = :organizationId', {
        organizationId,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Get activity by module
    const moduleActivity = await queryBuilder
      .select('audit.module', 'module')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.module')
      .getRawMany();

    // Get activity by action
    const actionActivity = await queryBuilder
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    // Get top users by activity
    const userActivity = await queryBuilder
      .select('audit.userId', 'userId')
      .addSelect('audit.userName', 'userName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.userId, audit.userName')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Get activity over time
    const timeSeriesActivity = await queryBuilder
      .select("DATE_TRUNC('day', audit.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      moduleActivity,
      actionActivity,
      userActivity,
      timeSeriesActivity,
    };
  }

  async getSecurityEvents(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLog[]> {
    const securityActions = [
      AuditAction.LOGIN,
      AuditAction.LOGOUT,
      AuditAction.DELETE,
      AuditAction.APPROVE,
      AuditAction.REJECT,
    ];

    const whereConditions: any = {
      action: In(securityActions),
    };

    if (startDate && endDate) {
      whereConditions.createdAt = Between(startDate, endDate);
    }

    return await this.auditLogRepository.find({
      where: whereConditions,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getSensitiveDataAccess(
    organizationId?: number,
  ): Promise<AuditLog[]> {
    const whereConditions: any = {
      isSensitive: true,
    };

    if (organizationId) {
      whereConditions.organizationId = organizationId;
    }

    return await this.auditLogRepository.find({
      where: whereConditions,
      order: {
        createdAt: 'DESC',
      },
      take: 100, // Limit to recent 100 records
    });
  }

  async cleanupOldLogs(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('isSensitive = :isSensitive', { isSensitive: false })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} old audit logs`);
    return result.affected || 0;
  }

  private calculateChanges(
    oldValue: Record<string, any>,
    newValue: Record<string, any>,
  ): Record<string, any> {
    const changes: Record<string, any> = {};

    // Find changed fields
    for (const key in newValue) {
      if (oldValue[key] !== newValue[key]) {
        changes[key] = {
          old: oldValue[key],
          new: newValue[key],
        };
      }
    }

    // Find deleted fields
    for (const key in oldValue) {
      if (!(key in newValue)) {
        changes[key] = {
          old: oldValue[key],
          new: null,
        };
      }
    }

    return changes;
  }

  private parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    deviceType: string;
  } {
    // Simple user agent parsing - in production, use a library like 'useragent'
    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceType = 'Desktop';

    // Detect browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Detect device type
    if (userAgent.includes('Mobile')) deviceType = 'Mobile';
    else if (userAgent.includes('Tablet')) deviceType = 'Tablet';

    return { browser, os, deviceType };
  }
}
