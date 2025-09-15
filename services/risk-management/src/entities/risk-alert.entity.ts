import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AlertType {
  RISK_LIMIT_BREACH = 'RISK_LIMIT_BREACH',
  POSITION_CONCENTRATION = 'POSITION_CONCENTRATION',
  DRAWDOWN_THRESHOLD = 'DRAWDOWN_THRESHOLD',
  VOLATILITY_SPIKE = 'VOLATILITY_SPIKE',
  LIQUIDITY_RISK = 'LIQUIDITY_RISK',
  COUNTERPARTY_RISK = 'COUNTERPARTY_RISK',
  MARGIN_CALL = 'MARGIN_CALL',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  REGULATORY_BREACH = 'REGULATORY_BREACH',
  SYSTEM_ANOMALY = 'SYSTEM_ANOMALY',
  FRAUD_DETECTION = 'FRAUD_DETECTION',
  MARKET_DISRUPTION = 'MARKET_DISRUPTION',
  CORRELATION_BREAKDOWN = 'CORRELATION_BREAKDOWN',
  VAR_BREACH = 'VAR_BREACH', // Value at Risk
  STRESS_TEST_FAILURE = 'STRESS_TEST_FAILURE',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
}

export enum AlertSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
  ESCALATED = 'ESCALATED',
  EXPIRED = 'EXPIRED',
}

export enum AlertPriority {
  P1 = 'P1', // Immediate action required
  P2 = 'P2', // Action required within 1 hour
  P3 = 'P3', // Action required within 4 hours
  P4 = 'P4', // Action required within 24 hours
  P5 = 'P5', // Informational
}

@Entity('risk_alerts')
@Index(['userId', 'alertType', 'status'])
@Index(['severity', 'status', 'createdAt'])
@Index(['priority', 'status'])
@Index(['acknowledgedBy', 'acknowledgedAt'])
export class RiskAlert {
  @ApiProperty({ description: 'Unique identifier for the risk alert' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID associated with the alert' })
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Trading account ID if applicable' })
  @Column({ name: 'account_id', nullable: true })
  accountId: string;

  @ApiProperty({ description: 'Trade ID if this is trade-specific' })
  @Column({ name: 'trade_id', nullable: true })
  tradeId: string;

  @ApiProperty({ description: 'Portfolio ID if applicable' })
  @Column({ name: 'portfolio_id', nullable: true })
  portfolioId: string;

  @ApiProperty({ enum: AlertType, description: 'Type of risk alert' })
  @Column({
    type: 'enum',
    enum: AlertType,
    name: 'alert_type',
  })
  alertType: AlertType;

  @ApiProperty({ enum: AlertSeverity, description: 'Alert severity level' })
  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.INFO,
  })
  severity: AlertSeverity;

  @ApiProperty({ enum: AlertPriority, description: 'Alert priority for handling' })
  @Column({
    type: 'enum',
    enum: AlertPriority,
    default: AlertPriority.P5,
  })
  priority: AlertPriority;

  @ApiProperty({ enum: AlertStatus, description: 'Current alert status' })
  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  @Index()
  status: AlertStatus;

  @ApiProperty({ description: 'Alert title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Detailed alert description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Alert trigger conditions' })
  @Column({ type: 'jsonb', name: 'trigger_conditions' })
  triggerConditions: {
    rule: string;
    threshold: any;
    actualValue: any;
    operator: string;
    timeWindow: string;
  };

  @ApiProperty({ description: 'Alert context data' })
  @Column({ type: 'jsonb', name: 'context_data' })
  contextData: Record<string, any>;

  @ApiProperty({ description: 'Recommended immediate actions' })
  @Column({ type: 'simple-array', name: 'recommended_actions' })
  recommendedActions: string[];

  @ApiProperty({ description: 'Automatic actions taken' })
  @Column({ type: 'simple-array', name: 'automatic_actions' })
  automaticActions: string[];

  @ApiProperty({ description: 'Impact assessment' })
  @Column({ type: 'jsonb', name: 'impact_assessment' })
  impactAssessment: {
    financialImpact: number;
    riskExposure: number;
    affectedPositions: number;
    potentialLoss: number;
    timeToResolution: string;
  };

  @ApiProperty({ description: 'Related entities (trades, positions, etc.)' })
  @Column({ type: 'jsonb', name: 'related_entities' })
  relatedEntities: {
    trades: string[];
    positions: string[];
    accounts: string[];
    alerts: string[];
  };

  @ApiProperty({ description: 'Who acknowledged the alert' })
  @Column({ name: 'acknowledged_by', nullable: true })
  acknowledgedBy: string;

  @ApiProperty({ description: 'When the alert was acknowledged' })
  @Column({ name: 'acknowledged_at', nullable: true })
  acknowledgedAt: Date;

  @ApiProperty({ description: 'Acknowledgment comments' })
  @Column({ name: 'acknowledgment_comments', nullable: true, type: 'text' })
  acknowledgmentComments: string;

  @ApiProperty({ description: 'Who is handling the alert' })
  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @ApiProperty({ description: 'When the alert was assigned' })
  @Column({ name: 'assigned_at', nullable: true })
  assignedAt: Date;

  @ApiProperty({ description: 'Who resolved the alert' })
  @Column({ name: 'resolved_by', nullable: true })
  resolvedBy: string;

  @ApiProperty({ description: 'When the alert was resolved' })
  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @ApiProperty({ description: 'Resolution details' })
  @Column({ name: 'resolution_details', nullable: true, type: 'text' })
  resolutionDetails: string;

  @ApiProperty({ description: 'Actions taken to resolve' })
  @Column({ type: 'simple-array', name: 'resolution_actions', nullable: true })
  resolutionActions: string[];

  @ApiProperty({ description: 'Alert expiry timestamp' })
  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @ApiProperty({ description: 'Whether alert was auto-generated' })
  @Column({ name: 'is_auto_generated', default: true })
  isAutoGenerated: boolean;

  @ApiProperty({ description: 'Auto-escalation rules' })
  @Column({ type: 'jsonb', name: 'escalation_rules', nullable: true })
  escalationRules: {
    escalateAfterMinutes: number;
    escalateTo: string[];
    escalationSeverity: AlertSeverity;
  };

  @ApiProperty({ description: 'Whether alert has been escalated' })
  @Column({ name: 'is_escalated', default: false })
  isEscalated: boolean;

  @ApiProperty({ description: 'When the alert was escalated' })
  @Column({ name: 'escalated_at', nullable: true })
  escalatedAt: Date;

  @ApiProperty({ description: 'Notification channels used' })
  @Column({ type: 'simple-array', name: 'notification_channels' })
  notificationChannels: string[]; // email, sms, slack, dashboard

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'When the alert was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'When the alert was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}