import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Role } from './role.entity';
import { UserSession } from './user-session.entity';
import { AuditLog } from './audit-log.entity';
import { EnterpriseTenant } from './enterprise-tenant.entity';

export enum UserStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}

export enum KycStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum TwoFactorStatus {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
  PENDING_SETUP = 'pending_setup',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phone'])
@Index(['status'])
@Index(['createdAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture?: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken?: string;

  @Column({
    name: 'email_verification_expires',
    type: 'timestamp',
    nullable: true,
  })
  emailVerificationExpires?: Date;

  @Column({ name: 'phone_verification_token', nullable: true })
  phoneVerificationToken?: string;

  @Column({
    name: 'phone_verification_expires',
    type: 'timestamp',
    nullable: true,
  })
  phoneVerificationExpires?: Date;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  // Security fields
  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp?: string;

  @Column({ name: 'password_changed_at', type: 'timestamp', nullable: true })
  passwordChangedAt?: Date;

  // Two-Factor Authentication
  @Column({
    name: 'two_factor_status',
    type: 'enum',
    enum: TwoFactorStatus,
    default: TwoFactorStatus.DISABLED,
  })
  twoFactorStatus: TwoFactorStatus;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret?: string;

  @Column({
    name: 'two_factor_backup_codes',
    type: 'simple-array',
    nullable: true,
  })
  twoFactorBackupCodes?: string[];

  // KYC Fields
  @Column({
    name: 'kyc_status',
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_STARTED,
  })
  kycStatus: KycStatus;

  @Column({ name: 'kyc_submitted_at', type: 'timestamp', nullable: true })
  kycSubmittedAt?: Date;

  @Column({ name: 'kyc_approved_at', type: 'timestamp', nullable: true })
  kycApprovedAt?: Date;

  @Column({ name: 'kyc_rejected_at', type: 'timestamp', nullable: true })
  kycRejectedAt?: Date;

  @Column({ name: 'kyc_rejection_reason', type: 'text', nullable: true })
  kycRejectionReason?: string;

  @Column({ name: 'kyc_expires_at', type: 'timestamp', nullable: true })
  kycExpiresAt?: Date;

  // User Preferences
  @Column({ name: 'timezone', default: 'UTC' })
  timezone: string;

  @Column({ name: 'language', default: 'en' })
  language: string;

  @Column({ name: 'newsletter_subscribed', default: true })
  newsletterSubscribed: boolean;

  @Column({ name: 'notifications_enabled', default: true })
  notificationsEnabled: boolean;

  @Column({ name: 'marketing_emails_enabled', default: false })
  marketingEmailsEnabled: boolean;

  // Compliance and Risk
  @Column({
    name: 'risk_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  riskScore?: number;

  @Column({ name: 'compliance_flags', type: 'simple-array', nullable: true })
  complianceFlags?: string[];

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // Relations
  @ManyToMany(() => Role, (role) => role.users, { eager: false })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];

  @Column({ name: 'tenant_id', nullable: true })
  @Index()
  tenantId?: string;

  @ManyToOne(() => EnterpriseTenant, (tenant) => tenant.users, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: EnterpriseTenant;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  get isKycCompleted(): boolean {
    return this.kycStatus === KycStatus.APPROVED;
  }

  get isTwoFactorEnabled(): boolean {
    return this.twoFactorStatus === TwoFactorStatus.ENABLED;
  }

  get isEmailVerificationExpired(): boolean {
    return this.emailVerificationExpires
      ? this.emailVerificationExpires < new Date()
      : true;
  }

  get isPasswordResetExpired(): boolean {
    return this.passwordResetExpires
      ? this.passwordResetExpires < new Date()
      : true;
  }

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith('$2')) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
      this.passwordChangedAt = new Date();
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  lockAccount(duration: number = 30 * 60 * 1000): void {
    this.lockedUntil = new Date(Date.now() + duration);
    this.failedLoginAttempts += 1;
  }

  unlockAccount(): void {
    this.lockedUntil = null;
    this.failedLoginAttempts = 0;
  }

  updateLastActivity(): void {
    this.lastActivityAt = new Date();
  }

  markEmailAsVerified(): void {
    this.emailVerified = true;
    this.emailVerificationToken = null;
    this.emailVerificationExpires = null;
    if (this.status === UserStatus.PENDING_VERIFICATION) {
      this.status = UserStatus.ACTIVE;
    }
  }

  markPhoneAsVerified(): void {
    this.phoneVerified = true;
    this.phoneVerificationToken = null;
    this.phoneVerificationExpires = null;
  }

  deactivate(reason?: string): void {
    this.status = UserStatus.DEACTIVATED;
    this.deletedAt = new Date();
    if (reason && this.complianceFlags) {
      this.complianceFlags.push(`deactivated: ${reason}`);
    }
  }

  reactivate(): void {
    if (this.status === UserStatus.DEACTIVATED) {
      this.status = UserStatus.ACTIVE;
      this.deletedAt = null;
    }
  }

  updateRiskScore(score: number): void {
    this.riskScore = Math.max(0, Math.min(100, score)); // Ensure score is between 0-100
  }

  hasRole(roleName: string): boolean {
    return this.roles?.some((role) => role.name === roleName) || false;
  }

  hasAnyRole(roleNames: string[]): boolean {
    return this.roles?.some((role) => roleNames.includes(role.name)) || false;
  }

  hasPermission(permissionName: string): boolean {
    return (
      this.roles?.some((role) =>
        role.permissions?.some(
          (permission) => permission.name === permissionName,
        ),
      ) || false
    );
  }

  hasAnyPermission(permissionNames: string[]): boolean {
    return (
      this.roles?.some((role) =>
        role.permissions?.some((permission) =>
          permissionNames.includes(permission.name),
        ),
      ) || false
    );
  }
}
