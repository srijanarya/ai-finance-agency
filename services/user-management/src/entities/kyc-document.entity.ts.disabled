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

export enum DocumentType {
  IDENTITY = 'identity',
  ADDRESS_PROOF = 'address',
  INCOME_PROOF = 'income',
  BANK_STATEMENT = 'bank_statement',
  UTILITY_BILL = 'utility_bill',
  TAX_DOCUMENT = 'tax_document',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  VISA = 'visa',
  SELFIE = 'selfie',
  OTHER = 'other',
}

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum VerificationMethod {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  HYBRID = 'hybrid',
}

@Entity('kyc_documents')
@Index(['kycApplicationId'])
@Index(['documentType'])
@Index(['status'])
@Index(['uploadedAt'])
export class KYCDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'kyc_application_id' })
  @Index()
  kycApplicationId: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
  })
  @Index()
  documentType: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.UPLOADED,
  })
  @Index()
  status: DocumentStatus;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'original_file_name' })
  originalFileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_hash', nullable: true })
  fileHash?: string;

  @Column({ name: 'document_number', nullable: true })
  documentNumber?: string;

  @Column({ name: 'issuing_authority', nullable: true })
  issuingAuthority?: string;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'issuing_country', nullable: true })
  issuingCountry?: string;

  // OCR and extracted data
  @Column({ name: 'extracted_text', type: 'text', nullable: true })
  extractedText?: string;

  @Column({ name: 'extracted_data', type: 'simple-json', nullable: true })
  extractedData?: Record<string, any>;

  @Column({
    name: 'confidence_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  confidenceScore?: number;

  // Verification details
  @Column({
    name: 'verification_method',
    type: 'enum',
    enum: VerificationMethod,
    nullable: true,
  })
  verificationMethod?: VerificationMethod;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy?: string;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy?: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes?: string;

  // Security and compliance
  @Column({ name: 'is_encrypted', default: false })
  isEncrypted: boolean;

  @Column({ name: 'encryption_key_id', nullable: true })
  encryptionKeyId?: string;

  @Column({ name: 'access_log', type: 'simple-json', nullable: true })
  accessLog?: Array<{
    timestamp: string;
    userId: string;
    action: string;
    ipAddress?: string;
  }>;

  @Column({ name: 'retention_policy', nullable: true })
  retentionPolicy?: string;

  @Column({ name: 'delete_after', type: 'timestamp', nullable: true })
  deleteAfter?: Date;

  // Quality checks
  @Column({
    name: 'quality_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  qualityScore?: number;

  @Column({ name: 'quality_issues', type: 'simple-array', nullable: true })
  qualityIssues?: string[];

  @Column({ name: 'is_blurry', nullable: true })
  isBlurry?: boolean;

  @Column({ name: 'is_readable', nullable: true })
  isReadable?: boolean;

  @Column({ name: 'has_tampering', nullable: true })
  hasTampering?: boolean;

  // Additional metadata
  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'uploaded_at', type: 'timestamp' })
  @Index()
  uploadedAt: Date;

  // Relations
  @ManyToOne(() => KYCApplication, (application) => application.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kyc_application_id' })
  kycApplication: KYCApplication;

  // Virtual properties
  get isVerified(): boolean {
    return this.status === DocumentStatus.VERIFIED;
  }

  get isRejected(): boolean {
    return this.status === DocumentStatus.REJECTED;
  }

  get isExpired(): boolean {
    if (this.status === DocumentStatus.EXPIRED) return true;
    if (this.expiryDate) {
      return this.expiryDate < new Date();
    }
    return false;
  }

  get fileSizeInMB(): number {
    return this.fileSize / (1024 * 1024);
  }

  get age(): number {
    return Date.now() - this.uploadedAt.getTime();
  }

  get ageInDays(): number {
    return Math.floor(this.age / (1000 * 60 * 60 * 24));
  }

  get isProcessing(): boolean {
    return this.status === DocumentStatus.PROCESSING;
  }

  get needsManualReview(): boolean {
    return (
      (this.qualityScore !== null && this.qualityScore < 80) ||
      (this.confidenceScore !== null && this.confidenceScore < 85) ||
      (this.qualityIssues && this.qualityIssues.length > 0) ||
      this.hasTampering === true
    );
  }

  get daysUntilExpiry(): number {
    if (!this.expiryDate) return -1;
    return Math.ceil(
      (this.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
  }

  get isExpiringSoon(): boolean {
    return this.daysUntilExpiry > 0 && this.daysUntilExpiry <= 30;
  }

  // Methods
  verify(verifiedBy: string, method: VerificationMethod, notes?: string): void {
    if (this.status === DocumentStatus.VERIFIED) {
      throw new Error('Document is already verified');
    }
    this.status = DocumentStatus.VERIFIED;
    this.verifiedAt = new Date();
    this.verifiedBy = verifiedBy;
    this.verificationMethod = method;
    if (notes) {
      this.verificationNotes = notes;
    }
    this.logAccess(verifiedBy, 'verified');
  }

  reject(rejectedBy: string, reason: string, notes?: string): void {
    if (this.status === DocumentStatus.REJECTED) {
      throw new Error('Document is already rejected');
    }
    this.status = DocumentStatus.REJECTED;
    this.rejectedAt = new Date();
    this.rejectedBy = rejectedBy;
    this.rejectionReason = reason;
    if (notes) {
      this.verificationNotes = notes;
    }
    this.logAccess(rejectedBy, 'rejected');
  }

  markExpired(): void {
    this.status = DocumentStatus.EXPIRED;
  }

  updateQualityCheck(score: number, issues?: string[]): void {
    this.qualityScore = Math.max(0, Math.min(100, score));
    this.qualityIssues = issues || [];

    // Set quality flags based on score
    this.isBlurry = issues?.includes('blurry') || false;
    this.isReadable = score >= 70;
    this.hasTampering = issues?.includes('tampering') || false;
  }

  setOcrResults(
    text: string,
    data: Record<string, any>,
    confidence: number,
  ): void {
    this.extractedText = text;
    this.extractedData = data;
    this.confidenceScore = Math.max(0, Math.min(100, confidence));
  }

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

  logAccess(userId: string, action: string, ipAddress?: string): void {
    if (!this.accessLog) {
      this.accessLog = [];
    }
    this.accessLog.push({
      timestamp: new Date().toISOString(),
      userId,
      action,
      ipAddress,
    });
  }

  encrypt(keyId: string): void {
    this.isEncrypted = true;
    this.encryptionKeyId = keyId;
  }

  setRetentionPolicy(policyName: string, deleteAfterDays: number): void {
    this.retentionPolicy = policyName;
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() + deleteAfterDays);
    this.deleteAfter = deleteDate;
  }

  shouldBeDeleted(): boolean {
    return this.deleteAfter ? this.deleteAfter < new Date() : false;
  }

  getFileExtension(): string {
    return this.originalFileName.split('.').pop()?.toLowerCase() || '';
  }

  isImageFile(): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(this.getFileExtension());
  }

  isPdfFile(): boolean {
    return this.getFileExtension() === 'pdf';
  }

  static getSupportedMimeTypes(): string[] {
    return [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'application/pdf',
      'image/tiff',
    ];
  }

  static getMaxFileSizeInMB(): number {
    return 10; // 10MB limit
  }

  static getDocumentTypeDisplayName(type: DocumentType): string {
    const displayNames: Record<DocumentType, string> = {
      [DocumentType.IDENTITY]: 'Identity Document',
      [DocumentType.ADDRESS_PROOF]: 'Proof of Address',
      [DocumentType.INCOME_PROOF]: 'Proof of Income',
      [DocumentType.BANK_STATEMENT]: 'Bank Statement',
      [DocumentType.UTILITY_BILL]: 'Utility Bill',
      [DocumentType.TAX_DOCUMENT]: 'Tax Document',
      [DocumentType.PASSPORT]: 'Passport',
      [DocumentType.DRIVERS_LICENSE]: "Driver's License",
      [DocumentType.NATIONAL_ID]: 'National ID',
      [DocumentType.VISA]: 'Visa',
      [DocumentType.SELFIE]: 'Selfie/Photo',
      [DocumentType.OTHER]: 'Other Document',
    };
    return displayNames[type] || type;
  }
}
