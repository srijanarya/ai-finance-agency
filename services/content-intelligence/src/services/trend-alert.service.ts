/**
 * Trend Alert System Service
 * 
 * Intelligent notification and alert management system for trends.
 * Features:
 * - Intelligent alert generation with context awareness
 * - Threshold-based notifications with dynamic thresholds
 * - Trend emergence detection with early warning system
 * - Custom alert rules engine with complex logic
 * - Alert fatigue prevention and optimization
 * - Multi-channel notification delivery
 * - Alert prioritization and escalation
 * - Personalized alert preferences
 * - Real-time and batch alert processing
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';

// Enums and Types
enum AlertType {
  TREND_EMERGENCE = 'trend_emergence',
  TREND_STRENGTHENING = 'trend_strengthening',
  TREND_WEAKENING = 'trend_weakening',
  TREND_REVERSAL = 'trend_reversal',
  THRESHOLD_BREACH = 'threshold_breach',
  ANOMALY_DETECTED = 'anomaly_detected',
  PATTERN_COMPLETION = 'pattern_completion',
  SENTIMENT_EXTREME = 'sentiment_extreme',
  VOLUME_SPIKE = 'volume_spike',
  CORRELATION_BREAK = 'correlation_break',
  VELOCITY_CHANGE = 'velocity_change',
  CONFLICT_DETECTED = 'conflict_detected'
}

enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent'
}

enum AlertStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
  EXPIRED = 'expired'
}

enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
  SLACK = 'slack',
  DISCORD = 'discord',
  TEAMS = 'teams',
  IN_APP = 'in_app'
}

enum AlertRuleOperator {
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  EQUAL = 'eq',
  NOT_EQUAL = 'ne',
  GREATER_EQUAL = 'gte',
  LESS_EQUAL = 'lte',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between'
}

// Interfaces
interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  userId?: string; // For user-specific rules
  
  // Rule conditions
  conditions: AlertCondition[];
  operator: 'AND' | 'OR'; // How to combine multiple conditions
  
  // Alert settings
  alertType: AlertType;
  priority: AlertPriority;
  channels: NotificationChannel[];
  
  // Filtering
  symbols: string[]; // Empty array means all symbols
  categories: string[];
  hierarchies: string[];
  timeframes: string[];
  
  // Throttling and fatigue prevention
  throttling: {
    enabled: boolean;
    interval: number; // seconds
    maxAlerts: number; // max alerts per interval
    cooldownPeriod: number; // seconds
  };
  
  // Scheduling
  schedule: {
    enabled: boolean;
    timezone: string;
    activeHours: { start: string; end: string }; // HH:MM format
    activeDays: number[]; // 0-6 (Sunday-Saturday)
    excludeHolidays: boolean;
  };
  
  // Escalation
  escalation: {
    enabled: boolean;
    delays: number[]; // seconds for each escalation level
    channels: NotificationChannel[][]; // channels for each escalation level
    acknowledgmentRequired: boolean;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
  
  // Performance metrics
  metrics: {
    totalTriggers: number;
    falsePositives: number;
    truePositives: number;
    acknowledgmentRate: number;
    averageResponseTime: number;
    effectiveness: number; // 0-1 score
  };
}

interface AlertCondition {
  id: string;
  field: string; // trend.strength, trend.confidence, etc.
  operator: AlertRuleOperator;
  value: any; // threshold value or array of values
  weight: number; // 0-1 weight for this condition
  
  // Advanced conditions
  timeWindow?: number; // seconds - condition must be true for this duration
  comparison?: {
    field: string;
    operator: AlertRuleOperator;
  };
  
  // Context conditions
  contextual?: {
    marketCondition?: string[];
    volatility?: string[];
    volume?: string[];
    sentiment?: string[];
  };
}

interface TrendAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  
  // Trigger information
  triggeredAt: Date;
  symbol: string;
  category: string;
  hierarchy: string;
  timeframe: string;
  
  // Alert content
  title: string;
  message: string;
  description: string;
  
  // Trend data
  trendData: {
    direction: string;
    strength: number;
    confidence: number;
    magnitude: number;
    duration: number;
    keyLevels: number[];
  };
  
  // Context
  context: {
    marketCondition: string;
    volatility: string;
    volume: string;
    sentiment: string;
    correlatedSymbols: string[];
    catalysts: string[];
  };
  
  // Supporting data
  supportingData: {
    charts?: string[]; // URLs to chart images
    data?: Record<string, any>;
    references?: string[];
    recommendations?: string[];
  };
  
  // Delivery tracking
  delivery: {
    channels: NotificationChannel[];
    attempts: Array<{
      channel: NotificationChannel;
      timestamp: Date;
      success: boolean;
      error?: string;
    }>;
    delivered: boolean;
    deliveredAt?: Date;
  };
  
  // User interaction
  interaction: {
    acknowledged: boolean;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
    feedback?: {
      useful: boolean;
      accuracy: number; // 1-5 rating
      comments: string;
    };
  };
  
  // Escalation tracking
  escalation: {
    level: number;
    escalatedAt?: Date;
    maxLevel: number;
    nextEscalationAt?: Date;
  };
  
  // Alert lifecycle
  lifecycle: {
    expiresAt: Date;
    suppressedUntil?: Date;
    retries: number;
    maxRetries: number;
  };
  
  metadata: Record<string, any>;
}

interface AlertThreshold {
  id: string;
  name: string;
  field: string;
  symbol?: string; // null for global thresholds
  
  // Static thresholds
  static: {
    enabled: boolean;
    value: number;
    operator: AlertRuleOperator;
  };
  
  // Dynamic thresholds
  dynamic: {
    enabled: boolean;
    baseValue: number;
    volatilityMultiplier: number;
    trendAdjustment: number;
    marketConditionAdjustment: Record<string, number>;
    timeOfDayAdjustment: Record<string, number>;
  };
  
  // Adaptive thresholds
  adaptive: {
    enabled: boolean;
    learningRate: number;
    lookbackPeriod: number; // hours
    confidenceInterval: number; // e.g., 0.95 for 95% CI
    minDataPoints: number;
  };
  
  // Current threshold value
  current: {
    value: number;
    calculatedAt: Date;
    method: 'static' | 'dynamic' | 'adaptive';
    confidence: number;
  };
  
  // Performance tracking
  performance: {
    triggers: number;
    falsePositives: number;
    missedEvents: number;
    accuracy: number;
    lastCalibration: Date;
  };
}

interface AlertBatch {
  id: string;
  createdAt: Date;
  processedAt?: Date;
  
  alerts: TrendAlert[];
  
  // Batch processing settings
  processing: {
    maxSize: number;
    maxAge: number; // seconds
    priority: AlertPriority;
    channels: NotificationChannel[];
  };
  
  // Deduplication
  deduplication: {
    enabled: boolean;
    window: number; // seconds
    criteria: string[]; // fields to check for duplicates
    strategy: 'merge' | 'skip' | 'replace';
  };
  
  // Delivery results
  results: {
    total: number;
    delivered: number;
    failed: number;
    suppressed: number;
    deduplicated: number;
  };
}

interface AlertAnalytics {
  timeframe: string;
  generatedAt: Date;
  
  // Volume metrics
  volume: {
    total: number;
    byType: Record<AlertType, number>;
    byPriority: Record<AlertPriority, number>;
    byStatus: Record<AlertStatus, number>;
    byChannel: Record<NotificationChannel, number>;
  };
  
  // Performance metrics
  performance: {
    averageResponseTime: number;
    acknowledgmentRate: number;
    resolutionRate: number;
    falsePositiveRate: number;
    effectivenessScore: number;
  };
  
  // Trend analysis
  trends: {
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
    performanceTrend: 'improving' | 'declining' | 'stable';
    topTriggers: Array<{ rule: string; count: number }>;
    topSymbols: Array<{ symbol: string; count: number }>;
    peakHours: number[];
  };
  
  // User engagement
  engagement: {
    activeUsers: number;
    topUsers: Array<{ userId: string; interactions: number }>;
    feedbackScore: number;
    customRulesCreated: number;
  };
  
  // Recommendations
  recommendations: {
    thresholdAdjustments: Array<{ threshold: string; suggestion: string }>;
    ruleOptimizations: Array<{ rule: string; suggestion: string }>;
    channelOptimizations: Array<{ channel: string; suggestion: string }>;
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: AlertType;
  channel: NotificationChannel;
  
  // Template content
  subject: string;
  body: string;
  htmlBody?: string;
  
  // Template variables
  variables: Array<{
    name: string;
    description: string;
    required: boolean;
    defaultValue?: any;
  }>;
  
  // Formatting options
  formatting: {
    includeCharts: boolean;
    includeData: boolean;
    includeRecommendations: boolean;
    includeContext: boolean;
    maxLength?: number;
  };
  
  // Localization
  localization: {
    enabled: boolean;
    languages: string[];
    defaultLanguage: string;
  };
}

@Injectable()
export class TrendAlertService implements OnModuleInit {
  private readonly logger = new Logger(TrendAlertService.name);
  private readonly redis: Redis;

  // In-memory data structures
  private readonly alertRules = new Map<string, AlertRule>();
  private readonly alertThresholds = new Map<string, AlertThreshold>();
  private readonly activeAlerts = new Map<string, TrendAlert>();
  private readonly alertBatches = new Map<string, AlertBatch>();
  private readonly notificationTemplates = new Map<string, NotificationTemplate>();
  
  // Alert processing queues
  private readonly realTimeQueue: TrendAlert[] = [];
  private readonly batchQueue: TrendAlert[] = [];
  private readonly escalationQueue: TrendAlert[] = [];

  // Configuration
  private readonly config = {
    // Processing settings
    realTimeProcessingInterval: 1000, // 1 second
    batchProcessingInterval: 60000, // 1 minute
    escalationCheckInterval: 30000, // 30 seconds
    
    // Alert limits
    maxAlertsPerUser: 1000,
    maxActiveAlerts: 10000,
    alertRetentionDays: 30,
    
    // Throttling defaults
    defaultThrottleInterval: 300, // 5 minutes
    defaultMaxAlerts: 5,
    defaultCooldownPeriod: 900, // 15 minutes
    
    // Batch processing
    maxBatchSize: 100,
    maxBatchAge: 300, // 5 minutes
    
    // Deduplication
    deduplicationWindow: 600, // 10 minutes
    
    // Performance
    maxRetries: 3,
    defaultTimeout: 30000, // 30 seconds
    
    // Fatigue prevention
    fatigueThreshold: 0.7, // 70% acknowledgment rate threshold
    fatigueReductionFactor: 0.5,
    
    // Adaptive thresholds
    adaptiveLearningRate: 0.1,
    adaptiveLookbackHours: 168, // 1 week
    adaptiveMinDataPoints: 50,
    
    // Default priorities
    defaultPriorities: {
      [AlertType.TREND_EMERGENCE]: AlertPriority.MEDIUM,
      [AlertType.TREND_STRENGTHENING]: AlertPriority.LOW,
      [AlertType.TREND_WEAKENING]: AlertPriority.LOW,
      [AlertType.TREND_REVERSAL]: AlertPriority.HIGH,
      [AlertType.THRESHOLD_BREACH]: AlertPriority.MEDIUM,
      [AlertType.ANOMALY_DETECTED]: AlertPriority.HIGH,
      [AlertType.PATTERN_COMPLETION]: AlertPriority.MEDIUM,
      [AlertType.SENTIMENT_EXTREME]: AlertPriority.HIGH,
      [AlertType.VOLUME_SPIKE]: AlertPriority.MEDIUM,
      [AlertType.CORRELATION_BREAK]: AlertPriority.LOW,
      [AlertType.VELOCITY_CHANGE]: AlertPriority.LOW,
      [AlertType.CONFLICT_DETECTED]: AlertPriority.MEDIUM
    }
  };

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      maxRetriesPerRequest: 3,
      keyPrefix: 'trend-alerts:'
    });
  }

  async onModuleInit(): Promise<void> {
    await this.initializeAlertSystem();
    this.setupEventListeners();
    this.startAlertProcessing();
    this.logger.log('Trend Alert System initialized');
  }

  /**
   * Create a new alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount' | 'metrics'>): Promise<AlertRule> {
    const alertRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      triggerCount: 0,
      metrics: {
        totalTriggers: 0,
        falsePositives: 0,
        truePositives: 0,
        acknowledgmentRate: 0,
        averageResponseTime: 0,
        effectiveness: 0
      }
    };

    // Validate rule
    if (!this.validateAlertRule(alertRule)) {
      throw new Error('Invalid alert rule configuration');
    }

    // Store rule
    this.alertRules.set(alertRule.id, alertRule);
    await this.cacheAlertRule(alertRule);

    // Emit event
    this.eventEmitter.emit('alert.rule.created', {
      rule: alertRule,
      timestamp: new Date()
    });

    this.logger.log(`Created alert rule: ${alertRule.name} (${alertRule.id})`);
    return alertRule;
  }

  /**
   * Process trend data and generate alerts
   */
  async processTrendForAlerts(trendData: any): Promise<void> {
    const { symbol, category, hierarchy, timeframe } = trendData;

    // Get applicable rules
    const applicableRules = this.getApplicableRules(symbol, category, hierarchy, timeframe);

    for (const rule of applicableRules) {
      // Check if rule should be evaluated (scheduling, throttling)
      if (!this.shouldEvaluateRule(rule)) {
        continue;
      }

      // Evaluate rule conditions
      const evaluationResult = await this.evaluateRule(rule, trendData);
      
      if (evaluationResult.triggered) {
        // Create alert
        const alert = await this.createAlert(rule, trendData, evaluationResult);
        
        // Add to appropriate queue
        if (alert.priority === AlertPriority.CRITICAL || alert.priority === AlertPriority.URGENT) {
          this.realTimeQueue.push(alert);
        } else {
          this.batchQueue.push(alert);
        }

        // Update rule metrics
        await this.updateRuleMetrics(rule.id, true);
      }
    }
  }

  /**
   * Evaluate if an alert rule should trigger
   */
  private async evaluateRule(rule: AlertRule, trendData: any): Promise<{ triggered: boolean; confidence: number; matchedConditions: string[] }> {
    const matchedConditions: string[] = [];
    const conditionResults: boolean[] = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const condition of rule.conditions) {
      const result = await this.evaluateCondition(condition, trendData);
      conditionResults.push(result);
      totalWeight += condition.weight;
      
      if (result) {
        matchedWeight += condition.weight;
        matchedConditions.push(condition.field);
      }
    }

    // Determine if rule triggered based on operator
    let triggered = false;
    if (rule.operator === 'AND') {
      triggered = conditionResults.every(r => r);
    } else if (rule.operator === 'OR') {
      triggered = conditionResults.some(r => r);
    }

    // Calculate confidence based on weighted conditions
    const confidence = totalWeight > 0 ? matchedWeight / totalWeight : 0;

    return {
      triggered,
      confidence,
      matchedConditions
    };
  }

  /**
   * Evaluate a single condition
   */
  private async evaluateCondition(condition: AlertCondition, trendData: any): Promise<boolean> {
    // Get field value from trend data
    const fieldValue = this.getFieldValue(condition.field, trendData);
    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    // Apply operator
    const basicResult = this.applyOperator(fieldValue, condition.operator, condition.value);

    // Check contextual conditions if specified
    if (condition.contextual) {
      const contextualResult = this.evaluateContextualConditions(condition.contextual, trendData);
      if (!contextualResult) {
        return false;
      }
    }

    // Check time window if specified
    if (condition.timeWindow) {
      const timeWindowResult = await this.evaluateTimeWindow(condition, trendData);
      if (!timeWindowResult) {
        return false;
      }
    }

    // Check comparison condition if specified
    if (condition.comparison) {
      const comparisonValue = this.getFieldValue(condition.comparison.field, trendData);
      const comparisonResult = this.applyOperator(fieldValue, condition.comparison.operator, comparisonValue);
      if (!comparisonResult) {
        return false;
      }
    }

    return basicResult;
  }

  /**
   * Create an alert from a triggered rule
   */
  private async createAlert(rule: AlertRule, trendData: any, evaluationResult: any): Promise<TrendAlert> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine alert priority (use rule priority or dynamic calculation)
    const priority = this.calculateAlertPriority(rule, trendData, evaluationResult);
    
    // Generate alert content
    const content = this.generateAlertContent(rule, trendData, evaluationResult);
    
    // Calculate expiration time
    const expiresAt = new Date(Date.now() + this.getAlertExpirationTime(rule.alertType) * 1000);

    const alert: TrendAlert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.alertType,
      priority,
      status: AlertStatus.PENDING,
      
      triggeredAt: new Date(),
      symbol: trendData.symbol,
      category: trendData.category,
      hierarchy: trendData.hierarchy,
      timeframe: trendData.timeframe,
      
      title: content.title,
      message: content.message,
      description: content.description,
      
      trendData: {
        direction: trendData.direction,
        strength: trendData.strength,
        confidence: trendData.confidence,
        magnitude: trendData.magnitude || 0,
        duration: trendData.duration || 0,
        keyLevels: trendData.keyLevels || []
      },
      
      context: {
        marketCondition: trendData.context?.marketCondition || 'unknown',
        volatility: trendData.context?.volatility || 'medium',
        volume: trendData.context?.volume || 'normal',
        sentiment: trendData.context?.sentiment || 'neutral',
        correlatedSymbols: trendData.context?.correlatedSymbols || [],
        catalysts: trendData.context?.catalysts || []
      },
      
      supportingData: {
        data: trendData,
        recommendations: this.generateRecommendations(rule, trendData)
      },
      
      delivery: {
        channels: rule.channels,
        attempts: [],
        delivered: false
      },
      
      interaction: {
        acknowledged: false,
        resolved: false
      },
      
      escalation: {
        level: 0,
        maxLevel: rule.escalation.enabled ? rule.escalation.delays.length : 0
      },
      
      lifecycle: {
        expiresAt,
        retries: 0,
        maxRetries: this.config.maxRetries
      },
      
      metadata: {
        evaluationResult,
        ruleVersion: rule.updatedAt.toISOString()
      }
    };

    // Check for duplicates
    const isDuplicate = await this.checkForDuplicate(alert);
    if (isDuplicate) {
      this.logger.debug(`Duplicate alert suppressed: ${alertId}`);
      return null;
    }

    // Store alert
    this.activeAlerts.set(alertId, alert);
    await this.cacheAlert(alert);

    // Emit event
    this.eventEmitter.emit('alert.created', {
      alert,
      timestamp: new Date()
    });

    return alert;
  }

  /**
   * Process real-time alerts
   */
  private async processRealTimeAlerts(): Promise<void> {
    if (this.realTimeQueue.length === 0) return;

    const alertsToProcess = this.realTimeQueue.splice(0, 10); // Process up to 10 at a time

    for (const alert of alertsToProcess) {
      try {
        await this.deliverAlert(alert);
      } catch (error) {
        this.logger.error(`Failed to deliver real-time alert ${alert.id}:`, error);
        await this.handleAlertDeliveryFailure(alert, error);
      }
    }
  }

  /**
   * Process batch alerts
   */
  private async processBatchAlerts(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    // Group alerts by user/channel for batching
    const batches = this.groupAlertsIntoBatches(this.batchQueue);
    this.batchQueue.length = 0; // Clear the queue

    for (const batch of batches) {
      try {
        await this.processBatch(batch);
      } catch (error) {
        this.logger.error(`Failed to process alert batch ${batch.id}:`, error);
      }
    }
  }

  /**
   * Deliver an alert through specified channels
   */
  private async deliverAlert(alert: TrendAlert): Promise<void> {
    alert.status = AlertStatus.ACTIVE;
    
    for (const channel of alert.delivery.channels) {
      try {
        const success = await this.deliverToChannel(alert, channel);
        
        alert.delivery.attempts.push({
          channel,
          timestamp: new Date(),
          success,
          error: success ? undefined : 'Delivery failed'
        });
        
        if (success) {
          alert.delivery.delivered = true;
          alert.delivery.deliveredAt = new Date();
        }
      } catch (error) {
        this.logger.error(`Failed to deliver alert ${alert.id} to ${channel}:`, error);
        
        alert.delivery.attempts.push({
          channel,
          timestamp: new Date(),
          success: false,
          error: error.message
        });
      }
    }

    // Update alert status
    if (alert.delivery.delivered) {
      await this.updateAlert(alert);
      
      // Schedule escalation if configured
      const rule = this.alertRules.get(alert.ruleId);
      if (rule?.escalation.enabled) {
        await this.scheduleEscalation(alert);
      }
    } else {
      // Retry logic
      await this.scheduleRetry(alert);
    }
  }

  /**
   * Deliver alert to specific channel
   */
  private async deliverToChannel(alert: TrendAlert, channel: NotificationChannel): Promise<boolean> {
    const template = this.getNotificationTemplate(alert.type, channel);
    const content = this.renderTemplate(template, alert);

    switch (channel) {
      case NotificationChannel.EMAIL:
        return await this.sendEmail(content);
      
      case NotificationChannel.SMS:
        return await this.sendSMS(content);
      
      case NotificationChannel.PUSH:
        return await this.sendPushNotification(content);
      
      case NotificationChannel.WEBHOOK:
        return await this.sendWebhook(content, alert);
      
      case NotificationChannel.SLACK:
        return await this.sendSlackMessage(content);
      
      case NotificationChannel.DISCORD:
        return await this.sendDiscordMessage(content);
      
      case NotificationChannel.TEAMS:
        return await this.sendTeamsMessage(content);
      
      case NotificationChannel.IN_APP:
        return await this.sendInAppNotification(content, alert);
      
      default:
        this.logger.warn(`Unsupported notification channel: ${channel}`);
        return false;
    }
  }

  /**
   * Handle alert escalation
   */
  private async handleEscalation(alert: TrendAlert): Promise<void> {
    const rule = this.alertRules.get(alert.ruleId);
    if (!rule?.escalation.enabled || alert.interaction.acknowledged) {
      return;
    }

    const currentLevel = alert.escalation.level;
    const maxLevel = alert.escalation.maxLevel;

    if (currentLevel >= maxLevel) {
      this.logger.warn(`Alert ${alert.id} reached maximum escalation level`);
      return;
    }

    // Escalate to next level
    alert.escalation.level++;
    alert.escalation.escalatedAt = new Date();

    // Get escalation channels for this level
    const escalationChannels = rule.escalation.channels[currentLevel] || rule.channels;

    // Send escalated notification
    for (const channel of escalationChannels) {
      try {
        const escalatedContent = this.createEscalationContent(alert, currentLevel + 1);
        await this.deliverToChannel({ ...alert, title: escalatedContent.title, message: escalatedContent.message }, channel);
      } catch (error) {
        this.logger.error(`Failed to escalate alert ${alert.id} to ${channel}:`, error);
      }
    }

    // Schedule next escalation if not at max level
    if (alert.escalation.level < maxLevel) {
      const nextDelay = rule.escalation.delays[alert.escalation.level];
      alert.escalation.nextEscalationAt = new Date(Date.now() + nextDelay * 1000);
    }

    await this.updateAlert(alert);

    // Emit escalation event
    this.eventEmitter.emit('alert.escalated', {
      alert,
      level: alert.escalation.level,
      timestamp: new Date()
    });
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId?: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.interaction.acknowledged = true;
    alert.interaction.acknowledgedAt = new Date();
    alert.interaction.acknowledgedBy = userId;
    alert.status = AlertStatus.ACKNOWLEDGED;

    await this.updateAlert(alert);

    // Update rule metrics
    const rule = this.alertRules.get(alert.ruleId);
    if (rule) {
      await this.updateRuleAcknowledgmentMetrics(rule.id);
    }

    // Emit event
    this.eventEmitter.emit('alert.acknowledged', {
      alert,
      userId,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId?: string, feedback?: TrendAlert['interaction']['feedback']): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.interaction.resolved = true;
    alert.interaction.resolvedAt = new Date();
    alert.interaction.resolvedBy = userId;
    alert.interaction.feedback = feedback;
    alert.status = AlertStatus.RESOLVED;

    await this.updateAlert(alert);

    // Update rule metrics based on feedback
    if (feedback) {
      await this.updateRuleFeedbackMetrics(alert.ruleId, feedback);
    }

    // Remove from active alerts if older than retention period
    const age = Date.now() - alert.triggeredAt.getTime();
    const retentionPeriod = this.config.alertRetentionDays * 24 * 60 * 60 * 1000;
    
    if (age > retentionPeriod) {
      this.activeAlerts.delete(alertId);
    }

    // Emit event
    this.eventEmitter.emit('alert.resolved', {
      alert,
      userId,
      feedback,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Update dynamic thresholds based on recent data
   */
  async updateDynamicThresholds(): Promise<void> {
    for (const [id, threshold] of this.alertThresholds.entries()) {
      if (!threshold.dynamic.enabled && !threshold.adaptive.enabled) {
        continue;
      }

      try {
        let newValue = threshold.current.value;
        let method = threshold.current.method;

        if (threshold.dynamic.enabled) {
          newValue = await this.calculateDynamicThreshold(threshold);
          method = 'dynamic';
        }

        if (threshold.adaptive.enabled) {
          const adaptiveValue = await this.calculateAdaptiveThreshold(threshold);
          if (adaptiveValue !== null) {
            newValue = adaptiveValue;
            method = 'adaptive';
          }
        }

        // Update threshold if value changed significantly
        const changeThreshold = Math.abs(threshold.current.value) * 0.05; // 5% change threshold
        if (Math.abs(newValue - threshold.current.value) > changeThreshold) {
          threshold.current.value = newValue;
          threshold.current.calculatedAt = new Date();
          threshold.current.method = method;

          await this.cacheAlertThreshold(threshold);

          this.logger.debug(`Updated threshold ${threshold.name}: ${threshold.current.value} (${method})`);
        }
      } catch (error) {
        this.logger.error(`Failed to update threshold ${id}:`, error);
      }
    }
  }

  // Helper methods

  private validateAlertRule(rule: AlertRule): boolean {
    return !!(
      rule.name &&
      rule.conditions.length > 0 &&
      rule.alertType &&
      rule.priority &&
      rule.channels.length > 0 &&
      rule.conditions.every(c => c.field && c.operator && c.value !== undefined)
    );
  }

  private getApplicableRules(symbol: string, category: string, hierarchy: string, timeframe: string): AlertRule[] {
    return Array.from(this.alertRules.values()).filter(rule => {
      if (!rule.enabled) return false;
      
      // Check symbol filter
      if (rule.symbols.length > 0 && !rule.symbols.includes(symbol)) return false;
      
      // Check category filter
      if (rule.categories.length > 0 && !rule.categories.includes(category)) return false;
      
      // Check hierarchy filter
      if (rule.hierarchies.length > 0 && !rule.hierarchies.includes(hierarchy)) return false;
      
      // Check timeframe filter
      if (rule.timeframes.length > 0 && !rule.timeframes.includes(timeframe)) return false;
      
      return true;
    });
  }

  private shouldEvaluateRule(rule: AlertRule): boolean {
    const now = new Date();

    // Check schedule
    if (rule.schedule.enabled) {
      if (!this.isWithinSchedule(rule.schedule, now)) {
        return false;
      }
    }

    // Check throttling
    if (rule.throttling.enabled) {
      if (!this.checkThrottling(rule, now)) {
        return false;
      }
    }

    return true;
  }

  private isWithinSchedule(schedule: AlertRule['schedule'], now: Date): boolean {
    // Check active days
    const dayOfWeek = now.getDay();
    if (!schedule.activeDays.includes(dayOfWeek)) {
      return false;
    }

    // Check active hours
    const timeString = now.toTimeString().substr(0, 5);
    if (timeString < schedule.activeHours.start || timeString > schedule.activeHours.end) {
      return false;
    }

    // TODO: Check holidays if excludeHolidays is true

    return true;
  }

  private checkThrottling(rule: AlertRule, now: Date): boolean {
    if (!rule.lastTriggered) {
      return true;
    }

    const timeSinceLastTrigger = (now.getTime() - rule.lastTriggered.getTime()) / 1000;
    
    // Check cooldown period
    if (timeSinceLastTrigger < rule.throttling.cooldownPeriod) {
      return false;
    }

    // Check interval-based throttling
    const intervalStart = now.getTime() - (rule.throttling.interval * 1000);
    const recentTriggers = this.getRecentRuleTriggers(rule.id, new Date(intervalStart));
    
    return recentTriggers < rule.throttling.maxAlerts;
  }

  private getFieldValue(field: string, data: any): any {
    const parts = field.split('.');
    let value = data;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private applyOperator(fieldValue: any, operator: AlertRuleOperator, targetValue: any): boolean {
    switch (operator) {
      case AlertRuleOperator.GREATER_THAN:
        return fieldValue > targetValue;
      case AlertRuleOperator.LESS_THAN:
        return fieldValue < targetValue;
      case AlertRuleOperator.EQUAL:
        return fieldValue === targetValue;
      case AlertRuleOperator.NOT_EQUAL:
        return fieldValue !== targetValue;
      case AlertRuleOperator.GREATER_EQUAL:
        return fieldValue >= targetValue;
      case AlertRuleOperator.LESS_EQUAL:
        return fieldValue <= targetValue;
      case AlertRuleOperator.CONTAINS:
        return String(fieldValue).includes(String(targetValue));
      case AlertRuleOperator.NOT_CONTAINS:
        return !String(fieldValue).includes(String(targetValue));
      case AlertRuleOperator.IN:
        return Array.isArray(targetValue) && targetValue.includes(fieldValue);
      case AlertRuleOperator.NOT_IN:
        return Array.isArray(targetValue) && !targetValue.includes(fieldValue);
      case AlertRuleOperator.BETWEEN:
        return Array.isArray(targetValue) && targetValue.length === 2 && 
               fieldValue >= targetValue[0] && fieldValue <= targetValue[1];
      case AlertRuleOperator.NOT_BETWEEN:
        return Array.isArray(targetValue) && targetValue.length === 2 && 
               (fieldValue < targetValue[0] || fieldValue > targetValue[1]);
      default:
        return false;
    }
  }

  private evaluateContextualConditions(contextual: AlertCondition['contextual'], trendData: any): boolean {
    if (contextual.marketCondition && contextual.marketCondition.length > 0) {
      if (!contextual.marketCondition.includes(trendData.context?.marketCondition)) {
        return false;
      }
    }

    if (contextual.volatility && contextual.volatility.length > 0) {
      if (!contextual.volatility.includes(trendData.context?.volatility)) {
        return false;
      }
    }

    if (contextual.volume && contextual.volume.length > 0) {
      if (!contextual.volume.includes(trendData.context?.volume)) {
        return false;
      }
    }

    if (contextual.sentiment && contextual.sentiment.length > 0) {
      if (!contextual.sentiment.includes(trendData.context?.sentiment)) {
        return false;
      }
    }

    return true;
  }

  private async evaluateTimeWindow(condition: AlertCondition, trendData: any): Promise<boolean> {
    // For time window evaluation, we need historical data
    // This is a simplified implementation
    return true; // Would implement proper time window evaluation
  }

  // Notification channel implementations

  private async sendEmail(content: any): Promise<boolean> {
    try {
      // Email sending implementation
      this.logger.debug('Sending email notification');
      return true; // Mock success
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  private async sendSMS(content: any): Promise<boolean> {
    try {
      // SMS sending implementation
      this.logger.debug('Sending SMS notification');
      return true; // Mock success
    } catch (error) {
      this.logger.error('Failed to send SMS:', error);
      return false;
    }
  }

  private async sendPushNotification(content: any): Promise<boolean> {
    try {
      // Push notification implementation
      this.logger.debug('Sending push notification');
      return true; // Mock success
    } catch (error) {
      this.logger.error('Failed to send push notification:', error);
      return false;
    }
  }

  private async sendWebhook(content: any, alert: TrendAlert): Promise<boolean> {
    try {
      // Webhook implementation
      this.logger.debug('Sending webhook notification');
      return true; // Mock success
    } catch (error) {
      this.logger.error('Failed to send webhook:', error);
      return false;
    }
  }

  private async sendSlackMessage(content: any): Promise<boolean> {
    try {
      // Slack implementation
      this.logger.debug('Sending Slack notification');
      return true; // Mock success
    } catch (error) {
      this.logger.error('Failed to send Slack message:', error);
      return false;
    }
  }

  private async sendDiscordMessage(content: any): Promise<boolean> {
    try {
      // Discord implementation
      this.logger.debug('Sending Discord notification');
      return true; // Mock success
    } catch (error) {
      this.logger.error('Failed to send Discord message:', error);
      return false;
    }
  }

  private async sendTeamsMessage(content: any): Promise<boolean> {
    try {
      // Teams implementation
      this.logger.debug('Sending Teams notification');
      return true; // Mock success
    } catch (error) {
      this.logger.error('Failed to send Teams message:', error);
      return false;
    }
  }

  private async sendInAppNotification(content: any, alert: TrendAlert): Promise<boolean> {
    try {
      // In-app notification implementation
      this.eventEmitter.emit('notification.in_app', {
        alert,
        content,
        timestamp: new Date()
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to send in-app notification:', error);
      return false;
    }
  }

  // Additional helper methods for content generation, batching, etc.

  private calculateAlertPriority(rule: AlertRule, trendData: any, evaluationResult: any): AlertPriority {
    // Use rule priority as base
    let priority = rule.priority;
    
    // Adjust based on trend data
    if (trendData.strength > 0.8 && trendData.confidence > 0.8) {
      // Upgrade priority for strong, confident trends
      if (priority === AlertPriority.LOW) priority = AlertPriority.MEDIUM;
      else if (priority === AlertPriority.MEDIUM) priority = AlertPriority.HIGH;
    }
    
    // Adjust based on evaluation confidence
    if (evaluationResult.confidence > 0.9) {
      // High confidence evaluation
      if (priority === AlertPriority.MEDIUM) priority = AlertPriority.HIGH;
    }
    
    return priority;
  }

  private generateAlertContent(rule: AlertRule, trendData: any, evaluationResult: any): { title: string; message: string; description: string } {
    const { symbol, direction, strength, confidence } = trendData;
    const directionText = direction === 'bullish' ? 'upward' : direction === 'bearish' ? 'downward' : 'sideways';
    
    const title = `${rule.alertType.replace('_', ' ').toUpperCase()}: ${symbol}`;
    const message = `${symbol} showing ${directionText} trend with ${Math.round(strength * 100)}% strength and ${Math.round(confidence * 100)}% confidence`;
    const description = `Alert triggered by rule "${rule.name}". Matched conditions: ${evaluationResult.matchedConditions.join(', ')}`;
    
    return { title, message, description };
  }

  private generateRecommendations(rule: AlertRule, trendData: any): string[] {
    const recommendations: string[] = [];
    
    if (trendData.direction === 'bullish' && trendData.strength > 0.7) {
      recommendations.push('Consider long position if fundamentals support');
    } else if (trendData.direction === 'bearish' && trendData.strength > 0.7) {
      recommendations.push('Consider short position or exit long positions');
    }
    
    if (trendData.confidence < 0.6) {
      recommendations.push('Low confidence - wait for confirmation');
    }
    
    return recommendations;
  }

  private getAlertExpirationTime(alertType: AlertType): number {
    // Return expiration time in seconds based on alert type
    const expirationTimes = {
      [AlertType.TREND_EMERGENCE]: 3600, // 1 hour
      [AlertType.TREND_STRENGTHENING]: 1800, // 30 minutes
      [AlertType.TREND_WEAKENING]: 1800, // 30 minutes
      [AlertType.TREND_REVERSAL]: 7200, // 2 hours
      [AlertType.THRESHOLD_BREACH]: 3600, // 1 hour
      [AlertType.ANOMALY_DETECTED]: 1800, // 30 minutes
      [AlertType.PATTERN_COMPLETION]: 3600, // 1 hour
      [AlertType.SENTIMENT_EXTREME]: 1800, // 30 minutes
      [AlertType.VOLUME_SPIKE]: 900, // 15 minutes
      [AlertType.CORRELATION_BREAK]: 3600, // 1 hour
      [AlertType.VELOCITY_CHANGE]: 1800, // 30 minutes
      [AlertType.CONFLICT_DETECTED]: 3600 // 1 hour
    };
    
    return expirationTimes[alertType] || 3600;
  }

  private async checkForDuplicate(alert: TrendAlert): Promise<boolean> {
    // Check for recent similar alerts
    const recentAlerts = Array.from(this.activeAlerts.values()).filter(a => {
      const timeDiff = alert.triggeredAt.getTime() - a.triggeredAt.getTime();
      return timeDiff >= 0 && timeDiff <= this.config.deduplicationWindow * 1000 &&
             a.symbol === alert.symbol &&
             a.type === alert.type &&
             a.ruleId === alert.ruleId;
    });
    
    return recentAlerts.length > 0;
  }

  private groupAlertsIntoBatches(alerts: TrendAlert[]): AlertBatch[] {
    const batches: AlertBatch[] = [];
    const batchMap = new Map<string, TrendAlert[]>();
    
    // Group alerts by user/channel combination
    for (const alert of alerts) {
      const key = alert.delivery.channels.sort().join(',');
      if (!batchMap.has(key)) {
        batchMap.set(key, []);
      }
      batchMap.get(key).push(alert);
    }
    
    // Create batches
    for (const [key, alertGroup] of batchMap.entries()) {
      const batch: AlertBatch = {
        id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        alerts: alertGroup,
        processing: {
          maxSize: this.config.maxBatchSize,
          maxAge: this.config.maxBatchAge,
          priority: AlertPriority.LOW,
          channels: key.split(',') as NotificationChannel[]
        },
        deduplication: {
          enabled: true,
          window: this.config.deduplicationWindow,
          criteria: ['symbol', 'type'],
          strategy: 'merge'
        },
        results: {
          total: alertGroup.length,
          delivered: 0,
          failed: 0,
          suppressed: 0,
          deduplicated: 0
        }
      };
      
      batches.push(batch);
    }
    
    return batches;
  }

  private async processBatch(batch: AlertBatch): Promise<void> {
    batch.processedAt = new Date();
    
    // Deduplicate alerts if enabled
    if (batch.deduplication.enabled) {
      const deduplicated = this.deduplicateAlerts(batch.alerts, batch.deduplication);
      batch.alerts = deduplicated.alerts;
      batch.results.deduplicated = deduplicated.removed;
    }
    
    // Process remaining alerts
    for (const alert of batch.alerts) {
      try {
        await this.deliverAlert(alert);
        batch.results.delivered++;
      } catch (error) {
        this.logger.error(`Failed to deliver batched alert ${alert.id}:`, error);
        batch.results.failed++;
      }
    }
    
    // Store batch
    this.alertBatches.set(batch.id, batch);
    await this.cacheAlertBatch(batch);
  }

  private deduplicateAlerts(alerts: TrendAlert[], config: AlertBatch['deduplication']): { alerts: TrendAlert[]; removed: number } {
    if (!config.enabled) {
      return { alerts, removed: 0 };
    }
    
    const deduplicated = new Map<string, TrendAlert>();
    
    for (const alert of alerts) {
      const key = config.criteria.map(field => this.getFieldValue(field, alert)).join('|');
      
      if (!deduplicated.has(key)) {
        deduplicated.set(key, alert);
      } else {
        // Handle duplicate based on strategy
        const existing = deduplicated.get(key);
        if (config.strategy === 'merge') {
          // Merge alert data (simplified)
          existing.message += ` | ${alert.message}`;
        } else if (config.strategy === 'replace') {
          deduplicated.set(key, alert);
        }
        // 'skip' strategy - do nothing, keep existing
      }
    }
    
    const uniqueAlerts = Array.from(deduplicated.values());
    return {
      alerts: uniqueAlerts,
      removed: alerts.length - uniqueAlerts.length
    };
  }

  // More implementation details for caching, metrics, etc.

  private async cacheAlert(alert: TrendAlert): Promise<void> {
    try {
      await this.redis.setex(`alert:${alert.id}`, 86400, JSON.stringify(alert));
    } catch (error) {
      this.logger.warn('Failed to cache alert:', error);
    }
  }

  private async cacheAlertRule(rule: AlertRule): Promise<void> {
    try {
      await this.redis.setex(`rule:${rule.id}`, 3600, JSON.stringify(rule));
    } catch (error) {
      this.logger.warn('Failed to cache alert rule:', error);
    }
  }

  private async cacheAlertThreshold(threshold: AlertThreshold): Promise<void> {
    try {
      await this.redis.setex(`threshold:${threshold.id}`, 3600, JSON.stringify(threshold));
    } catch (error) {
      this.logger.warn('Failed to cache alert threshold:', error);
    }
  }

  private async cacheAlertBatch(batch: AlertBatch): Promise<void> {
    try {
      await this.redis.setex(`batch:${batch.id}`, 3600, JSON.stringify(batch));
    } catch (error) {
      this.logger.warn('Failed to cache alert batch:', error);
    }
  }

  // Initialization and setup

  private async initializeAlertSystem(): Promise<void> {
    try {
      // Load cached rules and thresholds
      await this.loadCachedRules();
      await this.loadCachedThresholds();
      await this.loadNotificationTemplates();
      
      this.logger.log('Alert system data loaded from cache');
    } catch (error) {
      this.logger.error('Failed to initialize alert system:', error);
    }
  }

  private setupEventListeners(): void {
    // Listen for trend events from other services
    this.eventEmitter.on('trend.aggregated', (data: any) => {
      this.processTrendForAlerts(data.trend);
    });
    
    this.eventEmitter.on('pattern.detected', (data: any) => {
      this.processTrendForAlerts(data);
    });
    
    this.eventEmitter.on('sentiment.extreme', (data: any) => {
      this.processTrendForAlerts(data);
    });
    
    this.eventEmitter.on('anomaly.detected', (data: any) => {
      this.processTrendForAlerts(data);
    });
  }

  private startAlertProcessing(): void {
    // Start real-time processing
    setInterval(() => {
      this.processRealTimeAlerts();
    }, this.config.realTimeProcessingInterval);

    // Start batch processing
    setInterval(() => {
      this.processBatchAlerts();
    }, this.config.batchProcessingInterval);

    // Start escalation processing
    setInterval(() => {
      this.processEscalations();
    }, this.config.escalationCheckInterval);
  }

  private async processEscalations(): Promise<void> {
    const now = new Date();
    
    for (const alert of this.activeAlerts.values()) {
      if (alert.escalation.nextEscalationAt && alert.escalation.nextEscalationAt <= now) {
        await this.handleEscalation(alert);
      }
    }
  }

  // Scheduled tasks

  @Cron('*/5 * * * *') // Every 5 minutes
  private async updateThresholds(): Promise<void> {
    try {
      await this.updateDynamicThresholds();
    } catch (error) {
      this.logger.error('Failed to update thresholds:', error);
    }
  }

  @Cron('*/15 * * * *') // Every 15 minutes
  private async cleanupExpiredAlerts(): Promise<void> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      for (const [id, alert] of this.activeAlerts.entries()) {
        if (alert.lifecycle.expiresAt <= now || alert.status === AlertStatus.RESOLVED) {
          this.activeAlerts.delete(id);
          cleanedCount++;
        }
      }

      this.logger.log(`Cleaned up ${cleanedCount} expired alerts`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired alerts:', error);
    }
  }

  @Cron('0 */6 * * *') // Every 6 hours
  private async optimizeAlertRules(): Promise<void> {
    try {
      // Analyze rule performance and suggest optimizations
      await this.analyzeRulePerformance();
    } catch (error) {
      this.logger.error('Failed to optimize alert rules:', error);
    }
  }

  // Additional methods for performance tracking, optimization, etc.

  private async updateRuleMetrics(ruleId: string, triggered: boolean): Promise<void> {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return;

    rule.triggerCount++;
    rule.lastTriggered = new Date();
    rule.metrics.totalTriggers++;

    if (triggered) {
      // Update metrics based on subsequent user actions
      // This would be called when we have feedback about the alert
    }

    await this.cacheAlertRule(rule);
  }

  private async updateRuleAcknowledgmentMetrics(ruleId: string): Promise<void> {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return;

    // Calculate new acknowledgment rate
    const recentAlerts = this.getRecentRuleAlerts(ruleId);
    const acknowledged = recentAlerts.filter(a => a.interaction.acknowledged).length;
    rule.metrics.acknowledgmentRate = acknowledged / Math.max(1, recentAlerts.length);

    await this.cacheAlertRule(rule);
  }

  private async updateRuleFeedbackMetrics(ruleId: string, feedback: TrendAlert['interaction']['feedback']): Promise<void> {
    const rule = this.alertRules.get(ruleId);
    if (!rule || !feedback) return;

    if (feedback.useful) {
      rule.metrics.truePositives++;
    } else {
      rule.metrics.falsePositives++;
    }

    // Update effectiveness score
    const total = rule.metrics.truePositives + rule.metrics.falsePositives;
    rule.metrics.effectiveness = total > 0 ? rule.metrics.truePositives / total : 0;

    await this.cacheAlertRule(rule);
  }

  private getRecentRuleTriggers(ruleId: string, since: Date): number {
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.ruleId === ruleId && alert.triggeredAt >= since)
      .length;
  }

  private getRecentRuleAlerts(ruleId: string): TrendAlert[] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.ruleId === ruleId && alert.triggeredAt >= oneDayAgo);
  }

  private async analyzeRulePerformance(): Promise<void> {
    for (const [id, rule] of this.alertRules.entries()) {
      // Analyze rule effectiveness
      if (rule.metrics.effectiveness < 0.3 && rule.metrics.totalTriggers > 10) {
        this.logger.warn(`Rule ${rule.name} has low effectiveness: ${rule.metrics.effectiveness}`);
        // Could automatically disable or suggest modifications
      }

      // Analyze acknowledgment rate
      if (rule.metrics.acknowledgmentRate < 0.2 && rule.metrics.totalTriggers > 5) {
        this.logger.warn(`Rule ${rule.name} has low acknowledgment rate: ${rule.metrics.acknowledgmentRate}`);
        // Could suggest priority adjustment or channel changes
      }
    }
  }

  private async calculateDynamicThreshold(threshold: AlertThreshold): Promise<number> {
    // Calculate dynamic threshold based on market conditions
    let value = threshold.dynamic.baseValue;

    // Adjust for volatility
    const currentVolatility = await this.getCurrentVolatility(threshold.symbol);
    value *= (1 + currentVolatility * threshold.dynamic.volatilityMultiplier);

    // Adjust for market condition
    const marketCondition = await this.getCurrentMarketCondition(threshold.symbol);
    const conditionAdjustment = threshold.dynamic.marketConditionAdjustment[marketCondition] || 0;
    value *= (1 + conditionAdjustment);

    // Adjust for time of day
    const hour = new Date().getHours().toString();
    const timeAdjustment = threshold.dynamic.timeOfDayAdjustment[hour] || 0;
    value *= (1 + timeAdjustment);

    return value;
  }

  private async calculateAdaptiveThreshold(threshold: AlertThreshold): Promise<number | null> {
    // Calculate adaptive threshold using machine learning
    const historicalData = await this.getHistoricalData(threshold.field, threshold.symbol, threshold.adaptive.lookbackPeriod);
    
    if (historicalData.length < threshold.adaptive.minDataPoints) {
      return null;
    }

    // Simple adaptive calculation (in production, would use more sophisticated ML)
    const mean = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
    const variance = historicalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalData.length;
    const stdDev = Math.sqrt(variance);

    // Calculate threshold at specified confidence interval
    const zScore = this.getZScore(threshold.adaptive.confidenceInterval);
    const adaptiveThreshold = mean + (zScore * stdDev);

    return adaptiveThreshold;
  }

  // Utility methods and simplified implementations

  private async getCurrentVolatility(symbol?: string): Promise<number> {
    // Mock implementation - would get real volatility data
    return Math.random() * 0.3; // 0-30% volatility
  }

  private async getCurrentMarketCondition(symbol?: string): Promise<string> {
    // Mock implementation - would determine actual market condition
    const conditions = ['bull', 'bear', 'sideways'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private async getHistoricalData(field: string, symbol: string, hours: number): Promise<number[]> {
    // Mock implementation - would get real historical data
    const dataPoints = Math.floor(hours / 4); // One point every 4 hours
    return Array.from({ length: dataPoints }, () => Math.random() * 100);
  }

  private getZScore(confidenceInterval: number): number {
    // Simplified z-score lookup for common confidence intervals
    const zScores: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    
    return zScores[confidenceInterval] || 1.96;
  }

  private getNotificationTemplate(alertType: AlertType, channel: NotificationChannel): NotificationTemplate {
    // Get template for alert type and channel
    const templateId = `${alertType}_${channel}`;
    return this.notificationTemplates.get(templateId) || this.getDefaultTemplate(channel);
  }

  private getDefaultTemplate(channel: NotificationChannel): NotificationTemplate {
    return {
      id: `default_${channel}`,
      name: 'Default Template',
      type: AlertType.TREND_EMERGENCE,
      channel,
      subject: 'Trend Alert: {{symbol}}',
      body: '{{title}}\n\n{{message}}\n\n{{description}}',
      variables: [
        { name: 'symbol', description: 'Symbol name', required: true },
        { name: 'title', description: 'Alert title', required: true },
        { name: 'message', description: 'Alert message', required: true },
        { name: 'description', description: 'Alert description', required: false }
      ],
      formatting: {
        includeCharts: false,
        includeData: false,
        includeRecommendations: true,
        includeContext: true
      },
      localization: {
        enabled: false,
        languages: ['en'],
        defaultLanguage: 'en'
      }
    };
  }

  private renderTemplate(template: NotificationTemplate, alert: TrendAlert): any {
    let content = template.body;
    
    // Replace template variables
    const variables = {
      symbol: alert.symbol,
      title: alert.title,
      message: alert.message,
      description: alert.description,
      direction: alert.trendData.direction,
      strength: Math.round(alert.trendData.strength * 100),
      confidence: Math.round(alert.trendData.confidence * 100)
    };
    
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    
    return {
      subject: template.subject.replace(/{{(\w+)}}/g, (match, key) => String(variables[key as keyof typeof variables]) || match),
      body: content,
      htmlBody: template.htmlBody ? template.htmlBody.replace(/{{(\w+)}}/g, (match, key) => String(variables[key as keyof typeof variables]) || match) : undefined
    };
  }

  private createEscalationContent(alert: TrendAlert, level: number): { title: string; message: string } {
    return {
      title: `[ESCALATED L${level}] ${alert.title}`,
      message: `This alert has been escalated to level ${level} due to lack of acknowledgment. ${alert.message}`
    };
  }

  private async updateAlert(alert: TrendAlert): Promise<void> {
    await this.cacheAlert(alert);
  }

  private async scheduleEscalation(alert: TrendAlert): Promise<void> {
    const rule = this.alertRules.get(alert.ruleId);
    if (!rule?.escalation.enabled || alert.escalation.level >= alert.escalation.maxLevel) {
      return;
    }

    const delay = rule.escalation.delays[alert.escalation.level];
    alert.escalation.nextEscalationAt = new Date(Date.now() + delay * 1000);
    
    await this.updateAlert(alert);
  }

  private async scheduleRetry(alert: TrendAlert): Promise<void> {
    if (alert.lifecycle.retries >= alert.lifecycle.maxRetries) {
      alert.status = AlertStatus.EXPIRED;
      await this.updateAlert(alert);
      return;
    }

    alert.lifecycle.retries++;
    
    // Add back to appropriate queue for retry
    setTimeout(() => {
      if (alert.priority === AlertPriority.CRITICAL || alert.priority === AlertPriority.URGENT) {
        this.realTimeQueue.push(alert);
      } else {
        this.batchQueue.push(alert);
      }
    }, 30000); // Retry after 30 seconds
  }

  private async handleAlertDeliveryFailure(alert: TrendAlert, error: Error): Promise<void> {
    this.logger.error(`Alert delivery failed for ${alert.id}:`, error);
    
    // Add to retry queue or mark as failed
    await this.scheduleRetry(alert);
    
    // Emit failure event
    this.eventEmitter.emit('alert.delivery.failed', {
      alert,
      error: error.message,
      timestamp: new Date()
    });
  }

  private async loadCachedRules(): Promise<void> {
    // Load cached alert rules from Redis
    try {
      const keys = await this.redis.keys('rule:*');
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const rule = JSON.parse(data) as AlertRule;
          this.alertRules.set(rule.id, rule);
        }
      }
      this.logger.log(`Loaded ${this.alertRules.size} alert rules from cache`);
    } catch (error) {
      this.logger.error('Failed to load cached rules:', error);
    }
  }

  private async loadCachedThresholds(): Promise<void> {
    // Load cached thresholds from Redis
    try {
      const keys = await this.redis.keys('threshold:*');
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const threshold = JSON.parse(data) as AlertThreshold;
          this.alertThresholds.set(threshold.id, threshold);
        }
      }
      this.logger.log(`Loaded ${this.alertThresholds.size} alert thresholds from cache`);
    } catch (error) {
      this.logger.error('Failed to load cached thresholds:', error);
    }
  }

  private async loadNotificationTemplates(): Promise<void> {
    // Load default notification templates
    for (const alertType of Object.values(AlertType)) {
      for (const channel of Object.values(NotificationChannel)) {
        const template = this.getDefaultTemplate(channel);
        template.id = `${alertType}_${channel}`;
        template.type = alertType;
        this.notificationTemplates.set(template.id, template);
      }
    }
    
    this.logger.log(`Loaded ${this.notificationTemplates.size} notification templates`);
  }

  // Public API methods

  /**
   * Get all alert rules
   */
  async getAlertRules(userId?: string): Promise<AlertRule[]> {
    const rules = Array.from(this.alertRules.values());
    return userId ? rules.filter(rule => !rule.userId || rule.userId === userId) : rules;
  }

  /**
   * Get alert rule by ID
   */
  async getAlertRule(ruleId: string): Promise<AlertRule | null> {
    return this.alertRules.get(ruleId) || null;
  }

  /**
   * Update alert rule
   */
  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
    
    if (!this.validateAlertRule(updatedRule)) {
      throw new Error('Invalid alert rule configuration');
    }

    this.alertRules.set(ruleId, updatedRule);
    await this.cacheAlertRule(updatedRule);

    this.eventEmitter.emit('alert.rule.updated', {
      rule: updatedRule,
      timestamp: new Date()
    });

    return updatedRule;
  }

  /**
   * Delete alert rule
   */
  async deleteAlertRule(ruleId: string): Promise<boolean> {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return false;

    this.alertRules.delete(ruleId);
    await this.redis.del(`rule:${ruleId}`);

    this.eventEmitter.emit('alert.rule.deleted', {
      ruleId,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(filters?: {
    symbol?: string;
    type?: AlertType;
    priority?: AlertPriority;
    status?: AlertStatus;
    userId?: string;
  }): Promise<TrendAlert[]> {
    let alerts = Array.from(this.activeAlerts.values());

    if (filters) {
      if (filters.symbol) alerts = alerts.filter(a => a.symbol === filters.symbol);
      if (filters.type) alerts = alerts.filter(a => a.type === filters.type);
      if (filters.priority) alerts = alerts.filter(a => a.priority === filters.priority);
      if (filters.status) alerts = alerts.filter(a => a.status === filters.status);
      // User filtering would require user data in alerts
    }

    return alerts.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  /**
   * Get alert by ID
   */
  async getAlert(alertId: string): Promise<TrendAlert | null> {
    return this.activeAlerts.get(alertId) || null;
  }

  /**
   * Get alert analytics
   */
  async getAlertAnalytics(timeframe: string = '24h'): Promise<AlertAnalytics> {
    const alerts = Array.from(this.activeAlerts.values());
    const timeframeMs = this.parseTimeframe(timeframe);
    const cutoff = new Date(Date.now() - timeframeMs);
    const filteredAlerts = alerts.filter(a => a.triggeredAt >= cutoff);

    // Calculate volume metrics
    const volume = {
      total: filteredAlerts.length,
      byType: this.groupBy(filteredAlerts, 'type'),
      byPriority: this.groupBy(filteredAlerts, 'priority'),
      byStatus: this.groupBy(filteredAlerts, 'status'),
      byChannel: this.groupBy(filteredAlerts.flatMap(a => a.delivery.channels.map(c => ({ channel: c }))), 'channel')
    };

    // Calculate performance metrics
    const acknowledged = filteredAlerts.filter(a => a.interaction.acknowledged);
    const resolved = filteredAlerts.filter(a => a.interaction.resolved);
    const withFeedback = resolved.filter(a => a.interaction.feedback);
    const useful = withFeedback.filter(a => a.interaction.feedback?.useful);

    const performance = {
      averageResponseTime: acknowledged.length > 0 ? 
        acknowledged.reduce((sum, a) => sum + (a.interaction.acknowledgedAt?.getTime() || 0) - a.triggeredAt.getTime(), 0) / acknowledged.length / 1000 : 0,
      acknowledgmentRate: filteredAlerts.length > 0 ? acknowledged.length / filteredAlerts.length : 0,
      resolutionRate: filteredAlerts.length > 0 ? resolved.length / filteredAlerts.length : 0,
      falsePositiveRate: withFeedback.length > 0 ? (withFeedback.length - useful.length) / withFeedback.length : 0,
      effectivenessScore: withFeedback.length > 0 ? useful.length / withFeedback.length : 0
    };

    return {
      timeframe,
      generatedAt: new Date(),
      volume,
      performance,
      trends: {
        volumeTrend: 'stable', // Would calculate actual trends
        performanceTrend: 'stable',
        topTriggers: [],
        topSymbols: [],
        peakHours: []
      },
      engagement: {
        activeUsers: 0,
        topUsers: [],
        feedbackScore: 0,
        customRulesCreated: 0
      },
      recommendations: {
        thresholdAdjustments: [],
        ruleOptimizations: [],
        channelOptimizations: []
      }
    };
  }

  private parseTimeframe(timeframe: string): number {
    const timeframeMap: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    return timeframeMap[timeframe] || timeframeMap['24h'];
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    const groups: Record<string, number> = {};
    
    for (const item of array) {
      const group = String(item[key]);
      groups[group] = (groups[group] || 0) + 1;
    }
    
    return groups;
  }
}