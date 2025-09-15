import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, In, LessThan, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import * as geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { User } from '../entities/user.entity';
import { UserSession, SessionStatus, DeviceType } from '../entities/user-session.entity';
import {
  CreateSessionDto,
  UpdateSessionDto,
  RevokeSessionDto,
  RevokeAllSessionsDto,
  ExtendSessionDto,
  SessionFilterDto,
  SessionResponseDto,
  SessionStatsDto,
  DeviceInfoDto,
  SessionAnalyticsDto,
  SessionSecurityDto,
} from '../dto/session.dto';
import { AuditService } from './audit.service';
import { AuditAction } from '../entities/audit-log.entity';
import { NotificationService } from './notification.service';

interface SessionValidationResult {
  isValid: boolean;
  reason?: string;
  riskScore: number;
  flags: string[];
}

interface DeviceFingerprint {
  id: string;
  name: string;
  type: DeviceType;
  userAgent: string;
  fingerprint: string;
}

interface LocationInfo {
  country?: string;
  city?: string;
  timezone?: string;
  coordinates?: { lat: number; lon: number };
}

interface SecurityAnalysis {
  riskScore: number;
  anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    confidence: number;
  }>;
  recommendations: Array<{
    action: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly defaultSessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly maxSessionsPerUser = 10; // Maximum concurrent sessions per user
  private readonly suspiciousActivityThreshold = 0.7; // Risk score threshold

  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new user session
   */
  async createSession(
    userId: string,
    refreshToken: string,
    sessionData: CreateSessionDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SessionResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Clean up expired sessions first
    await this.cleanupExpiredSessions(userId);

    // Check session limits
    await this.enforceSessionLimits(userId);

    // Parse device information
    const deviceInfo = this.parseDeviceInfo(userAgent || sessionData.userAgent);
    const locationInfo = this.parseLocationInfo(ipAddress || sessionData.ipAddress);

    // Generate device fingerprint
    const fingerprint = this.generateDeviceFingerprint({
      id: sessionData.deviceId || deviceInfo.id,
      name: sessionData.deviceName || deviceInfo.name,
      type: sessionData.deviceType || deviceInfo.type,
      userAgent: userAgent || sessionData.userAgent || '',
      fingerprint: '',
    });

    // Calculate expiration time
    const expiresAt = sessionData.expiresAt 
      ? new Date(sessionData.expiresAt)
      : new Date(Date.now() + this.defaultSessionDuration);

    // Create session entity
    const session = this.sessionRepository.create({
      userId,
      refreshToken,
      deviceId: sessionData.deviceId || deviceInfo.id,
      deviceName: sessionData.deviceName || deviceInfo.name,
      deviceType: sessionData.deviceType || deviceInfo.type,
      deviceFingerprint: fingerprint.fingerprint,
      userAgent: userAgent || sessionData.userAgent,
      ipAddress: ipAddress || sessionData.ipAddress,
      country: sessionData.country || locationInfo.country,
      city: sessionData.city || locationInfo.city,
      timezone: sessionData.timezone || locationInfo.timezone,
      loginMethod: sessionData.loginMethod || 'password',
      isTrustedDevice: sessionData.isTrustedDevice || false,
      expiresAt,
      status: SessionStatus.ACTIVE,
      isActive: true,
      accessCount: 0,
      securityMetadata: sessionData.securityMetadata || {},
      lastAccessedAt: new Date(),
      lastActivityAt: new Date(),
    });

    // Perform security analysis
    const securityAnalysis = await this.analyzeSessionSecurity(session, user);
    session.riskScore = securityAnalysis.riskScore;

    // Set flags based on analysis
    if (securityAnalysis.anomalies.length > 0) {
      session.flags = securityAnalysis.anomalies.map(a => a.type);
      if (securityAnalysis.riskScore > this.suspiciousActivityThreshold) {
        session.status = SessionStatus.SUSPICIOUS;
        session.addFlag('high_risk');
      }
    }

    const savedSession = await this.sessionRepository.save(session);

    // Log session creation
    await this.auditLogService.log({
      userId,
      action: AuditAction.SESSION_CREATED,
      resource: 'user_session',
      description: 'New session created',
      ipAddress,
      userAgent,
      metadata: {
        sessionId: savedSession.id,
        deviceType: savedSession.deviceType,
        riskScore: savedSession.riskScore,
        location: `${savedSession.country}, ${savedSession.city}`,
      },
    });

    // Send security notification if suspicious
    if (savedSession.status === SessionStatus.SUSPICIOUS) {
      await this.sendSecurityAlert(user, savedSession, securityAnalysis);
    }

    // Emit session created event
    this.eventEmitter.emit('session.created', {
      sessionId: savedSession.id,
      userId,
      deviceInfo: deviceInfo,
      locationInfo,
      riskScore: savedSession.riskScore,
      timestamp: new Date(),
    });

    return this.mapToResponseDto(savedSession);
  }

  /**
   * Get user sessions with filtering
   */
  async getUserSessions(
    userId: string,
    filter: SessionFilterDto,
  ): Promise<{ sessions: SessionResponseDto[]; total: number; page: number; limit: number }> {
    const page = filter.page || 1;
    const limit = Math.min(filter.limit || 50, 100);
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };

    // Apply filters
    if (filter.status) whereClause.status = filter.status;
    if (filter.deviceType) whereClause.deviceType = filter.deviceType;
    if (filter.isActive !== undefined) whereClause.isActive = filter.isActive;
    if (filter.isTrustedDevice !== undefined) whereClause.isTrustedDevice = filter.isTrustedDevice;
    if (filter.country) whereClause.country = filter.country;
    if (filter.ipAddress) whereClause.ipAddress = filter.ipAddress;

    // Date range filtering
    if (filter.createdAfter || filter.createdBefore) {
      whereClause.createdAt = {};
      if (filter.createdAfter) {
        whereClause.createdAt = MoreThan(new Date(filter.createdAfter));
      }
      if (filter.createdBefore) {
        whereClause.createdAt = LessThan(new Date(filter.createdBefore));
      }
    }

    const findOptions: FindManyOptions<UserSession> = {
      where: whereClause,
      order: { lastActivityAt: 'DESC' },
      skip,
      take: limit,
    };

    const [sessions, total] = await this.sessionRepository.findAndCount(findOptions);

    return {
      sessions: sessions.map(session => this.mapToResponseDto(session)),
      total,
      page,
      limit,
    };
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string, userId?: string): Promise<SessionResponseDto> {
    const whereClause: any = { id: sessionId };
    if (userId) whereClause.userId = userId;

    const session = await this.sessionRepository.findOne({ where: whereClause });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.mapToResponseDto(session);
  }

  /**
   * Update session
   */
  async updateSession(
    sessionId: string,
    updateData: UpdateSessionDto,
    updatedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if user can update this session
    if (session.userId !== updatedBy) {
      const updater = await this.userRepository.findOne({
        where: { id: updatedBy },
        relations: ['roles'],
      });

      if (!updater?.hasRole('admin') && !updater?.hasRole('super_admin')) {
        throw new ForbiddenException('Cannot update sessions of other users');
      }
    }

    // Apply updates
    Object.assign(session, updateData);
    session.updatedAt = new Date();

    const updatedSession = await this.sessionRepository.save(session);

    // Log the update
    await this.auditLogService.log({
      userId: updatedBy,
      action: AuditAction.SESSION_REFRESHED,
      resource: 'user_session',
      description: 'Session updated',
      ipAddress,
      userAgent,
      metadata: {
        sessionId,
        updates: Object.keys(updateData),
      },
    });

    // Emit session updated event
    this.eventEmitter.emit('session.updated', {
      sessionId,
      userId: session.userId,
      updates: updateData,
      updatedBy,
      timestamp: new Date(),
    });

    return this.mapToResponseDto(updatedSession);
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(
    sessionId: string,
    revokeData: RevokeSessionDto,
    revokedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if user can revoke this session
    if (session.userId !== revokedBy) {
      const revoker = await this.userRepository.findOne({
        where: { id: revokedBy },
        relations: ['roles'],
      });

      if (!revoker?.hasRole('admin') && !revoker?.hasRole('super_admin')) {
        throw new ForbiddenException('Cannot revoke sessions of other users');
      }
    }

    // Check if session is already revoked
    if (!session.isActive && !revokeData.force) {
      return {
        success: false,
        message: 'Session is already inactive',
      };
    }

    // Revoke the session
    session.revoke(revokedBy, revokeData.reason);
    await this.sessionRepository.save(session);

    // Log the revocation
    await this.auditLogService.log({
      userId: revokedBy,
      action: AuditAction.SESSION_REVOKED,
      resource: 'user_session',
      description: 'Session revoked',
      ipAddress,
      userAgent,
      metadata: {
        sessionId,
        targetUserId: session.userId,
        reason: revokeData.reason,
        force: revokeData.force,
      },
    });

    // Emit session revoked event
    this.eventEmitter.emit('session.revoked', {
      sessionId,
      userId: session.userId,
      reason: revokeData.reason,
      revokedBy,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Session revoked successfully',
    };
  }

  /**
   * Revoke all user sessions
   */
  async revokeAllSessions(
    userId: string,
    revokeData: RevokeAllSessionsDto,
    revokedBy: string,
    currentSessionId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string; revokedCount: number }> {
    // Verify password if provided
    if (revokeData.password) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !(await user.validatePassword(revokeData.password))) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    // Get all active sessions
    const whereClause: any = { userId, isActive: true };
    
    // Keep current session if requested
    if (revokeData.keepCurrent && currentSessionId) {
      whereClause.id = { $ne: currentSessionId };
    }

    const sessions = await this.sessionRepository.find({ where: whereClause });

    let revokedCount = 0;
    for (const session of sessions) {
      session.revoke(revokedBy, revokeData.reason);
      revokedCount++;
    }

    if (revokedCount > 0) {
      await this.sessionRepository.save(sessions);
    }

    // Log the mass revocation
    await this.auditLogService.log({
      userId: revokedBy,
      action: AuditAction.ALL_OTHER_SESSIONS_TERMINATED,
      resource: 'user_session',
      description: 'All sessions revoked',
      ipAddress,
      userAgent,
      metadata: {
        targetUserId: userId,
        reason: revokeData.reason,
        revokedCount,
        keepCurrent: revokeData.keepCurrent,
        currentSessionId,
      },
    });

    // Emit mass revocation event
    this.eventEmitter.emit('sessions.revoked.all', {
      userId,
      reason: revokeData.reason,
      revokedBy,
      revokedCount,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: `${revokedCount} sessions revoked successfully`,
      revokedCount,
    };
  }

  /**
   * Extend session expiration
   */
  async extendSession(
    sessionId: string,
    extendData: ExtendSessionDto,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.isValid) {
      throw new BadRequestException('Cannot extend invalid session');
    }

    // Calculate new expiration time
    let newExpiresAt: Date;
    if (extendData.expiresAt) {
      newExpiresAt = new Date(extendData.expiresAt);
    } else {
      const hoursToExtend = extendData.hours || 24; // Default 24 hours
      newExpiresAt = new Date(Date.now() + hoursToExtend * 60 * 60 * 1000);
    }

    // Validate new expiration time
    const maxExtension = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Max 30 days
    if (newExpiresAt > maxExtension) {
      throw new BadRequestException('Session extension exceeds maximum allowed duration');
    }

    session.expiresAt = newExpiresAt;
    session.lastActivityAt = new Date();
    
    const updatedSession = await this.sessionRepository.save(session);

    // Log the extension
    await this.auditLogService.log({
      userId,
      action: AuditAction.SESSION_REFRESHED,
      resource: 'user_session',
      description: 'Session expiration extended',
      ipAddress,
      userAgent,
      metadata: {
        sessionId,
        newExpiresAt: newExpiresAt.toISOString(),
        extensionHours: extendData.hours,
      },
    });

    return this.mapToResponseDto(updatedSession);
  }

  /**
   * Get session statistics for a user
   */
  async getSessionStats(userId: string): Promise<SessionStatsDto> {
    const sessions = await this.sessionRepository.find({ where: { userId } });

    const stats: SessionStatsDto = {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.isActive).length,
      expiredSessions: sessions.filter(s => s.isExpired).length,
      revokedSessions: sessions.filter(s => s.status === SessionStatus.REVOKED).length,
      suspiciousSessions: sessions.filter(s => s.isSuspicious).length,
      sessionsByDeviceType: {} as Record<DeviceType, number>,
      sessionsByCountry: {},
      sessionsByLoginMethod: {},
      averageSessionDuration: 0,
      securityAlerts: 0,
    };

    // Calculate statistics
    const deviceTypes = Object.values(DeviceType);
    deviceTypes.forEach(type => {
      stats.sessionsByDeviceType[type] = sessions.filter(s => s.deviceType === type).length;
    });

    // Group by country
    sessions.forEach(session => {
      if (session.country) {
        stats.sessionsByCountry[session.country] = 
          (stats.sessionsByCountry[session.country] || 0) + 1;
      }
    });

    // Group by login method
    sessions.forEach(session => {
      if (session.loginMethod) {
        stats.sessionsByLoginMethod[session.loginMethod] = 
          (stats.sessionsByLoginMethod[session.loginMethod] || 0) + 1;
      }
    });

    // Calculate average session duration
    const completedSessions = sessions.filter(s => !s.isActive);
    if (completedSessions.length > 0) {
      const totalDuration = completedSessions.reduce((sum, session) => {
        const duration = (session.revokedAt || new Date()).getTime() - session.createdAt.getTime();
        return sum + duration;
      }, 0);
      stats.averageSessionDuration = totalDuration / completedSessions.length / (1000 * 60 * 60); // in hours
    }

    // Get last activity
    const lastActiveSession = sessions
      .filter(s => s.lastActivityAt)
      .sort((a, b) => b.lastActivityAt!.getTime() - a.lastActivityAt!.getTime())[0];
    
    if (lastActiveSession) {
      stats.lastActivity = lastActiveSession.lastActivityAt!;
    }

    // Count security alerts
    stats.securityAlerts = sessions.filter(s => 
      s.flags?.some(flag => ['suspicious', 'high_risk', 'anomaly'].includes(flag))
    ).length;

    return stats;
  }

  /**
   * Get user devices information
   */
  async getUserDevices(userId: string): Promise<DeviceInfoDto[]> {
    const sessions = await this.sessionRepository.find({
      where: { userId },
      order: { lastActivityAt: 'DESC' },
    });

    const deviceMap = new Map<string, DeviceInfoDto>();

    sessions.forEach(session => {
      const deviceKey = session.deviceFingerprint || session.deviceId || 'unknown';
      
      if (!deviceMap.has(deviceKey)) {
        deviceMap.set(deviceKey, {
          deviceId: session.deviceId || deviceKey,
          deviceName: session.deviceName || 'Unknown Device',
          deviceType: session.deviceType,
          fingerprint: session.deviceFingerprint || '',
          isTrusted: session.isTrustedDevice,
          firstSeen: session.createdAt,
          lastSeen: session.lastActivityAt || session.createdAt,
          sessionCount: 1,
          locations: [],
          isActive: session.isActive,
          riskScore: session.riskScore,
          flags: session.flags,
        });
      } else {
        const device = deviceMap.get(deviceKey)!;
        device.sessionCount++;
        if (session.lastActivityAt && session.lastActivityAt > device.lastSeen) {
          device.lastSeen = session.lastActivityAt;
        }
        if (session.createdAt < device.firstSeen) {
          device.firstSeen = session.createdAt;
        }
        if (session.isActive) {
          device.isActive = true;
        }
      }

      // Add location if not already present
      const device = deviceMap.get(deviceKey)!;
      const locationExists = device.locations.some(loc => 
        loc.country === session.country && 
        loc.city === session.city && 
        loc.ipAddress === session.ipAddress
      );

      if (!locationExists && (session.country || session.city || session.ipAddress)) {
        device.locations.push({
          country: session.country,
          city: session.city,
          ipAddress: session.ipAddress,
          lastSeen: session.lastActivityAt || session.createdAt,
        });
      }
    });

    return Array.from(deviceMap.values());
  }

  /**
   * Validate session and update activity
   */
  async validateAndUpdateSession(
    sessionId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SessionValidationResult> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, refreshToken },
    });

    if (!session) {
      return {
        isValid: false,
        reason: 'Session not found',
        riskScore: 1.0,
        flags: ['invalid_session'],
      };
    }

    // Check if session is valid
    if (!session.isValid) {
      return {
        isValid: false,
        reason: session.isExpired ? 'Session expired' : 'Session revoked',
        riskScore: session.riskScore || 0.5,
        flags: session.flags || [],
      };
    }

    // Update session activity
    session.updateLastAccessed();
    session.lastActivityAt = new Date();

    // Detect location changes
    if (ipAddress && session.ipAddress !== ipAddress) {
      const newLocation = this.parseLocationInfo(ipAddress);
      if (newLocation.country && newLocation.country !== session.country) {
        session.addFlag('location_change');
        // Increase risk score for location changes
        session.riskScore = Math.min((session.riskScore || 0) + 0.2, 1.0);
      }
    }

    // Detect user agent changes
    if (userAgent && session.userAgent !== userAgent) {
      session.addFlag('user_agent_change');
      session.riskScore = Math.min((session.riskScore || 0) + 0.1, 1.0);
    }

    await this.sessionRepository.save(session);

    return {
      isValid: true,
      riskScore: session.riskScore || 0,
      flags: session.flags || [],
    };
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(userId?: string): Promise<number> {
    const whereClause: any = {
      expiresAt: LessThan(new Date()),
      isActive: true,
    };

    if (userId) {
      whereClause.userId = userId;
    }

    const expiredSessions = await this.sessionRepository.find({ where: whereClause });

    for (const session of expiredSessions) {
      session.markAsExpired();
    }

    if (expiredSessions.length > 0) {
      await this.sessionRepository.save(expiredSessions);
    }

    return expiredSessions.length;
  }

  // Private helper methods

  private parseDeviceInfo(userAgent?: string): DeviceFingerprint {
    if (!userAgent) {
      return {
        id: crypto.randomUUID(),
        name: 'Unknown Device',
        type: DeviceType.UNKNOWN,
        userAgent: '',
        fingerprint: '',
      };
    }

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let deviceType = DeviceType.DESKTOP;
    if (result.device.type === 'mobile') deviceType = DeviceType.MOBILE;
    else if (result.device.type === 'tablet') deviceType = DeviceType.TABLET;
    else if (userAgent.toLowerCase().includes('api')) deviceType = DeviceType.API;

    const deviceName = result.device.model 
      ? `${result.device.vendor} ${result.device.model}`.trim()
      : `${result.browser.name} on ${result.os.name}`.trim() || 'Unknown Device';

    return {
      id: crypto.randomUUID(),
      name: deviceName,
      type: deviceType,
      userAgent,
      fingerprint: '',
    };
  }

  private parseLocationInfo(ipAddress?: string): LocationInfo {
    if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1') {
      return {};
    }

    try {
      const geo = geoip.lookup(ipAddress);
      if (geo) {
        return {
          country: geo.country,
          city: geo.city,
          timezone: geo.timezone,
          coordinates: { lat: geo.ll[0], lon: geo.ll[1] },
        };
      }
    } catch (error) {
      this.logger.warn(`Failed to parse location for IP ${ipAddress}: ${error.message}`);
    }

    return {};
  }

  private generateDeviceFingerprint(device: DeviceFingerprint): DeviceFingerprint {
    const components = [
      device.userAgent,
      device.type,
      device.name,
      // Additional fingerprinting components could be added here
    ].filter(Boolean);

    device.fingerprint = crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex')
      .substring(0, 32);

    return device;
  }

  private async enforceSessionLimits(userId: string): Promise<void> {
    const activeSessions = await this.sessionRepository.count({
      where: { userId, isActive: true },
    });

    if (activeSessions >= this.maxSessionsPerUser) {
      // Remove oldest sessions
      const oldestSessions = await this.sessionRepository.find({
        where: { userId, isActive: true },
        order: { lastActivityAt: 'ASC' },
        take: activeSessions - this.maxSessionsPerUser + 1,
      });

      for (const session of oldestSessions) {
        session.revoke('system', 'Session limit exceeded');
      }

      await this.sessionRepository.save(oldestSessions);
    }
  }

  private async analyzeSessionSecurity(
    session: UserSession,
    user: User,
  ): Promise<SecurityAnalysis> {
    const analysis: SecurityAnalysis = {
      riskScore: 0,
      anomalies: [],
      recommendations: [],
    };

    // Check for unusual login times
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      analysis.anomalies.push({
        type: 'unusual_time',
        severity: 'low',
        description: 'Login outside normal hours',
        confidence: 0.6,
      });
      analysis.riskScore += 0.1;
    }

    // Check for new location
    const recentSessions = await this.sessionRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const knownCountries = new Set(recentSessions.map(s => s.country).filter(Boolean));
    if (session.country && !knownCountries.has(session.country)) {
      analysis.anomalies.push({
        type: 'new_location',
        severity: 'medium',
        description: `Login from new country: ${session.country}`,
        confidence: 0.8,
      });
      analysis.riskScore += 0.3;
    }

    // Check for new device
    const knownDevices = new Set(recentSessions.map(s => s.deviceFingerprint).filter(Boolean));
    if (session.deviceFingerprint && !knownDevices.has(session.deviceFingerprint)) {
      analysis.anomalies.push({
        type: 'new_device',
        severity: 'high',
        description: 'Login from unrecognized device',
        confidence: 0.9,
      });
      analysis.riskScore += 0.4;
    }

    // Add recommendations based on risk score
    if (analysis.riskScore > 0.5) {
      analysis.recommendations.push({
        action: 'enable_2fa',
        reason: 'High risk activity detected',
        priority: 'high',
      });
    }

    if (analysis.anomalies.some(a => a.type === 'new_device')) {
      analysis.recommendations.push({
        action: 'verify_device',
        reason: 'New device detected',
        priority: 'medium',
      });
    }

    return analysis;
  }

  private async sendSecurityAlert(
    user: User,
    session: UserSession,
    analysis: SecurityAnalysis,
  ): Promise<void> {
    const alert = {
      type: 'security_alert',
      severity: 'medium' as const,
      title: 'Suspicious login activity detected',
      message: `A new login was detected from ${session.country || 'unknown location'} using ${session.deviceType} device.`,
      details: {
        location: `${session.country}, ${session.city}`,
        device: session.deviceName,
        ipAddress: session.ipAddress,
        timestamp: session.createdAt,
        riskScore: session.riskScore,
        anomalies: analysis.anomalies,
      },
    };

    await this.notificationService.sendSecurityAlert(user.email, alert);
  }

  private mapToResponseDto(session: UserSession): SessionResponseDto {
    return {
      id: session.id,
      userId: session.userId,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      deviceFingerprint: session.deviceFingerprint,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      country: session.country,
      city: session.city,
      timezone: session.timezone,
      status: session.status,
      isActive: session.isActive,
      expiresAt: session.expiresAt,
      lastAccessedAt: session.lastAccessedAt,
      lastActivityAt: session.lastActivityAt,
      accessCount: session.accessCount,
      riskScore: session.riskScore,
      loginMethod: session.loginMethod,
      isTrustedDevice: session.isTrustedDevice,
      revokedAt: session.revokedAt,
      revokedBy: session.revokedBy,
      revocationReason: session.revocationReason,
      flags: session.flags,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      // Computed properties
      isExpired: session.isExpired,
      isValid: session.isValid,
      ageInHours: session.ageInHours,
      timeSinceLastAccess: session.timeSinceLastAccess,
      isSuspicious: session.isSuspicious,
      isFromMobileDevice: session.isFromMobileDevice,
      isFromApiClient: session.isFromApiClient,
    };
  }
}