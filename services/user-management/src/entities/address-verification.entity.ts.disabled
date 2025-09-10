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
import { KYCApplication } from './kyc-application.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

export enum VerificationProvider {
  GOOGLE_MAPS = 'google_maps',
  POSTAL_SERVICE = 'postal_service',
  UTILITY_COMPANY = 'utility_company',
  GOVERNMENT_DB = 'government_db',
  THIRD_PARTY = 'third_party',
  MANUAL = 'manual',
}

export enum AddressType {
  RESIDENTIAL = 'residential',
  BUSINESS = 'business',
  PO_BOX = 'po_box',
  TEMPORARY = 'temporary',
  UNKNOWN = 'unknown',
}

@Entity('address_verifications')
@Index(['kycApplicationId'])
@Index(['status'])
@Index(['verificationProvider'])
@Index(['createdAt'])
export class AddressVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'kyc_application_id' })
  @Index()
  kycApplicationId: string;

  // Original address information
  @Column({ name: 'input_address_line_1' })
  inputAddressLine1: string;

  @Column({ name: 'input_address_line_2', nullable: true })
  inputAddressLine2?: string;

  @Column({ name: 'input_city' })
  inputCity: string;

  @Column({ name: 'input_state_province', nullable: true })
  inputStateProvince?: string;

  @Column({ name: 'input_postal_code' })
  inputPostalCode: string;

  @Column({ name: 'input_country' })
  inputCountry: string;

  // Standardized/verified address information
  @Column({ name: 'verified_address_line_1', nullable: true })
  verifiedAddressLine1?: string;

  @Column({ name: 'verified_address_line_2', nullable: true })
  verifiedAddressLine2?: string;

  @Column({ name: 'verified_city', nullable: true })
  verifiedCity?: string;

  @Column({ name: 'verified_state_province', nullable: true })
  verifiedStateProvince?: string;

  @Column({ name: 'verified_postal_code', nullable: true })
  verifiedPostalCode?: string;

  @Column({ name: 'verified_country', nullable: true })
  verifiedCountry?: string;

  @Column({ name: 'verified_country_code', nullable: true })
  verifiedCountryCode?: string;

  // Geographic information
  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitude?: number;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitude?: number;

  @Column({ name: 'timezone', nullable: true })
  timezone?: string;

  @Column({
    name: 'address_type',
    type: 'enum',
    enum: AddressType,
    default: AddressType.UNKNOWN,
  })
  addressType: AddressType;

  // Verification details
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  @Index()
  status: VerificationStatus;

  @Column({
    name: 'verification_provider',
    type: 'enum',
    enum: VerificationProvider,
    nullable: true,
  })
  @Index()
  verificationProvider?: VerificationProvider;

  @Column({ name: 'provider_reference', nullable: true })
  providerReference?: string;

  @Column({
    name: 'confidence_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  confidenceScore?: number;

  @Column({
    name: 'match_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  matchScore?: number;

  @Column({ name: 'verification_date', type: 'timestamp', nullable: true })
  verificationDate?: Date;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy?: string;

  // Validation results
  @Column({ name: 'is_deliverable', nullable: true })
  isDeliverable?: boolean;

  @Column({ name: 'is_residential', nullable: true })
  isResidential?: boolean;

  @Column({ name: 'is_business', nullable: true })
  isBusiness?: boolean;

  @Column({ name: 'is_po_box', nullable: true })
  isPoBox?: boolean;

  @Column({ name: 'is_vacant', nullable: true })
  isVacant?: boolean;

  @Column({ name: 'delivery_point_validated', nullable: true })
  deliveryPointValidated?: boolean;

  @Column({ name: 'zip_plus_four', nullable: true })
  zipPlusFour?: string;

  // Quality and risk indicators
  @Column({
    name: 'quality_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  qualityScore?: number;

  @Column({
    name: 'risk_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  riskScore?: number;

  @Column({ name: 'quality_issues', type: 'simple-array', nullable: true })
  qualityIssues?: string[];

  @Column({ name: 'risk_indicators', type: 'simple-array', nullable: true })
  riskIndicators?: string[];

  // Validation errors and warnings
  @Column({ name: 'validation_errors', type: 'simple-array', nullable: true })
  validationErrors?: string[];

  @Column({ name: 'validation_warnings', type: 'simple-array', nullable: true })
  validationWarnings?: string[];

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  // Additional provider data
  @Column({ name: 'provider_response', type: 'simple-json', nullable: true })
  providerResponse?: Record<string, any>;

  @Column({ name: 'raw_response', type: 'text', nullable: true })
  rawResponse?: string;

  // Metadata and notes
  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  flags?: string[];

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(
    () => KYCApplication,
    (application) => application.addressVerifications,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'kyc_application_id' })
  kycApplication: KYCApplication;

  // Virtual properties
  get isVerified(): boolean {
    return this.status === VerificationStatus.VERIFIED;
  }

  get isFailed(): boolean {
    return this.status === VerificationStatus.FAILED;
  }

  get isPartialMatch(): boolean {
    return this.status === VerificationStatus.PARTIAL;
  }

  get inputFullAddress(): string {
    const parts = [
      this.inputAddressLine1,
      this.inputAddressLine2,
      this.inputCity,
      this.inputStateProvince,
      this.inputPostalCode,
      this.inputCountry,
    ].filter(Boolean);
    return parts.join(', ');
  }

  get verifiedFullAddress(): string | null {
    if (!this.verifiedAddressLine1) return null;
    const parts = [
      this.verifiedAddressLine1,
      this.verifiedAddressLine2,
      this.verifiedCity,
      this.verifiedStateProvince,
      this.verifiedPostalCode,
      this.verifiedCountry,
    ].filter(Boolean);
    return parts.join(', ');
  }

  get hasGeolocation(): boolean {
    return this.latitude !== null && this.longitude !== null;
  }

  get isHighRisk(): boolean {
    return this.riskScore !== null && this.riskScore > 70;
  }

  get isHighQuality(): boolean {
    return this.qualityScore !== null && this.qualityScore > 80;
  }

  get hasValidationIssues(): boolean {
    return (
      (this.validationErrors && this.validationErrors.length > 0) ||
      (this.qualityIssues && this.qualityIssues.length > 0)
    );
  }

  get needsManualReview(): boolean {
    return (
      this.status === VerificationStatus.PARTIAL ||
      this.hasValidationIssues ||
      this.isHighRisk ||
      (this.confidenceScore !== null && this.confidenceScore < 80)
    );
  }

  get age(): number {
    return Date.now() - this.createdAt.getTime();
  }

  get ageInDays(): number {
    return Math.floor(this.age / (1000 * 60 * 60 * 24));
  }

  // Methods
  verify(verifiedBy: string, notes?: string): void {
    this.status = VerificationStatus.VERIFIED;
    this.verificationDate = new Date();
    this.verifiedBy = verifiedBy;
    if (notes) {
      this.verificationNotes = notes;
    }
  }

  markFailed(errorMessage: string, errors?: string[]): void {
    this.status = VerificationStatus.FAILED;
    this.errorMessage = errorMessage;
    if (errors) {
      this.validationErrors = errors;
    }
    this.verificationDate = new Date();
  }

  markPartial(warnings?: string[]): void {
    this.status = VerificationStatus.PARTIAL;
    if (warnings) {
      this.validationWarnings = warnings;
    }
    this.verificationDate = new Date();
  }

  updateVerifiedAddress(addressData: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
  }): void {
    this.verifiedAddressLine1 = addressData.addressLine1;
    this.verifiedAddressLine2 = addressData.addressLine2;
    this.verifiedCity = addressData.city;
    this.verifiedStateProvince = addressData.stateProvince;
    this.verifiedPostalCode = addressData.postalCode;
    this.verifiedCountry = addressData.country;
    this.verifiedCountryCode = addressData.countryCode;
  }

  updateGeolocation(
    latitude: number,
    longitude: number,
    timezone?: string,
  ): void {
    this.latitude = latitude;
    this.longitude = longitude;
    if (timezone) {
      this.timezone = timezone;
    }
  }

  updateQualityScores(
    qualityScore?: number,
    matchScore?: number,
    confidenceScore?: number,
  ): void {
    if (qualityScore !== undefined) {
      this.qualityScore = Math.max(0, Math.min(100, qualityScore));
    }
    if (matchScore !== undefined) {
      this.matchScore = Math.max(0, Math.min(100, matchScore));
    }
    if (confidenceScore !== undefined) {
      this.confidenceScore = Math.max(0, Math.min(100, confidenceScore));
    }
  }

  updateRiskScore(score: number, indicators?: string[]): void {
    this.riskScore = Math.max(0, Math.min(100, score));
    if (indicators) {
      this.riskIndicators = indicators;
    }
  }

  addValidationError(error: string): void {
    if (!this.validationErrors) {
      this.validationErrors = [];
    }
    if (!this.validationErrors.includes(error)) {
      this.validationErrors.push(error);
    }
  }

  addValidationWarning(warning: string): void {
    if (!this.validationWarnings) {
      this.validationWarnings = [];
    }
    if (!this.validationWarnings.includes(warning)) {
      this.validationWarnings.push(warning);
    }
  }

  addQualityIssue(issue: string): void {
    if (!this.qualityIssues) {
      this.qualityIssues = [];
    }
    if (!this.qualityIssues.includes(issue)) {
      this.qualityIssues.push(issue);
    }
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

  calculateDistance(lat: number, lon: number): number | null {
    if (!this.hasGeolocation) return null;

    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.toRadians(lat - this.latitude!);
    const dLon = this.toRadians(lon - this.longitude!);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.latitude!)) *
        Math.cos(this.toRadians(lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  isWithinRadius(lat: number, lon: number, radiusKm: number): boolean {
    const distance = this.calculateDistance(lat, lon);
    return distance !== null && distance <= radiusKm;
  }

  getAddressDifferences(): Array<{
    field: string;
    input: string;
    verified: string;
  }> {
    const differences: Array<{
      field: string;
      input: string;
      verified: string;
    }> = [];

    const comparisons = [
      {
        field: 'addressLine1',
        input: this.inputAddressLine1,
        verified: this.verifiedAddressLine1,
      },
      {
        field: 'addressLine2',
        input: this.inputAddressLine2 || '',
        verified: this.verifiedAddressLine2 || '',
      },
      { field: 'city', input: this.inputCity, verified: this.verifiedCity },
      {
        field: 'stateProvince',
        input: this.inputStateProvince || '',
        verified: this.verifiedStateProvince || '',
      },
      {
        field: 'postalCode',
        input: this.inputPostalCode,
        verified: this.verifiedPostalCode,
      },
      {
        field: 'country',
        input: this.inputCountry,
        verified: this.verifiedCountry,
      },
    ];

    for (const comp of comparisons) {
      if (
        comp.verified &&
        comp.input.toLowerCase() !== comp.verified.toLowerCase()
      ) {
        differences.push(comp);
      }
    }

    return differences;
  }

  static createFromKycApplication(
    kycApplication: KYCApplication,
  ): Partial<AddressVerification> {
    return {
      kycApplicationId: kycApplication.id,
      inputAddressLine1: kycApplication.addressLine1,
      inputAddressLine2: kycApplication.addressLine2,
      inputCity: kycApplication.city,
      inputStateProvince: kycApplication.stateProvince,
      inputPostalCode: kycApplication.postalCode,
      inputCountry: kycApplication.country,
      status: VerificationStatus.PENDING,
    };
  }
}
