import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsArray,
  Length,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType, SessionStatus } from '../entities/user-session.entity';

export class CreateSessionDto {
  @ApiProperty({ description: 'Device identifier' })
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiProperty({ description: 'Device name' })
  @IsString()
  @IsOptional()
  deviceName?: string;

  @ApiProperty({ enum: DeviceType, description: 'Device type' })
  @IsEnum(DeviceType)
  @IsOptional()
  deviceType?: DeviceType;

  @ApiProperty({ description: 'User agent string' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({ description: 'IP address' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ description: 'Country code' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'City name' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Timezone' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ description: 'Login method used' })
  @IsString()
  @IsOptional()
  loginMethod?: string;

  @ApiProperty({ description: 'Whether device is trusted' })
  @IsBoolean()
  @IsOptional()
  isTrustedDevice?: boolean;

  @ApiProperty({ description: 'Session expiration time' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Additional security metadata' })
  @IsObject()
  @IsOptional()
  securityMetadata?: Record<string, any>;
}

export class UpdateSessionDto {
  @ApiPropertyOptional({ description: 'Device name' })
  @IsString()
  @IsOptional()
  deviceName?: string;

  @ApiPropertyOptional({ description: 'Whether device is trusted' })
  @IsBoolean()
  @IsOptional()
  isTrustedDevice?: boolean;

  @ApiPropertyOptional({ enum: SessionStatus, description: 'Session status' })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @ApiPropertyOptional({ description: 'Security flags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  flags?: string[];

  @ApiPropertyOptional({ description: 'Additional security metadata' })
  @IsObject()
  @IsOptional()
  securityMetadata?: Record<string, any>;
}

export class RevokeSessionDto {
  @ApiProperty({ description: 'Reason for revocation' })
  @IsString()
  @Length(1, 255)
  reason: string;

  @ApiPropertyOptional({ description: 'Force revocation even if session is active' })
  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

export class RevokeAllSessionsDto {
  @ApiProperty({ description: 'Reason for revoking all sessions' })
  @IsString()
  @Length(1, 255)
  reason: string;

  @ApiPropertyOptional({ description: 'Keep current session active' })
  @IsBoolean()
  @IsOptional()
  keepCurrent?: boolean;

  @ApiPropertyOptional({ description: 'Password verification for security' })
  @IsString()
  @IsOptional()
  password?: string;
}

export class ExtendSessionDto {
  @ApiPropertyOptional({ description: 'Hours to extend session by' })
  @IsNumber()
  @Min(1)
  @Max(168) // Max 1 week
  @IsOptional()
  hours?: number;

  @ApiPropertyOptional({ description: 'New expiration time' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class SessionFilterDto {
  @ApiPropertyOptional({ enum: SessionStatus, description: 'Filter by session status' })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @ApiPropertyOptional({ enum: DeviceType, description: 'Filter by device type' })
  @IsEnum(DeviceType)
  @IsOptional()
  deviceType?: DeviceType;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by trusted device status' })
  @IsBoolean()
  @IsOptional()
  isTrustedDevice?: boolean;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Start date for creation filter' })
  @IsDateString()
  @IsOptional()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'End date for creation filter' })
  @IsDateString()
  @IsOptional()
  createdBefore?: string;

  @ApiPropertyOptional({ description: 'Filter by IP address' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class SessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  deviceId?: string;

  @ApiPropertyOptional()
  deviceName?: string;

  @ApiProperty({ enum: DeviceType })
  deviceType: DeviceType;

  @ApiPropertyOptional()
  deviceFingerprint?: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  timezone?: string;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  expiresAt: Date;

  @ApiPropertyOptional()
  lastAccessedAt?: Date;

  @ApiPropertyOptional()
  lastActivityAt?: Date;

  @ApiProperty()
  accessCount: number;

  @ApiPropertyOptional()
  riskScore?: number;

  @ApiPropertyOptional()
  loginMethod?: string;

  @ApiProperty()
  isTrustedDevice: boolean;

  @ApiPropertyOptional()
  revokedAt?: Date;

  @ApiPropertyOptional()
  revokedBy?: string;

  @ApiPropertyOptional()
  revocationReason?: string;

  @ApiPropertyOptional()
  flags?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Computed properties
  @ApiProperty()
  isExpired: boolean;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  ageInHours: number;

  @ApiProperty()
  timeSinceLastAccess: number;

  @ApiProperty()
  isSuspicious: boolean;

  @ApiProperty()
  isFromMobileDevice: boolean;

  @ApiProperty()
  isFromApiClient: boolean;
}

export class SessionStatsDto {
  @ApiProperty({ description: 'Total number of sessions' })
  totalSessions: number;

  @ApiProperty({ description: 'Number of active sessions' })
  activeSessions: number;

  @ApiProperty({ description: 'Number of expired sessions' })
  expiredSessions: number;

  @ApiProperty({ description: 'Number of revoked sessions' })
  revokedSessions: number;

  @ApiProperty({ description: 'Number of suspicious sessions' })
  suspiciousSessions: number;

  @ApiProperty({ description: 'Sessions by device type' })
  sessionsByDeviceType: Record<DeviceType, number>;

  @ApiProperty({ description: 'Sessions by country' })
  sessionsByCountry: Record<string, number>;

  @ApiProperty({ description: 'Sessions by login method' })
  sessionsByLoginMethod: Record<string, number>;

  @ApiProperty({ description: 'Average session duration in hours' })
  averageSessionDuration: number;

  @ApiProperty({ description: 'Most recent session activity' })
  lastActivity?: Date;

  @ApiProperty({ description: 'Security alerts count' })
  securityAlerts: number;
}

export class DeviceInfoDto {
  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  deviceName: string;

  @ApiProperty({ enum: DeviceType })
  deviceType: DeviceType;

  @ApiProperty()
  fingerprint: string;

  @ApiProperty()
  isTrusted: boolean;

  @ApiProperty()
  firstSeen: Date;

  @ApiProperty()
  lastSeen: Date;

  @ApiProperty()
  sessionCount: number;

  @ApiProperty()
  locations: Array<{
    country?: string;
    city?: string;
    ipAddress?: string;
    lastSeen: Date;
  }>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  riskScore?: number;

  @ApiProperty()
  flags?: string[];
}

export class SessionAnalyticsDto {
  @ApiProperty({ description: 'Daily session counts for the last 30 days' })
  dailySessions: Array<{
    date: string;
    count: number;
    uniqueUsers: number;
  }>;

  @ApiProperty({ description: 'Peak usage hours' })
  peakHours: Array<{
    hour: number;
    count: number;
  }>;

  @ApiProperty({ description: 'Geographic distribution' })
  geographic: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Device type distribution' })
  deviceTypes: Array<{
    type: DeviceType;
    count: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Security incidents' })
  securityIncidents: Array<{
    type: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;

  @ApiProperty({ description: 'Session duration distribution' })
  durationDistribution: Array<{
    range: string; // e.g., "0-1h", "1-6h", "6-24h", "1d+"
    count: number;
    percentage: number;
  }>;
}

export class SessionSecurityDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  riskScore: number;

  @ApiProperty()
  securityFlags: string[];

  @ApiProperty()
  anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Date;
  }>;

  @ApiProperty()
  recommendations: Array<{
    action: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
  }>;

  @ApiProperty()
  locationChanges: Array<{
    from: { country?: string; city?: string; ip?: string };
    to: { country?: string; city?: string; ip?: string };
    timestamp: Date;
    suspicious: boolean;
  }>;

  @ApiProperty()
  deviceChanges: Array<{
    from: string;
    to: string;
    timestamp: Date;
    verified: boolean;
  }>;
}