import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AlertType,
  AlertSeverity,
  AlertStatus,
  AlertPriority,
} from '../entities/risk-alert.entity';

export class TriggerConditionsDto {
  @ApiProperty({ description: 'Rule that triggered the alert', example: 'var_limit_breach' })
  @IsString()
  rule: string;

  @ApiProperty({ description: 'Threshold value that was breached', example: 50000 })
  threshold: any;

  @ApiProperty({ description: 'Actual value that triggered the alert', example: 75000 })
  actualValue: any;

  @ApiProperty({
    description: 'Comparison operator',
    enum: ['gt', 'gte', 'lt', 'lte', 'eq', 'ne'],
    example: 'gt',
  })
  @IsEnum(['gt', 'gte', 'lt', 'lte', 'eq', 'ne'])
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';

  @ApiProperty({ description: 'Time window for the condition', example: '1h' })
  @IsString()
  timeWindow: string;
}

export class ImpactAssessmentDto {
  @ApiProperty({ description: 'Financial impact in base currency', example: 25000 })
  @IsNumber()
  @Min(0)
  financialImpact: number;

  @ApiProperty({ description: 'Risk exposure level (0-100)', example: 75 })
  @IsNumber()
  @Min(0)
  @Max(100)
  riskExposure: number;

  @ApiProperty({ description: 'Number of affected positions', example: 5 })
  @IsNumber()
  @Min(0)
  affectedPositions: number;

  @ApiProperty({ description: 'Potential loss estimate', example: 10000 })
  @IsNumber()
  @Min(0)
  potentialLoss: number;

  @ApiProperty({ description: 'Estimated time to resolution', example: '2-4 hours' })
  @IsString()
  timeToResolution: string;
}

export class RelatedEntitiesDto {
  @ApiProperty({ description: 'Related trade IDs', example: ['trade_123', 'trade_456'] })
  @IsArray()
  @IsString({ each: true })
  trades: string[];

  @ApiProperty({ description: 'Related position IDs', example: ['pos_789', 'pos_101112'] })
  @IsArray()
  @IsString({ each: true })
  positions: string[];

  @ApiProperty({ description: 'Related account IDs', example: ['acc_123'] })
  @IsArray()
  @IsString({ each: true })
  accounts: string[];

  @ApiProperty({ description: 'Related alert IDs', example: ['alert_456'] })
  @IsArray()
  @IsString({ each: true })
  alerts: string[];
}

export class EscalationRulesDto {
  @ApiProperty({ description: 'Minutes after which to escalate', example: 30 })
  @IsNumber()
  @Min(1)
  escalateAfterMinutes: number;

  @ApiProperty({ description: 'Users to escalate to', example: ['manager_123', 'supervisor_456'] })
  @IsArray()
  @IsString({ each: true })
  escalateTo: string[];

  @ApiProperty({ enum: AlertSeverity, description: 'Severity level after escalation' })
  @IsEnum(AlertSeverity)
  escalationSeverity: AlertSeverity;
}

export class CreateRiskAlertDto {
  @ApiPropertyOptional({ description: 'User ID associated with the alert', example: 'user123' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Account ID associated with the alert', example: 'account456' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ description: 'Trade ID if trade-specific alert', example: 'trade789' })
  @IsOptional()
  @IsString()
  tradeId?: string;

  @ApiPropertyOptional({ description: 'Portfolio ID if portfolio-specific alert', example: 'portfolio123' })
  @IsOptional()
  @IsString()
  portfolioId?: string;

  @ApiProperty({ enum: AlertType, description: 'Type of alert' })
  @IsEnum(AlertType)
  alertType: AlertType;

  @ApiProperty({ enum: AlertSeverity, description: 'Alert severity level' })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ enum: AlertPriority, description: 'Alert priority for handling' })
  @IsEnum(AlertPriority)
  priority: AlertPriority;

  @ApiProperty({ description: 'Alert title', example: 'VaR Limit Breach Detected' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed alert description', example: 'Portfolio VaR exceeded daily limit by 25%' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Conditions that triggered the alert', type: TriggerConditionsDto })
  @ValidateNested()
  @Type(() => TriggerConditionsDto)
  triggerConditions: TriggerConditionsDto;

  @ApiProperty({ description: 'Additional context data', example: {} })
  contextData: Record<string, any>;

  @ApiProperty({ description: 'Recommended immediate actions', example: ['Reduce position sizes', 'Review risk limits'] })
  @IsArray()
  @IsString({ each: true })
  recommendedActions: string[];

  @ApiProperty({ description: 'Actions taken automatically', example: ['Trading temporarily suspended'] })
  @IsArray()
  @IsString({ each: true })
  automaticActions: string[];

  @ApiProperty({ description: 'Impact assessment', type: ImpactAssessmentDto })
  @ValidateNested()
  @Type(() => ImpactAssessmentDto)
  impactAssessment: ImpactAssessmentDto;

  @ApiProperty({ description: 'Related entities', type: RelatedEntitiesDto })
  @ValidateNested()
  @Type(() => RelatedEntitiesDto)
  relatedEntities: RelatedEntitiesDto;

  @ApiProperty({ description: 'Notification channels to use', example: ['email', 'dashboard', 'sms'] })
  @IsArray()
  @IsString({ each: true })
  notificationChannels: string[];

  @ApiPropertyOptional({ description: 'Auto-escalation rules', type: EscalationRulesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EscalationRulesDto)
  escalationRules?: EscalationRulesDto;

  @ApiPropertyOptional({ description: 'Alert expiry time', example: '2024-01-16T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}

export class UpdateRiskAlertDto {
  @ApiPropertyOptional({ enum: AlertStatus, description: 'Update alert status' })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiPropertyOptional({ enum: AlertSeverity, description: 'Update alert severity' })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional({ enum: AlertPriority, description: 'Update alert priority' })
  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;

  @ApiPropertyOptional({ description: 'Update alert title', example: 'Updated: VaR Limit Breach' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Update alert description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional recommended actions' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalRecommendedActions?: string[];

  @ApiPropertyOptional({ description: 'Update context data' })
  @IsOptional()
  contextData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Update expiry time', example: '2024-01-17T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}

export class RiskAlertResponseDto {
  @ApiProperty({ description: 'Alert ID', example: 'alert_123456' })
  id: string;

  @ApiPropertyOptional({ description: 'User ID associated with alert', example: 'user123' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Account ID associated with alert', example: 'account456' })
  accountId?: string;

  @ApiPropertyOptional({ description: 'Trade ID if applicable', example: 'trade789' })
  tradeId?: string;

  @ApiPropertyOptional({ description: 'Portfolio ID if applicable', example: 'portfolio123' })
  portfolioId?: string;

  @ApiProperty({ enum: AlertType, description: 'Alert type' })
  alertType: AlertType;

  @ApiProperty({ enum: AlertSeverity, description: 'Alert severity' })
  severity: AlertSeverity;

  @ApiProperty({ enum: AlertPriority, description: 'Alert priority' })
  priority: AlertPriority;

  @ApiProperty({ enum: AlertStatus, description: 'Current alert status' })
  status: AlertStatus;

  @ApiProperty({ description: 'Alert title', example: 'VaR Limit Breach Detected' })
  title: string;

  @ApiProperty({ description: 'Alert description', example: 'Portfolio VaR exceeded daily limit by 25%' })
  description: string;

  @ApiProperty({ description: 'Trigger conditions', type: TriggerConditionsDto })
  triggerConditions: TriggerConditionsDto;

  @ApiProperty({ description: 'Context data', example: {} })
  contextData: Record<string, any>;

  @ApiProperty({ description: 'Recommended actions', example: ['Reduce position sizes'] })
  recommendedActions: string[];

  @ApiProperty({ description: 'Automatic actions taken', example: ['Trading suspended'] })
  automaticActions: string[];

  @ApiProperty({ description: 'Impact assessment', type: ImpactAssessmentDto })
  impactAssessment: ImpactAssessmentDto;

  @ApiProperty({ description: 'Related entities', type: RelatedEntitiesDto })
  relatedEntities: RelatedEntitiesDto;

  @ApiPropertyOptional({ description: 'Who acknowledged the alert', example: 'trader_123' })
  acknowledgedBy?: string;

  @ApiPropertyOptional({ description: 'When alert was acknowledged', example: '2024-01-15T10:05:00Z' })
  acknowledgedAt?: Date;

  @ApiPropertyOptional({ description: 'Acknowledgment comments', example: 'Investigating the breach' })
  acknowledgmentComments?: string;

  @ApiPropertyOptional({ description: 'Who is assigned to handle the alert', example: 'risk_manager_456' })
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'When alert was assigned', example: '2024-01-15T10:10:00Z' })
  assignedAt?: Date;

  @ApiPropertyOptional({ description: 'Who resolved the alert', example: 'risk_manager_456' })
  resolvedBy?: string;

  @ApiPropertyOptional({ description: 'When alert was resolved', example: '2024-01-15T11:30:00Z' })
  resolvedAt?: Date;

  @ApiPropertyOptional({ description: 'Resolution details', example: 'Positions reduced to acceptable levels' })
  resolutionDetails?: string;

  @ApiPropertyOptional({ description: 'Actions taken to resolve', example: ['Reduced AAPL position by 50%'] })
  resolutionActions?: string[];

  @ApiProperty({ description: 'Whether alert is escalated', example: false })
  isEscalated: boolean;

  @ApiPropertyOptional({ description: 'When alert was escalated', example: '2024-01-15T10:45:00Z' })
  escalatedAt?: Date;

  @ApiPropertyOptional({ description: 'Escalation rules', type: EscalationRulesDto })
  escalationRules?: EscalationRulesDto;

  @ApiProperty({ description: 'Notification channels used', example: ['email', 'dashboard'] })
  notificationChannels: string[];

  @ApiPropertyOptional({ description: 'Alert expiry time', example: '2024-01-16T10:00:00Z' })
  expiresAt?: Date;

  @ApiProperty({ description: 'Whether alert was auto-generated', example: true })
  isAutoGenerated: boolean;

  @ApiProperty({ description: 'When alert was created', example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'When alert was last updated', example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}

// Alerting Rules DTOs
export class AlertingConditionDto {
  @ApiPropertyOptional({ description: 'Metric to evaluate', example: 'portfolio_var' })
  @IsOptional()
  @IsString()
  metric?: string;

  @ApiProperty({
    description: 'Comparison operator',
    enum: ['gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'contains', 'not_contains'],
    example: 'gt',
  })
  @IsEnum(['gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'contains', 'not_contains'])
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'contains' | 'not_contains';

  @ApiProperty({ description: 'Threshold value', example: 50000 })
  value: any;

  @ApiPropertyOptional({ description: 'Time window for evaluation', example: '1d' })
  @IsOptional()
  @IsString()
  timeWindow?: string;

  @ApiPropertyOptional({
    description: 'Aggregation method',
    enum: ['sum', 'avg', 'max', 'min', 'count'],
    example: 'max',
  })
  @IsOptional()
  @IsEnum(['sum', 'avg', 'max', 'min', 'count'])
  aggregation?: 'sum' | 'avg' | 'max' | 'min' | 'count';
}

export class AlertingActionDto {
  @ApiProperty({
    description: 'Action type',
    enum: ['notify', 'block', 'limit', 'escalate', 'custom'],
    example: 'notify',
  })
  @IsEnum(['notify', 'block', 'limit', 'escalate', 'custom'])
  type: 'notify' | 'block' | 'limit' | 'escalate' | 'custom';

  @ApiProperty({ description: 'Action parameters', example: {} })
  parameters: Record<string, any>;
}

export class CreateAlertingRuleDto {
  @ApiProperty({ description: 'Rule name', example: 'VaR Limit Breach Rule' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Rule description', example: 'Alert when portfolio VaR exceeds limits' })
  @IsString()
  description: string;

  @ApiProperty({ enum: AlertType, description: 'Alert type to generate' })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiProperty({ enum: AlertSeverity, description: 'Alert severity' })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ enum: AlertPriority, description: 'Alert priority' })
  @IsEnum(AlertPriority)
  priority: AlertPriority;

  @ApiProperty({ description: 'Evaluation conditions', type: [AlertingConditionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlertingConditionDto)
  conditions: AlertingConditionDto[];

  @ApiProperty({ description: 'Actions to execute when triggered', type: [AlertingActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlertingActionDto)
  actions: AlertingActionDto[];

  @ApiProperty({ description: 'Notification channels to use', example: ['email', 'dashboard'] })
  @IsArray()
  @IsString({ each: true })
  channels: string[];

  @ApiProperty({ description: 'Cooldown period in minutes', example: 60 })
  @IsNumber()
  @Min(1)
  cooldownMinutes: number;

  @ApiProperty({ description: 'Whether rule is active', example: true })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'Rule scope',
    enum: ['user', 'account', 'portfolio', 'global'],
    example: 'portfolio',
  })
  @IsEnum(['user', 'account', 'portfolio', 'global'])
  scope: 'user' | 'account' | 'portfolio' | 'global';

  @ApiPropertyOptional({ description: 'Target user IDs (if user scope)', example: ['user123'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetUsers?: string[];

  @ApiPropertyOptional({ description: 'Target account IDs (if account scope)', example: ['account456'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetAccounts?: string[];
}

export class UpdateAlertingRuleDto {
  @ApiPropertyOptional({ description: 'Update rule name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Update rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: AlertSeverity, description: 'Update alert severity' })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional({ enum: AlertPriority, description: 'Update alert priority' })
  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;

  @ApiPropertyOptional({ description: 'Update evaluation conditions', type: [AlertingConditionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlertingConditionDto)
  conditions?: AlertingConditionDto[];

  @ApiPropertyOptional({ description: 'Update actions', type: [AlertingActionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlertingActionDto)
  actions?: AlertingActionDto[];

  @ApiPropertyOptional({ description: 'Update notification channels' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];

  @ApiPropertyOptional({ description: 'Update cooldown period in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  cooldownMinutes?: number;

  @ApiPropertyOptional({ description: 'Update active status' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}