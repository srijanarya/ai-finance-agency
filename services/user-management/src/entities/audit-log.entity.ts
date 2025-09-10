import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  // User Management Actions
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ACTIVATED = 'user_activated',
  USER_DEACTIVATED = 'user_deactivated',
  USER_SUSPENDED = 'user_suspended',
  USER_UNSUSPENDED = 'user_unsuspended',

  // Authentication Actions
  USER_LOGIN = 'user_login',
  USER_LOGIN_FAILED = 'user_login_failed',
  USER_LOGOUT = 'user_logout',
  USER_LOGOUT_ALL = 'user_logout_all',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  PASSWORD_RESET_FAILED = 'password_reset_failed',

  // Email & Phone Verification
  EMAIL_VERIFICATION_SENT = 'email_verification_sent',
  EMAIL_VERIFIED = 'email_verified',
  EMAIL_VERIFICATION_FAILED = 'email_verification_failed',
  PHONE_VERIFICATION_SENT = 'phone_verification_sent',
  PHONE_VERIFIED = 'phone_verified',
  PHONE_VERIFICATION_FAILED = 'phone_verification_failed',

  // Two-Factor Authentication
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  TWO_FACTOR_VERIFIED = 'two_factor_verified',
  TWO_FACTOR_FAILED = 'two_factor_failed',
  BACKUP_CODES_GENERATED = 'backup_codes_generated',
  BACKUP_CODE_USED = 'backup_code_used',

  // Account Security
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_ALERT = 'security_alert',

  // Session Management
  SESSION_CREATED = 'session_created',
  SESSION_REFRESHED = 'session_refreshed',
  SESSION_REVOKED = 'session_revoked',
  SESSION_EXPIRED = 'session_expired',

  // Role & Permission Management
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',
  ROLE_CREATED = 'role_created',
  ROLE_UPDATED = 'role_updated',
  ROLE_DELETED = 'role_deleted',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',

  // KYC Actions
  KYC_STARTED = 'kyc_started',
  KYC_SUBMITTED = 'kyc_submitted',
  KYC_APPROVED = 'kyc_approved',
  KYC_REJECTED = 'kyc_rejected',
  KYC_EXPIRED = 'kyc_expired',
  KYC_DOCUMENT_UPLOADED = 'kyc_document_uploaded',
  KYC_DOCUMENT_VERIFIED = 'kyc_document_verified',
  KYC_DOCUMENT_REJECTED = 'kyc_document_rejected',

  // Profile Management
  PROFILE_UPDATED = 'profile_updated',
  PROFILE_PICTURE_UPDATED = 'profile_picture_updated',
  PREFERENCES_UPDATED = 'preferences_updated',

  // Trading Actions
  TRADE_EXECUTED = 'trade_executed',
  TRADE_CANCELLED = 'trade_cancelled',
  PORTFOLIO_UPDATED = 'portfolio_updated',
  SIGNAL_ACCESSED = 'signal_accessed',
  SIGNAL_FOLLOWED = 'signal_followed',

  // Content Actions
  CONTENT_CREATED = 'content_created',
  CONTENT_UPDATED = 'content_updated',
  CONTENT_DELETED = 'content_deleted',
  CONTENT_MODERATED = 'content_moderated',
  COMMENT_CREATED = 'comment_created',
  COMMENT_DELETED = 'comment_deleted',

  // System Administration
  SYSTEM_CONFIGURED = 'system_configured',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',
  MAINTENANCE_STARTED = 'maintenance_started',
  MAINTENANCE_COMPLETED = 'maintenance_completed',

  // API Actions
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  API_REQUEST = 'api_request',
  API_RATE_LIMITED = 'api_rate_limited',

  // Compliance Actions
  COMPLIANCE_CHECK = 'compliance_check',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  RISK_ASSESSMENT = 'risk_assessment',
  FRAUD_DETECTED = 'fraud_detected',

  // Subscription & Billing
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPDATED = 'subscription_updated',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_FAILED = 'payment_failed',

  // General Actions
  DATA_EXPORT_REQUESTED = 'data_export_requested',
  DATA_IMPORT_COMPLETED = 'data_import_completed',
  NOTIFICATION_SENT = 'notification_sent',
  EMAIL_SENT = 'email_sent',
}

export enum AuditLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  WARNING = 'warning',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['resource'])
@Index(['level'])
@Index(['status'])
@Index(['createdAt'])
@Index(['ipAddress'])
@Index(['sessionId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  @Index()
  action: AuditAction;

  @Column()
  @Index()
  resource: string;

  @Column({ name: 'resource_id', nullable: true })
  resourceId?: string;

  @Column({
    type: 'enum',
    enum: AuditLevel,
    default: AuditLevel.MEDIUM,
  })
  @Index()
  level: AuditLevel;

  @Column({
    type: 'enum',
    enum: AuditStatus,
    default: AuditStatus.SUCCESS,
  })
  @Index()
  status: AuditStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  details?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'ip_address', nullable: true })
  @Index()
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'session_id', nullable: true })
  @Index()
  sessionId?: string;

  @Column({ name: 'request_id', nullable: true })
  requestId?: string;

  @Column({ name: 'correlation_id', nullable: true })
  correlationId?: string;

  @Column({ name: 'api_endpoint', nullable: true })
  apiEndpoint?: string;

  @Column({ name: 'http_method', nullable: true })
  httpMethod?: string;

  @Column({ name: 'http_status', nullable: true })
  httpStatus?: number;

  @Column({ name: 'response_time', nullable: true })
  responseTime?: number;

  @Column({ name: 'country', nullable: true })
  country?: string;

  @Column({ name: 'city', nullable: true })
  city?: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType?: string;

  @Column({
    name: 'risk_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  riskScore?: number;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.auditLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // Virtual properties
  get isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
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

  get isCritical(): boolean {
    return this.level === AuditLevel.CRITICAL;
  }

  get isHigh(): boolean {
    return this.level === AuditLevel.HIGH;
  }

  get isSuccess(): boolean {
    return this.status === AuditStatus.SUCCESS;
  }

  get isFailure(): boolean {
    return this.status === AuditStatus.FAILURE;
  }

  get isSecurityRelated(): boolean {
    const securityActions = [
      AuditAction.USER_LOGIN,
      AuditAction.USER_LOGIN_FAILED,
      AuditAction.PASSWORD_CHANGED,
      AuditAction.PASSWORD_RESET_REQUESTED,
      AuditAction.ACCOUNT_LOCKED,
      AuditAction.SUSPICIOUS_ACTIVITY,
      AuditAction.SECURITY_ALERT,
      AuditAction.TWO_FACTOR_ENABLED,
      AuditAction.TWO_FACTOR_DISABLED,
      AuditAction.SESSION_CREATED,
      AuditAction.SESSION_REVOKED,
    ];

    return securityActions.includes(this.action);
  }

  get isAuthenticationRelated(): boolean {
    return (
      this.action.toString().includes('login') ||
      this.action.toString().includes('password') ||
      this.action.toString().includes('two_factor') ||
      this.action.toString().includes('session')
    );
  }

  get isKycRelated(): boolean {
    return this.action.toString().startsWith('kyc_');
  }

  // Methods
  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter((t) => t !== tag);
    }
  }

  hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  setDetail(key: string, value: any): void {
    if (!this.details) {
      this.details = {};
    }
    this.details[key] = value;
  }

  getDetail(key: string): any {
    return this.details?.[key] || null;
  }

  removeDetail(key: string): void {
    if (this.details) {
      delete this.details[key];
    }
  }

  setMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  getMetadata(key: string): any {
    return this.metadata?.[key] || null;
  }

  removeMetadata(key: string): void {
    if (this.metadata) {
      delete this.metadata[key];
    }
  }

  setExpiration(days: number): void {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    this.expiresAt = expirationDate;
  }

  markAsCritical(): void {
    this.level = AuditLevel.CRITICAL;
  }

  markAsSuccess(): void {
    this.status = AuditStatus.SUCCESS;
  }

  markAsFailure(): void {
    this.status = AuditStatus.FAILURE;
  }

  updateRiskScore(score: number): void {
    this.riskScore = Math.max(0, Math.min(100, score));
  }

  static create(options: {
    userId?: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    level?: AuditLevel;
    status?: AuditStatus;
    description?: string;
    details?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    correlationId?: string;
    apiEndpoint?: string;
    httpMethod?: string;
    httpStatus?: number;
    responseTime?: number;
    country?: string;
    city?: string;
    deviceType?: string;
    riskScore?: number;
    tags?: string[];
    expirationDays?: number;
  }): Partial<AuditLog> {
    const auditLog: Partial<AuditLog> = {
      userId: options.userId,
      action: options.action,
      resource: options.resource,
      resourceId: options.resourceId,
      level: options.level || AuditLevel.MEDIUM,
      status: options.status || AuditStatus.SUCCESS,
      description: options.description,
      details: options.details,
      metadata: options.metadata,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      sessionId: options.sessionId,
      requestId: options.requestId,
      correlationId: options.correlationId,
      apiEndpoint: options.apiEndpoint,
      httpMethod: options.httpMethod,
      httpStatus: options.httpStatus,
      responseTime: options.responseTime,
      country: options.country,
      city: options.city,
      deviceType: options.deviceType,
      riskScore: options.riskScore,
      tags: options.tags,
    };

    if (options.expirationDays) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + options.expirationDays);
      auditLog.expiresAt = expirationDate;
    }

    return auditLog;
  }

  static getSecurityActions(): AuditAction[] {
    return [
      AuditAction.USER_LOGIN,
      AuditAction.USER_LOGIN_FAILED,
      AuditAction.USER_LOGOUT,
      AuditAction.PASSWORD_CHANGED,
      AuditAction.PASSWORD_RESET_REQUESTED,
      AuditAction.PASSWORD_RESET_COMPLETED,
      AuditAction.EMAIL_VERIFIED,
      AuditAction.TWO_FACTOR_ENABLED,
      AuditAction.TWO_FACTOR_DISABLED,
      AuditAction.TWO_FACTOR_FAILED,
      AuditAction.ACCOUNT_LOCKED,
      AuditAction.ACCOUNT_UNLOCKED,
      AuditAction.SUSPICIOUS_ACTIVITY,
      AuditAction.SECURITY_ALERT,
      AuditAction.SESSION_CREATED,
      AuditAction.SESSION_REVOKED,
      AuditAction.ROLE_ASSIGNED,
      AuditAction.ROLE_REMOVED,
      AuditAction.PERMISSION_GRANTED,
      AuditAction.PERMISSION_REVOKED,
    ];
  }

  static getKycActions(): AuditAction[] {
    return [
      AuditAction.KYC_STARTED,
      AuditAction.KYC_SUBMITTED,
      AuditAction.KYC_APPROVED,
      AuditAction.KYC_REJECTED,
      AuditAction.KYC_EXPIRED,
      AuditAction.KYC_DOCUMENT_UPLOADED,
      AuditAction.KYC_DOCUMENT_VERIFIED,
      AuditAction.KYC_DOCUMENT_REJECTED,
    ];
  }

  static getCriticalActions(): AuditAction[] {
    return [
      AuditAction.USER_DELETED,
      AuditAction.ACCOUNT_LOCKED,
      AuditAction.SUSPICIOUS_ACTIVITY,
      AuditAction.FRAUD_DETECTED,
      AuditAction.COMPLIANCE_VIOLATION,
      AuditAction.API_KEY_REVOKED,
      AuditAction.SYSTEM_CONFIGURED,
      AuditAction.BACKUP_RESTORED,
    ];
  }
}
