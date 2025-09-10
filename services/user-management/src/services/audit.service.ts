import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

export interface LogEntry {
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(entry: LogEntry): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        sessionId: entry.sessionId,
      });

      const savedLog = await this.auditLogRepository.save(auditLog);

      this.logger.log(
        `Audit: ${entry.action} on ${entry.resource}${entry.resourceId ? ` (${entry.resourceId})` : ''} by user ${entry.userId || 'system'}`,
      );

      return savedLog;
    } catch (error) {
      this.logger.error(
        `Failed to save audit log: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByUser(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByResource(
    resource: string,
    resourceId?: string,
    limit = 50,
  ): Promise<AuditLog[]> {
    const where: any = { resource };
    if (resourceId) {
      where.resourceId = resourceId;
    }

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  async findByAction(action: AuditAction, limit = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('audit.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getAuditSummary(userId?: string): Promise<{
    totalLogs: number;
    recentActions: { action: string; count: number }[];
    loginAttempts: number;
    failedLogins: number;
  }> {
    const baseQuery = this.auditLogRepository.createQueryBuilder('audit');

    if (userId) {
      baseQuery.where('audit.userId = :userId', { userId });
    }

    const totalLogs = await baseQuery.getCount();

    const recentActions = await baseQuery
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt > :date', {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const loginAttempts = await this.auditLogRepository.count({
      where: [
        { action: AuditAction.USER_LOGIN, ...(userId && { userId }) },
        { action: AuditAction.USER_LOGIN_FAILED, ...(userId && { userId }) },
      ],
    });

    const failedLogins = await this.auditLogRepository.count({
      where: {
        action: AuditAction.USER_LOGIN_FAILED,
        ...(userId && { userId }),
      },
    });

    return {
      totalLogs,
      recentActions: recentActions.map((item) => ({
        action: item.action,
        count: parseInt(item.count, 10),
      })),
      loginAttempts,
      failedLogins,
    };
  }
}
