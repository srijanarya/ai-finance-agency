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
import { User } from './user.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPICIOUS = 'suspicious',
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  API = 'api',
  BOT = 'bot',
  UNKNOWN = 'unknown',
}

@Entity('user_sessions')
@Index(['userId'])
@Index(['refreshToken'], { unique: true })
@Index(['deviceId'])
@Index(['status'])
@Index(['isActive'])
@Index(['expiresAt'])
@Index(['createdAt'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'refresh_token', unique: true })
  @Index()
  refreshToken: string;

  @Column({ name: 'device_id', nullable: true })
  @Index()
  deviceId?: string;

  @Column({ name: 'device_name', nullable: true })
  deviceName?: string;

  @Column({
    name: 'device_type',
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.UNKNOWN,
  })
  deviceType: DeviceType;

  @Column({ name: 'device_fingerprint', nullable: true })
  deviceFingerprint?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'ip_address', nullable: true })
  @Index()
  ipAddress?: string;

  @Column({ name: 'country', nullable: true })
  country?: string;

  @Column({ name: 'city', nullable: true })
  city?: string;

  @Column({ name: 'timezone', nullable: true })
  timezone?: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamp' })
  @Index()
  expiresAt: Date;

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @Column({ name: 'access_count', default: 0 })
  accessCount: number;

  @Column({
    name: 'risk_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  riskScore?: number;

  @Column({ name: 'login_method', nullable: true })
  loginMethod?: string; // password, 2fa, sso, api_key, etc.

  @Column({ name: 'is_trusted_device', default: false })
  isTrustedDevice: boolean;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ name: 'revoked_by', nullable: true })
  revokedBy?: string;

  @Column({ name: 'revocation_reason', nullable: true })
  revocationReason?: string;

  @Column({ type: 'simple-json', nullable: true })
  securityMetadata?: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  flags?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Virtual properties
  get isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  get isValid(): boolean {
    return (
      this.isActive &&
      !this.isExpired &&
      this.status === SessionStatus.ACTIVE &&
      !this.revokedAt
    );
  }

  get age(): number {
    return Date.now() - this.createdAt.getTime();
  }

  get ageInHours(): number {
    return Math.floor(this.age / (1000 * 60 * 60));
  }

  get ageInDays(): number {
    return Math.floor(this.age / (1000 * 60 * 60 * 24));
  }

  get timeSinceLastAccess(): number {
    return this.lastAccessedAt ? Date.now() - this.lastAccessedAt.getTime() : 0;
  }

  get isSuspicious(): boolean {
    return (
      this.status === SessionStatus.SUSPICIOUS ||
      this.flags?.includes('suspicious') ||
      false
    );
  }

  get isFromMobileDevice(): boolean {
    return (
      this.deviceType === DeviceType.MOBILE ||
      this.deviceType === DeviceType.TABLET
    );
  }

  get isFromApiClient(): boolean {
    return (
      this.deviceType === DeviceType.API || this.deviceType === DeviceType.BOT
    );
  }

  // Methods
  updateLastAccessed(): void {
    this.lastAccessedAt = new Date();
    this.accessCount += 1;
  }

  revoke(revokedBy?: string, reason?: string): void {
    this.isActive = false;
    this.status = SessionStatus.REVOKED;
    this.revokedAt = new Date();
    this.revokedBy = revokedBy;
    this.revocationReason = reason;
  }

  markAsExpired(): void {
    this.isActive = false;
    this.status = SessionStatus.EXPIRED;
  }

  markAsSuspicious(reason?: string): void {
    this.status = SessionStatus.SUSPICIOUS;
    this.addFlag('suspicious');
    if (reason) {
      this.setSecurityMetadata('suspicious_reason', reason);
    }
  }

  trustDevice(): void {
    this.isTrustedDevice = true;
    this.removeFlag('untrusted');
    this.addFlag('trusted');
  }

  untrustDevice(): void {
    this.isTrustedDevice = false;
    this.removeFlag('trusted');
    this.addFlag('untrusted');
  }

  extend(hours: number = 24): void {
    const newExpirationTime = new Date();
    newExpirationTime.setTime(
      newExpirationTime.getTime() + hours * 60 * 60 * 1000,
    );
    this.expiresAt = newExpirationTime;
  }

  addFlag(flag: string): void {
    if (!this.flags) {
      this.flags = [];
    }
    if (!this.flags.includes(flag)) {
      this.flags.push(flag);
    }
  }

  removeFlag(flag: string): void {
    if (this.flags) {
      this.flags = this.flags.filter((f) => f !== flag);
    }
  }

  hasFlag(flag: string): boolean {
    return this.flags?.includes(flag) || false;
  }

  setSecurityMetadata(key: string, value: any): void {
    if (!this.securityMetadata) {
      this.securityMetadata = {};
    }
    this.securityMetadata[key] = value;
  }

  getSecurityMetadata(key: string): any {
    return this.securityMetadata?.[key] || null;
  }

  removeSecurityMetadata(key: string): void {
    if (this.securityMetadata) {
      delete this.securityMetadata[key];
    }
  }

  updateLocation(country?: string, city?: string, timezone?: string): void {
    this.country = country;
    this.city = city;
    this.timezone = timezone;
  }

  generateDeviceFingerprint(): string {
    const components = [
      this.userAgent,
      this.deviceId,
      this.deviceName,
      this.ipAddress,
    ].filter(Boolean);

    return Buffer.from(components.join('|')).toString('base64').slice(0, 32);
  }

  detectDeviceType(): DeviceType {
    if (!this.userAgent) {
      return DeviceType.UNKNOWN;
    }

    const ua = this.userAgent.toLowerCase();

    // Check for API clients
    if (ua.includes('api') || ua.includes('curl') || ua.includes('postman')) {
      return DeviceType.API;
    }

    // Check for bots
    if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
      return DeviceType.BOT;
    }

    // Check for mobile devices
    if (
      ua.includes('mobile') ||
      ua.includes('android') ||
      ua.includes('iphone')
    ) {
      return DeviceType.MOBILE;
    }

    // Check for tablets
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return DeviceType.TABLET;
    }

    // Default to desktop
    return DeviceType.DESKTOP;
  }

  isFromSameDevice(otherSession: UserSession): boolean {
    return (
      this.deviceId === otherSession.deviceId ||
      this.deviceFingerprint === otherSession.deviceFingerprint
    );
  }

  isFromSameLocation(otherSession: UserSession): boolean {
    return (
      this.ipAddress === otherSession.ipAddress ||
      (this.country === otherSession.country && this.city === otherSession.city)
    );
  }

  shouldBeConsideredSuspicious(): boolean {
    const suspiciousIndicators = [
      this.accessCount > 1000 && this.ageInDays < 1, // Too many accesses in short time
      this.hasFlag('multiple_ips'), // Session used from multiple IPs
      this.hasFlag('rapid_location_change'), // Rapid location changes
      this.getSecurityMetadata('failed_2fa_attempts') > 3, // Too many 2FA failures
    ];

    return suspiciousIndicators.some((indicator) => indicator);
  }

  static createSession(
    userId: string,
    refreshToken: string,
    options: Partial<{
      deviceId: string;
      deviceName: string;
      userAgent: string;
      ipAddress: string;
      expiresAt: Date;
      loginMethod: string;
      isTrustedDevice: boolean;
    }> = {},
  ): Partial<UserSession> {
    const expiresAt =
      options.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default

    return {
      userId,
      refreshToken,
      deviceId: options.deviceId,
      deviceName: options.deviceName,
      userAgent: options.userAgent,
      ipAddress: options.ipAddress,
      expiresAt,
      loginMethod: options.loginMethod,
      isTrustedDevice: options.isTrustedDevice || false,
      status: SessionStatus.ACTIVE,
      isActive: true,
      accessCount: 0,
    };
  }
}
