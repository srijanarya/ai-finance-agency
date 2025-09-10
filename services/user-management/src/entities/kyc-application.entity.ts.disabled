import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User, KycStatus } from './user.entity';
import { KYCDocument } from './kyc-document.entity';
import { AddressVerification } from './address-verification.entity';

export enum KYCType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum KYCRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum VerificationLevel {
  BASIC = 'basic',
  ENHANCED = 'enhanced',
  PREMIUM = 'premium',
}

@Entity('kyc_applications')
@Index(['userId'])
@Index(['status'])
@Index(['kycType'])
@Index(['submittedAt'])
@Index(['reviewedAt'])
export class KYCApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    name: 'kyc_type',
    type: 'enum',
    enum: KYCType,
    default: KYCType.INDIVIDUAL,
  })
  kycType: KYCType;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_STARTED,
  })
  @Index()
  status: KycStatus;

  @Column({
    name: 'verification_level',
    type: 'enum',
    enum: VerificationLevel,
    default: VerificationLevel.BASIC,
  })
  verificationLevel: VerificationLevel;

  @Column({
    name: 'risk_level',
    type: 'enum',
    enum: KYCRiskLevel,
    nullable: true,
  })
  riskLevel?: KYCRiskLevel;

  @Column({
    name: 'risk_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  riskScore?: number;

  // Personal Information
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ name: 'place_of_birth', nullable: true })
  placeOfBirth?: string;

  @Column()
  nationality: string;

  @Column({ name: 'country_of_residence' })
  countryOfResidence: string;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ name: 'employer_name', nullable: true })
  employerName?: string;

  @Column({
    name: 'annual_income',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  annualIncome?: number;

  @Column({ name: 'source_of_funds', nullable: true })
  sourceOfFunds?: string;

  @Column({ name: 'investment_experience', nullable: true })
  investmentExperience?: string;

  // Contact Information
  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  // Address Information
  @Column({ name: 'address_line_1' })
  addressLine1: string;

  @Column({ name: 'address_line_2', nullable: true })
  addressLine2?: string;

  @Column()
  city: string;

  @Column({ name: 'state_province', nullable: true })
  stateProvince?: string;

  @Column({ name: 'postal_code' })
  postalCode: string;

  @Column()
  country: string;

  // Identification
  @Column({ name: 'id_type' })
  idType: string; // passport, driver_license, national_id, etc.

  @Column({ name: 'id_number' })
  idNumber: string;

  @Column({ name: 'id_expiry_date', type: 'date', nullable: true })
  idExpiryDate?: Date;

  @Column({ name: 'id_issuing_country' })
  idIssuingCountry: string;

  // PEP and Sanctions
  @Column({ name: 'is_pep', default: false })
  isPep: boolean;

  @Column({ name: 'pep_details', type: 'text', nullable: true })
  pepDetails?: string;

  @Column({ name: 'sanctions_check_passed', nullable: true })
  sanctionsCheckPassed?: boolean;

  @Column({ name: 'sanctions_check_details', type: 'text', nullable: true })
  sanctionsCheckDetails?: string;

  // Business Information (if applicable)
  @Column({ name: 'company_name', nullable: true })
  companyName?: string;

  @Column({ name: 'company_registration_number', nullable: true })
  companyRegistrationNumber?: string;

  @Column({ name: 'company_country', nullable: true })
  companyCountry?: string;

  @Column({ name: 'business_type', nullable: true })
  businessType?: string;

  @Column({ name: 'company_address', type: 'text', nullable: true })
  companyAddress?: string;

  // Review Information
  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  @Index()
  submittedAt?: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  @Index()
  reviewedAt?: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // Additional metadata
  @Column({ name: 'compliance_notes', type: 'text', nullable: true })
  complianceNotes?: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  flags?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => KYCDocument, (document) => document.kycApplication)
  documents: KYCDocument[];

  @OneToMany(
    () => AddressVerification,
    (verification) => verification.kycApplication,
  )
  addressVerifications: AddressVerification[];

  // Virtual properties
  get isCompleted(): boolean {
    return (
      this.status === KycStatus.APPROVED || this.status === KycStatus.REJECTED
    );
  }

  get isPending(): boolean {
    return this.status === KycStatus.PENDING_REVIEW;
  }

  get isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get age(): number {
    if (!this.dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  get fullAddress(): string {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.stateProvince,
      this.postalCode,
      this.country,
    ].filter(Boolean);
    return parts.join(', ');
  }

  get isHighRisk(): boolean {
    return (
      this.riskLevel === KYCRiskLevel.HIGH ||
      this.riskLevel === KYCRiskLevel.VERY_HIGH
    );
  }

  get reviewTimeInDays(): number {
    if (!this.submittedAt || !this.reviewedAt) return 0;
    return Math.ceil(
      (this.reviewedAt.getTime() - this.submittedAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );
  }

  // Methods
  submit(): void {
    if (
      this.status !== KycStatus.NOT_STARTED &&
      this.status !== KycStatus.IN_PROGRESS
    ) {
      throw new Error(
        'Application can only be submitted when in progress or not started',
      );
    }
    this.status = KycStatus.PENDING_REVIEW;
    this.submittedAt = new Date();
  }

  approve(reviewerId: string, notes?: string): void {
    if (this.status !== KycStatus.PENDING_REVIEW) {
      throw new Error('Application must be pending review to approve');
    }
    this.status = KycStatus.APPROVED;
    this.reviewedAt = new Date();
    this.approvedAt = new Date();
    this.reviewedBy = reviewerId;
    if (notes) {
      this.complianceNotes = notes;
    }
    // Set expiration to 1 year from approval
    this.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  reject(reviewerId: string, reason: string, notes?: string): void {
    if (this.status !== KycStatus.PENDING_REVIEW) {
      throw new Error('Application must be pending review to reject');
    }
    this.status = KycStatus.REJECTED;
    this.reviewedAt = new Date();
    this.rejectedAt = new Date();
    this.reviewedBy = reviewerId;
    this.rejectionReason = reason;
    if (notes) {
      this.complianceNotes = notes;
    }
  }

  markExpired(): void {
    this.status = KycStatus.EXPIRED;
    this.expiresAt = new Date();
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

  updateRiskAssessment(
    level: KYCRiskLevel,
    score?: number,
    details?: string,
  ): void {
    this.riskLevel = level;
    if (score !== undefined) {
      this.riskScore = Math.max(0, Math.min(100, score));
    }
    if (details) {
      this.setMetadata('risk_assessment_details', details);
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

  calculateCompleteness(): number {
    const requiredFields = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'nationality',
      'countryOfResidence',
      'email',
      'addressLine1',
      'city',
      'postalCode',
      'country',
      'idType',
      'idNumber',
      'idIssuingCountry',
    ];

    const filledFields = requiredFields.filter((field) => {
      const value = this[field as keyof this];
      return value !== null && value !== undefined && value !== '';
    });

    return (filledFields.length / requiredFields.length) * 100;
  }

  needsDocumentVerification(): boolean {
    const requiredDocuments = ['identity', 'address'];
    if (!this.documents) return true;

    const uploadedDocumentTypes = this.documents.map(
      (doc) => doc.documentType as string,
    );
    return requiredDocuments.some(
      (type) => !uploadedDocumentTypes.includes(type),
    );
  }

  static createFromUser(user: User): Partial<KYCApplication> {
    return {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      email: user.email,
      phone: user.phone,
      status: KycStatus.IN_PROGRESS,
      kycType: KYCType.INDIVIDUAL,
      verificationLevel: VerificationLevel.BASIC,
    };
  }
}
