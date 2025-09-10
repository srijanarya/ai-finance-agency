import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ComplianceType {
  KYC = 'KYC', // Know Your Customer
  AML = 'AML', // Anti-Money Laundering
  CDD = 'CDD', // Customer Due Diligence
  EDD = 'EDD', // Enhanced Due Diligence
  SANCTIONS = 'SANCTIONS',
  PEP = 'PEP', // Politically Exposed Person
  TRADE_SURVEILLANCE = 'TRADE_SURVEILLANCE',
  POSITION_LIMITS = 'POSITION_LIMITS',
  MARKET_ABUSE = 'MARKET_ABUSE',
  INSIDER_TRADING = 'INSIDER_TRADING',
  MIFID_II = 'MIFID_II',
  GDPR = 'GDPR',
  SOX = 'SOX', // Sarbanes-Oxley
  DODD_FRANK = 'DODD_FRANK',
}

export enum ComplianceStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW',
  ESCALATED = 'ESCALATED',
  EXPIRED = 'EXPIRED',
}

export enum ComplianceSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  MINOR = 'MINOR',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL',
  REGULATORY_BREACH = 'REGULATORY_BREACH',
}

@Entity('compliance_checks')
@Index(['userId', 'complianceType', 'status'])
@Index(['tradeId'])
@Index(['status', 'severity'])
@Index(['createdAt', 'complianceType'])
export class ComplianceCheck {
  @ApiProperty({ description: 'Unique identifier for the compliance check' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID being checked' })
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Trading account ID if applicable' })
  @Column({ name: 'account_id', nullable: true })
  accountId: string;

  @ApiProperty({ description: 'Trade ID if this is trade-specific compliance' })
  @Column({ name: 'trade_id', nullable: true })
  @Index()
  tradeId: string;

  @ApiProperty({ enum: ComplianceType, description: 'Type of compliance check' })
  @Column({
    type: 'enum',
    enum: ComplianceType,
    name: 'compliance_type',
  })
  complianceType: ComplianceType;

  @ApiProperty({ enum: ComplianceStatus, description: 'Compliance check status' })
  @Column({
    type: 'enum',
    enum: ComplianceStatus,
    default: ComplianceStatus.PENDING,
  })
  @Index()
  status: ComplianceStatus;

  @ApiProperty({ enum: ComplianceSeverity, description: 'Severity level' })
  @Column({
    type: 'enum',
    enum: ComplianceSeverity,
    default: ComplianceSeverity.INFO,
  })
  severity: ComplianceSeverity;

  @ApiProperty({ description: 'Check parameters and configuration' })
  @Column({ type: 'jsonb', name: 'check_params' })
  checkParams: Record<string, any>;

  @ApiProperty({ description: 'Detailed check results' })
  @Column({ type: 'jsonb', name: 'check_results' })
  checkResults: {
    passed: boolean;
    score: number;
    flags: Array<{
      flag: string;
      severity: string;
      description: string;
      value: any;
      threshold: any;
    }>;
    evidence: Record<string, any>;
    externalSources: string[];
  };

  @ApiProperty({ description: 'Compliance rules that were evaluated' })
  @Column({ type: 'simple-array', name: 'rules_evaluated' })
  rulesEvaluated: string[];

  @ApiProperty({ description: 'Rules that failed' })
  @Column({ type: 'simple-array', name: 'failed_rules' })
  failedRules: string[];

  @ApiProperty({ description: 'Regulatory framework references' })
  @Column({ type: 'simple-array', name: 'regulatory_refs' })
  regulatoryRefs: string[];

  @ApiProperty({ description: 'Risk indicators found' })
  @Column({ type: 'jsonb', name: 'risk_indicators' })
  riskIndicators: Array<{
    type: string;
    severity: string;
    description: string;
    value: any;
    recommendedAction: string;
  }>;

  @ApiProperty({ description: 'Required remedial actions' })
  @Column({ type: 'simple-array', name: 'remedial_actions' })
  remedialActions: string[];

  @ApiProperty({ description: 'Next review date' })
  @Column({ name: 'next_review_date', nullable: true })
  nextReviewDate: Date;

  @ApiProperty({ description: 'External API responses used' })
  @Column({ type: 'jsonb', name: 'external_responses', nullable: true })
  externalResponses: Record<string, any>;

  @ApiProperty({ description: 'Compliance officer who reviewed' })
  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @ApiProperty({ description: 'Review timestamp' })
  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @ApiProperty({ description: 'Reviewer comments' })
  @Column({ name: 'review_comments', nullable: true, type: 'text' })
  reviewComments: string;

  @ApiProperty({ description: 'Whether this requires escalation' })
  @Column({ name: 'requires_escalation', default: false })
  requiresEscalation: boolean;

  @ApiProperty({ description: 'Escalation reason' })
  @Column({ name: 'escalation_reason', nullable: true })
  escalationReason: string;

  @ApiProperty({ description: 'Escalated to (compliance officer/regulator)' })
  @Column({ name: 'escalated_to', nullable: true })
  escalatedTo: string;

  @ApiProperty({ description: 'Escalation timestamp' })
  @Column({ name: 'escalated_at', nullable: true })
  escalatedAt: Date;

  @ApiProperty({ description: 'Check expiry timestamp' })
  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  @Column({ name: 'processing_time_ms', nullable: true })
  processingTimeMs: number;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'When the check was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'When the check was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}