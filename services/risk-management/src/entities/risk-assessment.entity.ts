import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum RiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AssessmentType {
  TRADE_PRE_EXECUTION = 'TRADE_PRE_EXECUTION',
  TRADE_POST_EXECUTION = 'TRADE_POST_EXECUTION',
  PORTFOLIO_DAILY = 'PORTFOLIO_DAILY',
  PORTFOLIO_REALTIME = 'PORTFOLIO_REALTIME',
  ACCOUNT_OPENING = 'ACCOUNT_OPENING',
  POSITION_MONITORING = 'POSITION_MONITORING',
  MARKET_EVENT = 'MARKET_EVENT',
}

export enum AssessmentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ESCALATED = 'ESCALATED',
}

@Entity('risk_assessments')
@Index(['userId', 'assessmentType', 'createdAt'])
@Index(['tradeId'])
@Index(['portfolioId'])
@Index(['riskLevel', 'status'])
export class RiskAssessment {
  @ApiProperty({ description: 'Unique identifier for the risk assessment' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID associated with the assessment' })
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Trading account ID if applicable' })
  @Column({ name: 'account_id', nullable: true })
  accountId: string;

  @ApiProperty({ description: 'Trade ID if this is a trade-specific assessment' })
  @Column({ name: 'trade_id', nullable: true })
  @Index()
  tradeId: string;

  @ApiProperty({ description: 'Portfolio ID if this is a portfolio assessment' })
  @Column({ name: 'portfolio_id', nullable: true })
  portfolioId: string;

  @ApiProperty({ enum: AssessmentType, description: 'Type of risk assessment' })
  @Column({
    type: 'enum',
    enum: AssessmentType,
    name: 'assessment_type',
  })
  assessmentType: AssessmentType;

  @ApiProperty({ enum: RiskLevel, description: 'Calculated risk level' })
  @Column({
    type: 'enum',
    enum: RiskLevel,
    name: 'risk_level',
  })
  @Index()
  riskLevel: RiskLevel;

  @ApiProperty({ description: 'Numerical risk score (0-100)' })
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'risk_score' })
  riskScore: number;

  @ApiProperty({ enum: AssessmentStatus, description: 'Assessment status' })
  @Column({
    type: 'enum',
    enum: AssessmentStatus,
    default: AssessmentStatus.PENDING,
  })
  status: AssessmentStatus;

  @ApiProperty({ description: 'Assessment parameters used' })
  @Column({ type: 'jsonb', name: 'assessment_params' })
  assessmentParams: Record<string, any>;

  @ApiProperty({ description: 'Detailed assessment results' })
  @Column({ type: 'jsonb', name: 'assessment_results' })
  assessmentResults: {
    factors: Array<{
      factor: string;
      value: number;
      weight: number;
      contribution: number;
      description: string;
    }>;
    recommendations: string[];
    warnings: string[];
    metrics: Record<string, number>;
  };

  @ApiProperty({ description: 'Risk factors that contributed to the score' })
  @Column({ type: 'simple-array', name: 'risk_factors' })
  riskFactors: string[];

  @ApiProperty({ description: 'Recommended actions' })
  @Column({ type: 'simple-array', name: 'recommendations' })
  recommendations: string[];

  @ApiProperty({ description: 'Whether the assessment requires manual review' })
  @Column({ name: 'requires_review', default: false })
  requiresReview: boolean;

  @ApiProperty({ description: 'Reviewer ID if manually reviewed' })
  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @ApiProperty({ description: 'Review timestamp' })
  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @ApiProperty({ description: 'Review comments' })
  @Column({ name: 'review_comments', nullable: true, type: 'text' })
  reviewComments: string;

  @ApiProperty({ description: 'Assessment processing time in milliseconds' })
  @Column({ name: 'processing_time_ms', nullable: true })
  processingTimeMs: number;

  @ApiProperty({ description: 'AI model version used for assessment' })
  @Column({ name: 'model_version', nullable: true })
  modelVersion: string;

  @ApiProperty({ description: 'Assessment expiry timestamp' })
  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'When the assessment was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'When the assessment was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}