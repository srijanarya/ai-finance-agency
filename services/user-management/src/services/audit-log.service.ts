import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, In } from 'typeorm';
import {
  AuditLog,
  AuditAction,
  AuditLevel,
  AuditStatus,
} from '../entities/audit-log.entity';
import { User } from '../entities/user.entity';

export interface AuditLogQuery {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  level?: AuditLevel;
  status?: AuditStatus;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  sessionId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'action' | 'level';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogStats {
  totalLogs: number;
  byAction: Record<string, number>;
  byLevel: Record<string, number>;
  byStatus: Record<string, number>;
  recentActivity: AuditLog[];
  criticalEvents: AuditLog[];
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(query: AuditLogQuery = {}): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      userId,
      action,
      resource,
      level,
      status,
      startDate,
      endDate,
      ipAddress,
      sessionId,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user');

    // Apply filters
    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (resource) {
      queryBuilder.andWhere('audit.resource ILIKE :resource', {
        resource: `%${resource}%`,
      });
    }

    if (level) {
      queryBuilder.andWhere('audit.level = :level', { level });
    }

    if (status) {
      queryBuilder.andWhere('audit.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    if (ipAddress) {
      queryBuilder.andWhere('audit.ipAddress = :ipAddress', { ipAddress });
    }

    if (sessionId) {
      queryBuilder.andWhere('audit.sessionId = :sessionId', { sessionId });
    }

    // Apply sorting
    queryBuilder.orderBy(
      `audit.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return log;
  }

  async findByUser(
    userId: string,
    options: Partial<AuditLogQuery> = {},
  ): Promise<AuditLog[]> {
    const result = await this.findAll({ ...options, userId });
    return result.logs;
  }

  async findSecurityEvents(
    userId?: string,
    days: number = 30,
  ): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const securityActions = AuditLog.getSecurityActions();

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .where('audit.action IN (:...actions)', { actions: securityActions })
      .andWhere('audit.createdAt >= :startDate', { startDate })
      .orderBy('audit.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  async findCriticalEvents(days: number = 7): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.auditLogRepository.find({
      where: {
        level: AuditLevel.CRITICAL,
        createdAt: Between(startDate, new Date()),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findFailedEvents(days: number = 7): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.auditLogRepository.find({
      where: {
        status: AuditStatus.FAILURE,
        createdAt: Between(startDate, new Date()),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getStats(days: number = 30): Promise<AuditLogStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalLogs, recentActivity, criticalEvents] = await Promise.all([
      this.auditLogRepository.count({
        where: { createdAt: Between(startDate, new Date()) },
      }),
      this.auditLogRepository.find({
        where: { createdAt: Between(startDate, new Date()) },
        order: { createdAt: 'DESC' },
        take: 10,
        relations: ['user'],
      }),
      this.findCriticalEvents(days),
    ]);

    // Get action distribution
    const actionQuery = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt >= :startDate', { startDate })
      .groupBy('audit.action')
      .getRawMany();

    const byAction = actionQuery.reduce(
      (acc, row) => {
        acc[row.action] = parseInt(row.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get level distribution
    const levelQuery = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt >= :startDate', { startDate })
      .groupBy('audit.level')
      .getRawMany();

    const byLevel = levelQuery.reduce(
      (acc, row) => {
        acc[row.level] = parseInt(row.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get status distribution
    const statusQuery = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt >= :startDate', { startDate })
      .groupBy('audit.status')
      .getRawMany();

    const byStatus = statusQuery.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalLogs,
      byAction,
      byLevel,
      byStatus,
      recentActivity,
      criticalEvents,
    };
  }

  async getUserActivitySummary(
    userId: string,
    days: number = 30,
  ): Promise<{
    totalActions: number;
    lastActivity: Date | null;
    actionBreakdown: Record<string, number>;
    securityEvents: number;
    failedActions: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalActions,
      lastActivityResult,
      actionBreakdown,
      securityEvents,
      failedActions,
    ] = await Promise.all([
      this.auditLogRepository.count({
        where: {
          userId,
          createdAt: Between(startDate, new Date()),
        },
      }),
      this.auditLogRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
        select: ['createdAt'],
      }),
      this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .where('audit.userId = :userId', { userId })
        .andWhere('audit.createdAt >= :startDate', { startDate })
        .groupBy('audit.action')
        .getRawMany(),
      this.auditLogRepository.count({
        where: {
          userId,
          action: In(AuditLog.getSecurityActions()),
          createdAt: Between(startDate, new Date()),
        },
      }),
      this.auditLogRepository.count({
        where: {
          userId,
          status: AuditStatus.FAILURE,
          createdAt: Between(startDate, new Date()),
        },
      }),
    ]);

    const actionBreakdownObj = actionBreakdown.reduce(
      (acc, row) => {
        acc[row.action] = parseInt(row.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalActions,
      lastActivity: lastActivityResult?.createdAt || null,
      actionBreakdown: actionBreakdownObj,
      securityEvents,
      failedActions,
    };
  }

  async findSuspiciousActivity(days: number = 7): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Find users with high numbers of failed login attempts
    const suspiciousUsers = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('audit.action = :action', {
        action: AuditAction.USER_LOGIN_FAILED,
      })
      .andWhere('audit.createdAt >= :startDate', { startDate })
      .groupBy('audit.userId')
      .having('COUNT(*) > :threshold', { threshold: 5 })
      .getRawMany();

    if (suspiciousUsers.length === 0) {
      return [];
    }

    const userIds = suspiciousUsers.map((user) => user.userId);

    return this.auditLogRepository.find({
      where: {
        userId: In(userIds),
        createdAt: Between(startDate, new Date()),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Only delete non-critical logs that are older than the cutoff
    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('level != :criticalLevel', {
        criticalLevel: AuditLevel.CRITICAL,
      })
      .execute();

    return result.affected || 0;
  }

  async exportLogs(
    query: AuditLogQuery,
    format: 'csv' | 'json' = 'json',
  ): Promise<string> {
    const { logs } = await this.findAll({ ...query, limit: 10000 }); // Max 10k for export

    if (format === 'csv') {
      return this.convertToCsv(logs);
    } else {
      return JSON.stringify(logs, null, 2);
    }
  }

  private convertToCsv(logs: AuditLog[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'ID',
      'User ID',
      'User Email',
      'Action',
      'Resource',
      'Level',
      'Status',
      'IP Address',
      'Session ID',
      'Created At',
      'Description',
    ];

    const rows = logs.map((log) => [
      log.id,
      log.userId || '',
      log.user?.email || '',
      log.action,
      log.resource,
      log.level,
      log.status,
      log.ipAddress || '',
      log.sessionId || '',
      log.createdAt.toISOString(),
      log.description || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
