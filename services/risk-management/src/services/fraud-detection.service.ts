import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ComplianceCheck,
  ComplianceType,
  ComplianceStatus,
  ComplianceSeverity,
} from '../entities/compliance-check.entity';
import { RiskAlert, AlertType, AlertSeverity, AlertPriority } from '../entities/risk-alert.entity';
import * as _ from 'lodash';

export interface FraudDetectionParams {
  userId: string;
  accountId: string;
  sessionData: {
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    location: {
      country: string;
      city: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    sessionDuration: number;
    loginTime: Date;
  };
  transactionData?: {
    amount: number;
    currency: string;
    recipient?: string;
    description?: string;
    timestamp: Date;
  };
  tradingActivity?: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    timestamp: Date;
  };
  userProfile: {
    registrationDate: Date;
    lastLoginDate: Date;
    typicalLoginTimes: number[]; // Hours of day
    typicalLocations: Array<{
      country: string;
      city: string;
      frequency: number;
    }>;
    averageSessionDuration: number;
    deviceHistory: Array<{
      deviceFingerprint: string;
      lastUsed: Date;
      trusted: boolean;
    }>;
    riskScore: number;
  };
}

export interface FraudScore {
  overall: number;
  categories: {
    location: number;
    device: number;
    behavioral: number;
    transaction: number;
    temporal: number;
  };
  riskFactors: Array<{
    category: string;
    factor: string;
    score: number;
    weight: number;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  recommendation: 'ALLOW' | 'CHALLENGE' | 'BLOCK' | 'REVIEW';
  confidence: number;
}

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  constructor(
    @InjectRepository(ComplianceCheck)
    private readonly complianceCheckRepository: Repository<ComplianceCheck>,
    @InjectRepository(RiskAlert)
    private readonly riskAlertRepository: Repository<RiskAlert>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async detectFraud(params: FraudDetectionParams): Promise<FraudScore> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting fraud detection for user ${params.userId}`);

      // Create compliance check record
      const complianceCheck = this.complianceCheckRepository.create({
        userId: params.userId,
        accountId: params.accountId,
        complianceType: ComplianceType.AML, // Using AML as closest match
        status: ComplianceStatus.PENDING,
        checkParams: params,
      });

      await this.complianceCheckRepository.save(complianceCheck);

      // Calculate fraud scores for different categories
      const locationScore = await this.calculateLocationRisk(params);
      const deviceScore = await this.calculateDeviceRisk(params);
      const behavioralScore = await this.calculateBehavioralRisk(params);
      const transactionScore = await this.calculateTransactionRisk(params);
      const temporalScore = await this.calculateTemporalRisk(params);

      // Combine scores with weights
      const weights = {
        location: 0.25,
        device: 0.20,
        behavioral: 0.25,
        transaction: 0.20,
        temporal: 0.10,
      };

      const overallScore = (
        locationScore.score * weights.location +
        deviceScore.score * weights.device +
        behavioralScore.score * weights.behavioral +
        transactionScore.score * weights.transaction +
        temporalScore.score * weights.temporal
      );

      // Collect all risk factors
      const riskFactors = [
        ...locationScore.factors,
        ...deviceScore.factors,
        ...behavioralScore.factors,
        ...transactionScore.factors,
        ...temporalScore.factors,
      ].sort((a, b) => b.score - a.score);

      // Determine recommendation
      const recommendation = this.determineRecommendation(overallScore, riskFactors);
      
      // Calculate confidence based on data availability and quality
      const confidence = this.calculateConfidence(params, riskFactors);

      const fraudScore: FraudScore = {
        overall: overallScore,
        categories: {
          location: locationScore.score,
          device: deviceScore.score,
          behavioral: behavioralScore.score,
          transaction: transactionScore.score,
          temporal: temporalScore.score,
        },
        riskFactors,
        recommendation,
        confidence,
      };

      // Update compliance check
      const processingTime = Date.now() - startTime;
      complianceCheck.status = ComplianceStatus.COMPLETED;
      complianceCheck.severity = this.determineSeverity(overallScore);
      complianceCheck.checkResults = {
        passed: recommendation === 'ALLOW',
        score: overallScore,
        flags: riskFactors.filter(rf => rf.score > 70).map(rf => ({
          flag: rf.factor,
          severity: rf.severity,
          description: rf.description,
          value: rf.score,
          threshold: 70,
        })),
        evidence: fraudScore,
        externalSources: ['device_fingerprinting', 'geolocation', 'behavioral_analytics'],
      };
      complianceCheck.processingTimeMs = processingTime;
      complianceCheck.rulesEvaluated = ['location_analysis', 'device_analysis', 'behavioral_analysis', 'transaction_analysis', 'temporal_analysis'];

      // Set escalation if high risk
      if (overallScore > 80 || recommendation === 'BLOCK') {
        complianceCheck.requiresEscalation = true;
        complianceCheck.escalationReason = 'High fraud risk detected';
        complianceCheck.remedialActions = this.generateFraudRemedialActions(recommendation, riskFactors);
      }

      await this.complianceCheckRepository.save(complianceCheck);

      // Create alert if high risk
      if (overallScore > 60 || recommendation === 'BLOCK' || recommendation === 'REVIEW') {
        await this.createFraudAlert(params, fraudScore, complianceCheck.id);
      }

      // Emit event
      this.eventEmitter.emit('fraud.detection.completed', {
        checkId: complianceCheck.id,
        userId: params.userId,
        fraudScore: overallScore,
        recommendation,
        confidence,
      });

      this.logger.log(`Fraud detection completed for user ${params.userId}. Score: ${overallScore.toFixed(2)}, Recommendation: ${recommendation}`);

      return fraudScore;
    } catch (error) {
      this.logger.error(`Fraud detection failed for user ${params.userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async calculateLocationRisk(params: FraudDetectionParams): Promise<{ score: number; factors: any[] }> {
    const factors = [];
    let score = 0;

    const currentLocation = params.sessionData.location;
    const typicalLocations = params.userProfile.typicalLocations;

    // Check if current location is unusual
    const isTypicalLocation = typicalLocations.some(loc => 
      loc.country === currentLocation.country && 
      loc.city === currentLocation.city
    );

    if (!isTypicalLocation) {
      const locationRisk = 70;
      score += locationRisk;
      factors.push({
        category: 'location',
        factor: 'unusual_location',
        score: locationRisk,
        weight: 0.8,
        description: `Login from unusual location: ${currentLocation.city}, ${currentLocation.country}`,
        severity: 'HIGH' as const,
      });
    }

    // Check for high-risk countries
    const highRiskCountries = ['XX', 'YY', 'ZZ']; // Example high-risk country codes
    if (highRiskCountries.includes(currentLocation.country)) {
      const countryRisk = 85;
      score += countryRisk;
      factors.push({
        category: 'location',
        factor: 'high_risk_country',
        score: countryRisk,
        weight: 0.9,
        description: `Login from high-risk country: ${currentLocation.country}`,
        severity: 'CRITICAL' as const,
      });
    }

    // Check for impossible travel (if we have coordinates and previous login location)
    if (params.userProfile.lastLoginDate) {
      const timeDiff = (params.sessionData.loginTime.getTime() - params.userProfile.lastLoginDate.getTime()) / (1000 * 60 * 60); // hours
      
      // This would require previous location data and distance calculation
      // For now, we'll use a simplified check
      if (timeDiff < 2 && !isTypicalLocation) {
        const impossibleTravelRisk = 90;
        score += impossibleTravelRisk;
        factors.push({
          category: 'location',
          factor: 'impossible_travel',
          score: impossibleTravelRisk,
          weight: 1.0,
          description: `Impossible travel detected: too quick location change (${timeDiff.toFixed(1)} hours)`,
          severity: 'CRITICAL' as const,
        });
      }
    }

    return { score: Math.min(100, score), factors };
  }

  private async calculateDeviceRisk(params: FraudDetectionParams): Promise<{ score: number; factors: any[] }> {
    const factors = [];
    let score = 0;

    const currentDevice = params.sessionData.deviceFingerprint;
    const deviceHistory = params.userProfile.deviceHistory;

    // Check if device is recognized
    const knownDevice = deviceHistory.find(d => d.deviceFingerprint === currentDevice);
    
    if (!knownDevice) {
      const newDeviceRisk = 60;
      score += newDeviceRisk;
      factors.push({
        category: 'device',
        factor: 'unknown_device',
        score: newDeviceRisk,
        weight: 0.7,
        description: 'Login from unrecognized device',
        severity: 'MEDIUM' as const,
      });
    } else if (!knownDevice.trusted) {
      const untrustedDeviceRisk = 40;
      score += untrustedDeviceRisk;
      factors.push({
        category: 'device',
        factor: 'untrusted_device',
        score: untrustedDeviceRisk,
        weight: 0.5,
        description: 'Login from previously flagged device',
        severity: 'MEDIUM' as const,
      });
    }

    // Check for suspicious user agent patterns
    const userAgent = params.sessionData.userAgent;
    if (this.isSuspiciousUserAgent(userAgent)) {
      const suspiciousUARisk = 50;
      score += suspiciousUARisk;
      factors.push({
        category: 'device',
        factor: 'suspicious_user_agent',
        score: suspiciousUARisk,
        weight: 0.6,
        description: 'Suspicious user agent detected',
        severity: 'MEDIUM' as const,
      });
    }

    // Check for device fingerprint anomalies
    if (this.hasDeviceFingerprintAnomalies(currentDevice)) {
      const fingerprintRisk = 70;
      score += fingerprintRisk;
      factors.push({
        category: 'device',
        factor: 'device_fingerprint_anomaly',
        score: fingerprintRisk,
        weight: 0.8,
        description: 'Device fingerprint shows signs of manipulation',
        severity: 'HIGH' as const,
      });
    }

    return { score: Math.min(100, score), factors };
  }

  private async calculateBehavioralRisk(params: FraudDetectionParams): Promise<{ score: number; factors: any[] }> {
    const factors = [];
    let score = 0;

    // Check session duration anomalies
    const currentSessionDuration = params.sessionData.sessionDuration;
    const avgSessionDuration = params.userProfile.averageSessionDuration;

    if (avgSessionDuration > 0) {
      const durationRatio = currentSessionDuration / avgSessionDuration;
      
      if (durationRatio < 0.1 || durationRatio > 10) { // Very short or very long sessions
        const durationRisk = 50;
        score += durationRisk;
        factors.push({
          category: 'behavioral',
          factor: 'unusual_session_duration',
          score: durationRisk,
          weight: 0.4,
          description: `Unusual session duration: ${currentSessionDuration}s (avg: ${avgSessionDuration}s)`,
          severity: 'MEDIUM' as const,
        });
      }
    }

    // Check login time patterns
    const currentHour = params.sessionData.loginTime.getHours();
    const typicalLoginTimes = params.userProfile.typicalLoginTimes;
    
    const isTypicalTime = typicalLoginTimes.some(hour => Math.abs(hour - currentHour) <= 2);
    
    if (!isTypicalTime && typicalLoginTimes.length > 0) {
      const timeRisk = 40;
      score += timeRisk;
      factors.push({
        category: 'behavioral',
        factor: 'unusual_login_time',
        score: timeRisk,
        weight: 0.3,
        description: `Login at unusual time: ${currentHour}:00 (typical: ${typicalLoginTimes.join(', ')})`,
        severity: 'LOW' as const,
      });
    }

    // Check for rapid successive actions (if transaction/trading data available)
    if (params.transactionData || params.tradingActivity) {
      const actionTime = params.transactionData?.timestamp || params.tradingActivity?.timestamp;
      const timeSinceLogin = (actionTime.getTime() - params.sessionData.loginTime.getTime()) / 1000; // seconds
      
      if (timeSinceLogin < 30) { // Action within 30 seconds of login
        const rapidActionRisk = 60;
        score += rapidActionRisk;
        factors.push({
          category: 'behavioral',
          factor: 'rapid_action_after_login',
          score: rapidActionRisk,
          weight: 0.7,
          description: `High-value action performed ${timeSinceLogin}s after login`,
          severity: 'HIGH' as const,
        });
      }
    }

    return { score: Math.min(100, score), factors };
  }

  private async calculateTransactionRisk(params: FraudDetectionParams): Promise<{ score: number; factors: any[] }> {
    const factors = [];
    let score = 0;

    if (!params.transactionData && !params.tradingActivity) {
      return { score: 0, factors };
    }

    // Transaction amount analysis
    if (params.transactionData) {
      const amount = params.transactionData.amount;
      
      // Check for round numbers (often associated with fraud)
      if (amount % 1000 === 0 && amount >= 10000) {
        const roundNumberRisk = 30;
        score += roundNumberRisk;
        factors.push({
          category: 'transaction',
          factor: 'round_amount',
          score: roundNumberRisk,
          weight: 0.3,
          description: `Transaction for round amount: ${amount}`,
          severity: 'LOW' as const,
        });
      }

      // Check for unusually large amounts
      if (amount > 100000) {
        const largeAmountRisk = 70;
        score += largeAmountRisk;
        factors.push({
          category: 'transaction',
          factor: 'large_transaction',
          score: largeAmountRisk,
          weight: 0.8,
          description: `Large transaction amount: ${amount}`,
          severity: 'HIGH' as const,
        });
      }

      // Check for suspicious recipients (if available)
      if (params.transactionData.recipient && this.isSuspiciousRecipient(params.transactionData.recipient)) {
        const recipientRisk = 80;
        score += recipientRisk;
        factors.push({
          category: 'transaction',
          factor: 'suspicious_recipient',
          score: recipientRisk,
          weight: 0.9,
          description: 'Transaction to flagged recipient',
          severity: 'HIGH' as const,
        });
      }
    }

    // Trading activity analysis
    if (params.tradingActivity) {
      const { quantity, price } = params.tradingActivity;
      const tradeValue = quantity * price;

      // Check for unusually large trades
      if (tradeValue > 500000) {
        const largeTradRisk = 60;
        score += largeTradRisk;
        factors.push({
          category: 'transaction',
          factor: 'large_trade',
          score: largeTradRisk,
          weight: 0.7,
          description: `Large trade value: ${tradeValue}`,
          severity: 'MEDIUM' as const,
        });
      }
    }

    return { score: Math.min(100, score), factors };
  }

  private async calculateTemporalRisk(params: FraudDetectionParams): Promise<{ score: number; factors: any[] }> {
    const factors = [];
    let score = 0;

    const currentTime = params.sessionData.loginTime;
    const lastLogin = params.userProfile.lastLoginDate;

    if (lastLogin) {
      const timeSinceLastLogin = (currentTime.getTime() - lastLogin.getTime()) / (1000 * 60 * 60); // hours

      // Very quick successive logins
      if (timeSinceLastLogin < 0.5) { // 30 minutes
        const quickLoginRisk = 40;
        score += quickLoginRisk;
        factors.push({
          category: 'temporal',
          factor: 'rapid_successive_login',
          score: quickLoginRisk,
          weight: 0.5,
          description: `Login ${timeSinceLastLogin.toFixed(1)} hours after previous login`,
          severity: 'MEDIUM' as const,
        });
      }

      // Very long time since last login for active account
      if (timeSinceLastLogin > 24 * 30) { // 30 days
        const dormantRisk = 50;
        score += dormantRisk;
        factors.push({
          category: 'temporal',
          factor: 'dormant_account_activity',
          score: dormantRisk,
          weight: 0.6,
          description: `Account dormant for ${Math.floor(timeSinceLastLogin / 24)} days`,
          severity: 'MEDIUM' as const,
        });
      }
    }

    // Check for weekend/holiday activity (higher risk)
    const dayOfWeek = currentTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      const weekendRisk = 20;
      score += weekendRisk;
      factors.push({
        category: 'temporal',
        factor: 'weekend_activity',
        score: weekendRisk,
        weight: 0.2,
        description: 'Activity during weekend',
        severity: 'LOW' as const,
      });
    }

    // Check for very early morning or late night activity
    const hour = currentTime.getHours();
    if (hour < 6 || hour > 22) {
      const oddHourRisk = 30;
      score += oddHourRisk;
      factors.push({
        category: 'temporal',
        factor: 'odd_hour_activity',
        score: oddHourRisk,
        weight: 0.3,
        description: `Activity at unusual hour: ${hour}:00`,
        severity: 'LOW' as const,
      });
    }

    return { score: Math.min(100, score), factors };
  }

  private determineRecommendation(overallScore: number, riskFactors: any[]): FraudScore['recommendation'] {
    const criticalFactors = riskFactors.filter(rf => rf.severity === 'CRITICAL');
    const highRiskFactors = riskFactors.filter(rf => rf.severity === 'HIGH');

    if (criticalFactors.length > 0 || overallScore > 85) {
      return 'BLOCK';
    }

    if (highRiskFactors.length > 1 || overallScore > 70) {
      return 'REVIEW';
    }

    if (highRiskFactors.length > 0 || overallScore > 50) {
      return 'CHALLENGE';
    }

    return 'ALLOW';
  }

  private calculateConfidence(params: FraudDetectionParams, riskFactors: any[]): number {
    let confidence = 100;

    // Reduce confidence if limited historical data
    if (params.userProfile.typicalLocations.length < 2) confidence -= 20;
    if (params.userProfile.deviceHistory.length < 2) confidence -= 15;
    if (params.userProfile.typicalLoginTimes.length < 3) confidence -= 10;

    // Reduce confidence if account is new
    const accountAge = (Date.now() - params.userProfile.registrationDate.getTime()) / (1000 * 60 * 60 * 24); // days
    if (accountAge < 30) confidence -= 25;

    // Increase confidence if multiple risk factors align
    const categoryCount = new Set(riskFactors.map(rf => rf.category)).size;
    if (categoryCount >= 3) confidence += 10;

    return Math.max(50, Math.min(100, confidence));
  }

  private determineSeverity(overallScore: number): ComplianceSeverity {
    if (overallScore > 85) return ComplianceSeverity.CRITICAL;
    if (overallScore > 70) return ComplianceSeverity.MAJOR;
    if (overallScore > 50) return ComplianceSeverity.MINOR;
    if (overallScore > 30) return ComplianceSeverity.WARNING;
    return ComplianceSeverity.INFO;
  }

  private generateFraudRemedialActions(recommendation: FraudScore['recommendation'], riskFactors: any[]): string[] {
    const actions = [];

    switch (recommendation) {
      case 'BLOCK':
        actions.push('Block all account access');
        actions.push('Require identity re-verification');
        actions.push('Contact user via verified phone/email');
        break;
      case 'REVIEW':
        actions.push('Flag for manual review');
        actions.push('Limit transaction amounts');
        actions.push('Require additional authentication');
        break;
      case 'CHALLENGE':
        actions.push('Require MFA verification');
        actions.push('Send security notification to user');
        break;
      case 'ALLOW':
        actions.push('Monitor subsequent activity');
        break;
    }

    // Add specific actions based on risk factors
    const criticalFactors = riskFactors.filter(rf => rf.severity === 'CRITICAL');
    for (const factor of criticalFactors) {
      if (factor.factor === 'impossible_travel') {
        actions.push('Verify user location via phone call');
      }
      if (factor.factor === 'high_risk_country') {
        actions.push('Enhanced due diligence review');
      }
    }

    return [...new Set(actions)];
  }

  private async createFraudAlert(
    params: FraudDetectionParams,
    fraudScore: FraudScore,
    checkId: string,
  ): Promise<void> {
    let alertType = AlertType.SUSPICIOUS_ACTIVITY;
    let severity = AlertSeverity.MEDIUM;
    let priority = AlertPriority.P3;

    if (fraudScore.recommendation === 'BLOCK') {
      alertType = AlertType.FRAUD_DETECTION;
      severity = AlertSeverity.CRITICAL;
      priority = AlertPriority.P1;
    } else if (fraudScore.recommendation === 'REVIEW') {
      severity = AlertSeverity.HIGH;
      priority = AlertPriority.P2;
    }

    const alert = this.riskAlertRepository.create({
      userId: params.userId,
      accountId: params.accountId,
      alertType,
      severity,
      priority,
      title: 'Fraud Detection Alert',
      description: `Fraud risk detected for user ${params.userId}. Score: ${fraudScore.overall.toFixed(2)}, Recommendation: ${fraudScore.recommendation}`,
      triggerConditions: {
        rule: 'fraud_detection',
        threshold: 60,
        actualValue: fraudScore.overall,
        operator: 'greater_than',
        timeWindow: 'immediate',
      },
      contextData: {
        checkId,
        fraudScore,
        sessionData: params.sessionData,
      },
      recommendedActions: this.generateFraudRemedialActions(fraudScore.recommendation, fraudScore.riskFactors),
      automaticActions: fraudScore.recommendation === 'BLOCK' ? ['Account access blocked'] : [],
      impactAssessment: {
        financialImpact: params.transactionData?.amount || 0,
        riskExposure: fraudScore.overall,
        affectedPositions: 0,
        potentialLoss: params.transactionData?.amount || 50000,
        timeToResolution: fraudScore.recommendation === 'BLOCK' ? '1-2 hours' : '15-30 minutes',
      },
      relatedEntities: {
        trades: [],
        positions: [],
        accounts: [params.accountId],
        alerts: [],
      },
      notificationChannels: fraudScore.recommendation === 'BLOCK' 
        ? ['dashboard', 'email', 'sms', 'security_team'] 
        : ['dashboard', 'email'],
    });

    await this.riskAlertRepository.save(alert);
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    // Check for common patterns associated with automated tools or suspicious software
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /headless/i,
      /phantom/i,
      /selenium/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private hasDeviceFingerprintAnomalies(fingerprint: string): boolean {
    // Check for device fingerprint manipulation indicators
    // This would involve more sophisticated analysis in a real implementation
    
    // Simple checks for now
    if (fingerprint.length < 10) return true; // Too simple fingerprint
    if (fingerprint === 'unknown' || fingerprint === 'null') return true;
    
    return false;
  }

  private isSuspiciousRecipient(recipient: string): boolean {
    // Check against known suspicious recipient patterns or blacklists
    const suspiciousPatterns = [
      /temp/i,
      /test/i,
      /fake/i,
      /\d{10,}/, // Long numeric sequences
    ];

    return suspiciousPatterns.some(pattern => pattern.test(recipient));
  }

  @Cron(CronExpression.EVERY_HOUR)
  async performContinuousMonitoring(): Promise<void> {
    this.logger.log('Starting continuous fraud monitoring...');
    
    try {
      // This would continuously monitor for fraud patterns across all users
      // For now, it's a placeholder for the scheduled job
      this.logger.log('Continuous fraud monitoring completed');
    } catch (error) {
      this.logger.error('Continuous fraud monitoring failed:', error);
    }
  }

  async getFraudHistory(userId: string, days: number = 30): Promise<ComplianceCheck[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    return this.complianceCheckRepository.find({
      where: {
        userId,
        complianceType: ComplianceType.AML,
        createdAt: MoreThan(fromDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserRiskProfile(userId: string): Promise<{
    currentRiskScore: number;
    riskTrend: 'increasing' | 'decreasing' | 'stable';
    lastFraudCheck: Date;
    trustedDevices: number;
    typicalLocations: number;
  }> {
    // This would aggregate fraud-related data for a user
    // For now, return placeholder data
    return {
      currentRiskScore: 25,
      riskTrend: 'stable',
      lastFraudCheck: new Date(),
      trustedDevices: 3,
      typicalLocations: 2,
    };
  }
}