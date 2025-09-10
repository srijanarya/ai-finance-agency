import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Course } from './course.entity';

export enum CertificateStatus {
  ISSUED = 'issued',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

export enum CertificateType {
  COMPLETION = 'completion',
  ACHIEVEMENT = 'achievement',
  PARTICIPATION = 'participation',
  MASTERY = 'mastery',
}

@Entity('education_certificates')
@Unique(['userId', 'courseId'])
@Index(['userId'])
@Index(['courseId'])
@Index(['certificateNumber'])
@Index(['status'])
@Index(['issuedAt'])
@Index(['expiresAt'])
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'course_id' })
  courseId: string;

  @Column({ name: 'certificate_number', unique: true })
  @Index()
  certificateNumber: string;

  @Column({
    name: 'certificate_type',
    type: 'enum',
    enum: CertificateType,
    default: CertificateType.COMPLETION,
  })
  certificateType: CertificateType;

  @Column({
    type: 'enum',
    enum: CertificateStatus,
    default: CertificateStatus.ISSUED,
  })
  status: CertificateStatus;

  @Column({ name: 'recipient_name' })
  recipientName: string;

  @Column({ name: 'recipient_email' })
  recipientEmail: string;

  @Column({ name: 'course_title' })
  courseTitle: string;

  @Column({ name: 'course_description', type: 'text', nullable: true })
  courseDescription?: string;

  @Column({ name: 'instructor_name', nullable: true })
  instructorName?: string;

  @Column({ name: 'instructor_signature', nullable: true })
  instructorSignature?: string;

  @Column({ name: 'organization_name', default: 'AI Finance Academy' })
  organizationName: string;

  @Column({ name: 'organization_logo', nullable: true })
  organizationLogo?: string;

  @Column({ name: 'completion_date', type: 'date' })
  completionDate: Date;

  @Column({ name: 'final_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalScore?: number;

  @Column({ name: 'final_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalPercentage?: number;

  @Column({ name: 'total_hours', type: 'decimal', precision: 8, scale: 2, nullable: true })
  totalHours?: number;

  @Column({ name: 'skills_acquired', type: 'simple-array', nullable: true })
  skillsAcquired?: string[];

  @Column({ name: 'learning_outcomes', type: 'simple-array', nullable: true })
  learningOutcomes?: string[];

  @Column({ name: 'grade', nullable: true })
  grade?: string;

  @Column({ name: 'verification_url', nullable: true })
  verificationUrl?: string;

  @Column({ name: 'verification_code', unique: true })
  @Index()
  verificationCode: string;

  @Column({ name: 'qr_code_url', nullable: true })
  qrCodeUrl?: string;

  @Column({ name: 'digital_signature', type: 'text', nullable: true })
  digitalSignature?: string;

  @Column({ name: 'blockchain_hash', nullable: true })
  blockchainHash?: string;

  @Column({ name: 'template_used', nullable: true })
  templateUsed?: string;

  @Column({ name: 'certificate_url', nullable: true })
  certificateUrl?: string;

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl?: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'is_shareable', default: true })
  isShareable: boolean;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'share_count', default: 0 })
  shareCount: number;

  @Column({ name: 'issued_at', type: 'timestamp' })
  issuedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ name: 'revocation_reason', nullable: true })
  revocationReason?: string;

  @Column({ name: 'revoked_by', nullable: true })
  revokedBy?: string;

  @Column({ name: 'last_verified_at', type: 'timestamp', nullable: true })
  lastVerifiedAt?: Date;

  @Column({ name: 'verification_count', default: 0 })
  verificationCount: number;

  @Column({ name: 'issuer_id', nullable: true })
  issuerId?: string;

  @Column({ name: 'issuer_name', nullable: true })
  issuerName?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Course, (course) => course.certificates)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // Virtual properties
  get isValid(): boolean {
    return this.status === CertificateStatus.ISSUED && !this.isExpired;
  }

  get isRevoked(): boolean {
    return this.status === CertificateStatus.REVOKED;
  }

  get isExpired(): boolean {
    return this.status === CertificateStatus.EXPIRED || 
           (this.expiresAt && this.expiresAt < new Date());
  }

  get isActive(): boolean {
    return this.status === CertificateStatus.ISSUED && !this.isExpired;
  }

  get hasExpiration(): boolean {
    return this.expiresAt !== null;
  }

  get daysUntilExpiration(): number {
    if (!this.expiresAt) return Infinity;
    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isNearExpiration(): boolean {
    return this.daysUntilExpiration <= 30 && this.daysUntilExpiration > 0;
  }

  get age(): number {
    const now = new Date();
    const diffTime = now.getTime() - this.issuedAt.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  get formattedGrade(): string {
    if (this.grade) return this.grade;
    if (this.finalPercentage) {
      if (this.finalPercentage >= 90) return 'A';
      if (this.finalPercentage >= 80) return 'B';
      if (this.finalPercentage >= 70) return 'C';
      if (this.finalPercentage >= 60) return 'D';
      return 'F';
    }
    return 'N/A';
  }

  get displayName(): string {
    return `Certificate of ${this.certificateType.charAt(0).toUpperCase() + this.certificateType.slice(1)}`;
  }

  get shortVerificationCode(): string {
    return this.verificationCode.substring(0, 8).toUpperCase();
  }

  get publicVerificationUrl(): string {
    return `${this.verificationUrl}/${this.verificationCode}`;
  }

  get isBlockchainVerified(): boolean {
    return this.blockchainHash !== null && this.blockchainHash !== undefined;
  }

  get hasDigitalSignature(): boolean {
    return this.digitalSignature !== null && this.digitalSignature !== undefined;
  }

  // Methods
  revoke(reason: string, revokedBy?: string): void {
    this.status = CertificateStatus.REVOKED;
    this.revokedAt = new Date();
    this.revocationReason = reason;
    this.revokedBy = revokedBy;
  }

  reinstate(): void {
    if (this.isRevoked) {
      this.status = CertificateStatus.ISSUED;
      this.revokedAt = null;
      this.revocationReason = null;
      this.revokedBy = null;
    }
  }

  expire(): void {
    this.status = CertificateStatus.EXPIRED;
  }

  extend(newExpirationDate: Date): void {
    this.expiresAt = newExpirationDate;
    if (this.status === CertificateStatus.EXPIRED) {
      this.status = CertificateStatus.ISSUED;
    }
  }

  markAsDownloaded(): void {
    this.downloadCount += 1;
  }

  markAsViewed(): void {
    this.viewCount += 1;
  }

  markAsShared(): void {
    this.shareCount += 1;
  }

  markAsVerified(): void {
    this.verificationCount += 1;
    this.lastVerifiedAt = new Date();
  }

  makePublic(): void {
    this.isPublic = true;
  }

  makePrivate(): void {
    this.isPublic = false;
  }

  enableSharing(): void {
    this.isShareable = true;
  }

  disableSharing(): void {
    this.isShareable = false;
  }

  setUrls(certificateUrl: string, pdfUrl?: string, qrCodeUrl?: string): void {
    this.certificateUrl = certificateUrl;
    if (pdfUrl) this.pdfUrl = pdfUrl;
    if (qrCodeUrl) this.qrCodeUrl = qrCodeUrl;
  }

  setBlockchainHash(hash: string): void {
    this.blockchainHash = hash;
  }

  setDigitalSignature(signature: string): void {
    this.digitalSignature = signature;
  }

  addSkill(skill: string): void {
    if (!this.skillsAcquired) {
      this.skillsAcquired = [];
    }
    if (!this.skillsAcquired.includes(skill)) {
      this.skillsAcquired.push(skill);
    }
  }

  removeSkill(skill: string): void {
    if (this.skillsAcquired) {
      this.skillsAcquired = this.skillsAcquired.filter(s => s !== skill);
    }
  }

  addLearningOutcome(outcome: string): void {
    if (!this.learningOutcomes) {
      this.learningOutcomes = [];
    }
    if (!this.learningOutcomes.includes(outcome)) {
      this.learningOutcomes.push(outcome);
    }
  }

  removeLearningOutcome(outcome: string): void {
    if (this.learningOutcomes) {
      this.learningOutcomes = this.learningOutcomes.filter(o => o !== outcome);
    }
  }

  updateTemplate(templateName: string): void {
    this.templateUsed = templateName;
  }

  setInstructorDetails(name: string, signature?: string): void {
    this.instructorName = name;
    if (signature) {
      this.instructorSignature = signature;
    }
  }

  setOrganizationDetails(name: string, logo?: string): void {
    this.organizationName = name;
    if (logo) {
      this.organizationLogo = logo;
    }
  }

  updateFinalScore(score: number, percentage: number, grade?: string): void {
    this.finalScore = score;
    this.finalPercentage = percentage;
    if (grade) {
      this.grade = grade;
    }
  }

  generateSummary(): {
    id: string;
    certificateNumber: string;
    recipientName: string;
    courseTitle: string;
    completionDate: Date;
    issuedAt: Date;
    status: string;
    isValid: boolean;
    verificationCode: string;
    grade?: string;
  } {
    return {
      id: this.id,
      certificateNumber: this.certificateNumber,
      recipientName: this.recipientName,
      courseTitle: this.courseTitle,
      completionDate: this.completionDate,
      issuedAt: this.issuedAt,
      status: this.status,
      isValid: this.isValid,
      verificationCode: this.shortVerificationCode,
      grade: this.formattedGrade,
    };
  }

  getVerificationDetails(): {
    certificateNumber: string;
    verificationCode: string;
    isValid: boolean;
    issuedAt: Date;
    expiresAt?: Date;
    recipientName: string;
    courseTitle: string;
    organizationName: string;
    verificationUrl: string;
    lastVerified?: Date;
    verificationCount: number;
  } {
    return {
      certificateNumber: this.certificateNumber,
      verificationCode: this.verificationCode,
      isValid: this.isValid,
      issuedAt: this.issuedAt,
      expiresAt: this.expiresAt,
      recipientName: this.recipientName,
      courseTitle: this.courseTitle,
      organizationName: this.organizationName,
      verificationUrl: this.publicVerificationUrl,
      lastVerified: this.lastVerifiedAt,
      verificationCount: this.verificationCount,
    };
  }

  // Static methods
  static generateCertificateNumber(): string {
    const prefix = 'AFA'; // AI Finance Academy
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}-${year}-${random}`;
  }

  static generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 12) + 
           Math.random().toString(36).substr(2, 12);
  }
}