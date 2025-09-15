import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ComplianceCheck,
  ComplianceType,
  ComplianceStatus,
  ComplianceSeverity,
} from '../entities/compliance-check.entity';
import { RiskAlert, AlertType, AlertSeverity } from '../entities/risk-alert.entity';

export interface KYCCheckParams {
  userId: string;
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    phone: string;
    email: string;
    taxId?: string;
    passportNumber?: string;
    drivingLicenseNumber?: string;
  };
  documents: Array<{
    type: 'passport' | 'driving_license' | 'utility_bill' | 'bank_statement' | 'tax_document';
    url: string;
    verified: boolean;
  }>;
  riskProfile: 'low' | 'medium' | 'high';
  investmentExperience: 'beginner' | 'intermediate' | 'experienced' | 'professional';
  estimatedNetWorth?: number;
  annualIncome?: number;
}

export interface AMLCheckParams {
  userId: string;
  transactionData: {
    amount: number;
    currency: string;
    sourceOfFunds: string;
    destinationAccount?: string;
    purpose: string;
  };
  userProfile: {
    riskRating: number;
    previousTransactions: Array<{
      amount: number;
      date: Date;
      type: string;
    }>;
    geographicRisk: 'low' | 'medium' | 'high';
    businessRelationshipDuration: number; // months
  };
}

export interface TradeComplianceParams {
  userId: string;
  accountId: string;
  tradeData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    orderType: string;
    timestamp: Date;
  };
  marketData: {
    volume: number;
    volatility: number;
    priceMovement: number;
    timeOfDay: string;
  };
}

@Injectable()
export class ComplianceMonitoringService {
  private readonly logger = new Logger(ComplianceMonitoringService.name);

  // External services would be injected in a real implementation
  private readonly sanctionsListUrl = 'https://api.sanctions-list.com/v1/check';
  private readonly pepListUrl = 'https://api.pep-database.com/v1/check';
  private readonly documentVerificationUrl = 'https://api.document-verify.com/v1/verify';

  constructor(
    @InjectRepository(ComplianceCheck)
    private readonly complianceCheckRepository: Repository<ComplianceCheck>,
    @InjectRepository(RiskAlert)
    private readonly riskAlertRepository: Repository<RiskAlert>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async performKYCCheck(params: KYCCheckParams): Promise<ComplianceCheck> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting KYC check for user ${params.userId}`);

      const complianceCheck = this.complianceCheckRepository.create({
        userId: params.userId,
        complianceType: ComplianceType.KYC,
        status: ComplianceStatus.PENDING,
        checkParams: params,
      });

      await this.complianceCheckRepository.save(complianceCheck);

      // Perform various KYC checks
      const checkResults = {
        passed: true,
        score: 0,
        flags: [],
        evidence: {},
        externalSources: [],
      };

      // 1. Identity Verification
      const identityScore = await this.verifyIdentity(params);
      checkResults.score += identityScore * 0.3;

      // 2. Document Verification
      const documentScore = await this.verifyDocuments(params.documents);
      checkResults.score += documentScore * 0.25;

      // 3. Address Verification
      const addressScore = await this.verifyAddress(params.personalInfo.address);
      checkResults.score += addressScore * 0.2;

      // 4. Sanctions Screening
      const sanctionsResult = await this.checkSanctionsList(params.personalInfo);
      checkResults.score += sanctionsResult.score * 0.15;
      if (sanctionsResult.flags.length > 0) {
        checkResults.flags.push(...sanctionsResult.flags);
      }

      // 5. PEP Screening
      const pepResult = await this.checkPEPList(params.personalInfo);
      checkResults.score += pepResult.score * 0.1;
      if (pepResult.flags.length > 0) {
        checkResults.flags.push(...pepResult.flags);
      }

      // Determine overall result
      const finalScore = Math.min(100, checkResults.score);
      checkResults.passed = finalScore >= 70 && checkResults.flags.length === 0;

      // Determine severity based on flags and score
      let severity = ComplianceSeverity.INFO;
      if (checkResults.flags.some(f => f.severity === 'CRITICAL')) {
        severity = ComplianceSeverity.REGULATORY_BREACH;
      } else if (checkResults.flags.some(f => f.severity === 'MAJOR') || finalScore < 50) {
        severity = ComplianceSeverity.MAJOR;
      } else if (finalScore < 70) {
        severity = ComplianceSeverity.MINOR;
      }

      // Update compliance check
      const processingTime = Date.now() - startTime;
      complianceCheck.status = checkResults.passed ? ComplianceStatus.PASSED : ComplianceStatus.FAILED;
      complianceCheck.severity = severity;
      complianceCheck.checkResults = checkResults;
      complianceCheck.processingTimeMs = processingTime;
      complianceCheck.rulesEvaluated = ['identity_verification', 'document_verification', 'address_verification', 'sanctions_screening', 'pep_screening'];
      complianceCheck.failedRules = checkResults.flags.map(f => f.flag);
      complianceCheck.regulatoryRefs = ['KYC_AML_2024', 'EU_GDPR', 'US_PATRIOT_ACT'];

      if (!checkResults.passed) {
        complianceCheck.requiresEscalation = true;
        complianceCheck.escalationReason = 'KYC check failed - manual review required';
        
        // Generate remedial actions
        complianceCheck.remedialActions = this.generateKYCRemedialActions(checkResults.flags);
      }

      await this.complianceCheckRepository.save(complianceCheck);

      // Create alert if failed or requires review
      if (!checkResults.passed || severity >= ComplianceSeverity.MAJOR) {
        await this.createComplianceAlert(complianceCheck, 'KYC Check Failed', checkResults);
      }

      // Emit event
      this.eventEmitter.emit('compliance.kyc.completed', {
        checkId: complianceCheck.id,
        userId: params.userId,
        passed: checkResults.passed,
        score: finalScore,
      });

      this.logger.log(`KYC check completed for user ${params.userId}. Passed: ${checkResults.passed}, Score: ${finalScore}`);

      return complianceCheck;
    } catch (error) {
      this.logger.error(`KYC check failed for user ${params.userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async performAMLCheck(params: AMLCheckParams): Promise<ComplianceCheck> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting AML check for user ${params.userId}`);

      const complianceCheck = this.complianceCheckRepository.create({
        userId: params.userId,
        complianceType: ComplianceType.AML,
        status: ComplianceStatus.PENDING,
        checkParams: params,
      });

      await this.complianceCheckRepository.save(complianceCheck);

      const checkResults = {
        passed: true,
        score: 0,
        flags: [],
        evidence: {},
        externalSources: [],
      };

      // 1. Transaction Pattern Analysis
      const transactionScore = await this.analyzeTransactionPatterns(params);
      checkResults.score += transactionScore * 0.4;

      // 2. Source of Funds Verification
      const sourceOfFundsScore = await this.verifySourceOfFunds(params);
      checkResults.score += sourceOfFundsScore * 0.3;

      // 3. Geographic Risk Assessment
      const geoRiskScore = await this.assessGeographicRisk(params.userProfile);
      checkResults.score += geoRiskScore * 0.2;

      // 4. Behavioral Analysis
      const behaviorScore = await this.analyzeBehavioralPatterns(params);
      checkResults.score += behaviorScore * 0.1;

      const finalScore = Math.min(100, checkResults.score);
      checkResults.passed = finalScore >= 70 && checkResults.flags.length === 0;

      // Update compliance check
      const processingTime = Date.now() - startTime;
      complianceCheck.status = checkResults.passed ? ComplianceStatus.PASSED : ComplianceStatus.FAILED;
      complianceCheck.checkResults = checkResults;
      complianceCheck.processingTimeMs = processingTime;
      complianceCheck.rulesEvaluated = ['transaction_patterns', 'source_of_funds', 'geographic_risk', 'behavioral_analysis'];

      if (!checkResults.passed) {
        complianceCheck.severity = ComplianceSeverity.MAJOR;
        complianceCheck.requiresEscalation = true;
        complianceCheck.escalationReason = 'AML check failed - potential money laundering activity';
        complianceCheck.remedialActions = ['Freeze account', 'Request additional documentation', 'Report to authorities'];
      }

      await this.complianceCheckRepository.save(complianceCheck);

      // Create alert if failed
      if (!checkResults.passed) {
        await this.createComplianceAlert(complianceCheck, 'AML Check Failed', checkResults);
      }

      this.eventEmitter.emit('compliance.aml.completed', {
        checkId: complianceCheck.id,
        userId: params.userId,
        passed: checkResults.passed,
        score: finalScore,
      });

      return complianceCheck;
    } catch (error) {
      this.logger.error(`AML check failed for user ${params.userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async performTradeComplianceCheck(params: TradeComplianceParams): Promise<ComplianceCheck> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting trade compliance check for user ${params.userId}`);

      const complianceCheck = this.complianceCheckRepository.create({
        userId: params.userId,
        accountId: params.accountId,
        complianceType: ComplianceType.TRADE_SURVEILLANCE,
        status: ComplianceStatus.PENDING,
        checkParams: params,
      });

      await this.complianceCheckRepository.save(complianceCheck);

      const checkResults = {
        passed: true,
        score: 100,
        flags: [],
        evidence: {},
        externalSources: [],
      };

      // 1. Market Manipulation Detection
      const manipulationRisk = await this.detectMarketManipulation(params);
      if (manipulationRisk.risk > 0.7) {
        checkResults.flags.push({
          flag: 'potential_market_manipulation',
          severity: 'MAJOR',
          description: 'Trade pattern suggests potential market manipulation',
          value: manipulationRisk.risk,
          threshold: 0.7,
        });
        checkResults.score -= 40;
      }

      // 2. Insider Trading Detection
      const insiderTradingRisk = await this.detectInsiderTrading(params);
      if (insiderTradingRisk.risk > 0.6) {
        checkResults.flags.push({
          flag: 'potential_insider_trading',
          severity: 'CRITICAL',
          description: 'Trade timing and size suggest potential insider trading',
          value: insiderTradingRisk.risk,
          threshold: 0.6,
        });
        checkResults.score -= 60;
      }

      // 3. Position Limit Checks
      const positionLimitViolation = await this.checkPositionLimits(params);
      if (positionLimitViolation.violation) {
        checkResults.flags.push({
          flag: 'position_limit_violation',
          severity: 'MINOR',
          description: 'Trade would exceed position limits',
          value: positionLimitViolation.currentPosition,
          threshold: positionLimitViolation.limit,
        });
        checkResults.score -= 20;
      }

      // 4. Trading Hours Compliance
      const tradingHoursCheck = await this.checkTradingHours(params);
      if (!tradingHoursCheck.compliant) {
        checkResults.flags.push({
          flag: 'trading_hours_violation',
          severity: 'MINOR',
          description: 'Trade executed outside normal trading hours',
          value: params.tradeData.timestamp.getHours(),
          threshold: '09:30-16:00',
        });
        checkResults.score -= 10;
      }

      checkResults.passed = checkResults.score >= 60 && !checkResults.flags.some(f => f.severity === 'CRITICAL');

      // Update compliance check
      const processingTime = Date.now() - startTime;
      complianceCheck.status = checkResults.passed ? ComplianceStatus.PASSED : ComplianceStatus.FAILED;
      complianceCheck.checkResults = checkResults;
      complianceCheck.processingTimeMs = processingTime;
      complianceCheck.rulesEvaluated = ['market_manipulation', 'insider_trading', 'position_limits', 'trading_hours'];

      if (!checkResults.passed) {
        const criticalFlags = checkResults.flags.filter(f => f.severity === 'CRITICAL');
        complianceCheck.severity = criticalFlags.length > 0 ? ComplianceSeverity.REGULATORY_BREACH : ComplianceSeverity.MAJOR;
        complianceCheck.requiresEscalation = true;
        complianceCheck.escalationReason = 'Trade compliance check failed';
        complianceCheck.remedialActions = ['Cancel trade', 'Investigate further', 'Report to compliance officer'];
      }

      await this.complianceCheckRepository.save(complianceCheck);

      // Create alert if failed
      if (!checkResults.passed) {
        await this.createComplianceAlert(complianceCheck, 'Trade Compliance Violation', checkResults);
      }

      this.eventEmitter.emit('compliance.trade.completed', {
        checkId: complianceCheck.id,
        userId: params.userId,
        tradeId: params.tradeData.symbol,
        passed: checkResults.passed,
        score: checkResults.score,
      });

      return complianceCheck;
    } catch (error) {
      this.logger.error(`Trade compliance check failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async verifyIdentity(params: KYCCheckParams): Promise<number> {
    // Simulate identity verification logic
    let score = 80; // Base score

    // Check completeness of information
    const requiredFields = ['fullName', 'dateOfBirth', 'nationality', 'address', 'phone', 'email'];
    const providedFields = requiredFields.filter(field => 
      params.personalInfo[field] && 
      (typeof params.personalInfo[field] === 'string' ? params.personalInfo[field].trim() : true)
    );

    score = (providedFields.length / requiredFields.length) * 100;

    // Additional verification checks would be performed here
    // e.g., cross-referencing with government databases

    return score;
  }

  private async verifyDocuments(documents: KYCCheckParams['documents']): Promise<number> {
    if (documents.length === 0) return 0;

    const requiredDocTypes = ['passport', 'utility_bill'];
    const providedTypes = new Set(documents.map(doc => doc.type));
    const verifiedDocs = documents.filter(doc => doc.verified);

    let score = 0;
    
    // Points for having required documents
    for (const reqType of requiredDocTypes) {
      if (providedTypes.has(reqType as any)) {
        score += 40;
      }
    }

    // Points for verification
    score += (verifiedDocs.length / documents.length) * 20;

    return Math.min(score, 100);
  }

  private async verifyAddress(address: KYCCheckParams['personalInfo']['address']): Promise<number> {
    // Simulate address verification
    const requiredFields = ['street', 'city', 'state', 'country', 'postalCode'];
    const providedFields = requiredFields.filter(field => address[field]?.trim());
    
    return (providedFields.length / requiredFields.length) * 100;
  }

  private async checkSanctionsList(personalInfo: KYCCheckParams['personalInfo']): Promise<{ score: number; flags: any[] }> {
    // Simulate sanctions list checking
    // In real implementation, this would call external sanctions databases
    
    const flags = [];
    let score = 100;

    // Simulate checking against OFAC, UN, EU sanctions lists
    const highRiskCountries = ['IR', 'KP', 'SY', 'CU']; // Example high-risk countries
    
    if (highRiskCountries.includes(personalInfo.nationality)) {
      flags.push({
        flag: 'high_risk_nationality',
        severity: 'MAJOR',
        description: `Nationality from high-risk country: ${personalInfo.nationality}`,
        value: personalInfo.nationality,
        threshold: 'allowed_countries',
      });
      score = 0;
    }

    return { score, flags };
  }

  private async checkPEPList(personalInfo: KYCCheckParams['personalInfo']): Promise<{ score: number; flags: any[] }> {
    // Simulate PEP (Politically Exposed Person) checking
    const flags = [];
    let score = 100;

    // In real implementation, this would check against PEP databases
    // For simulation, we'll check for certain name patterns that might indicate PEP status
    
    return { score, flags };
  }

  private async analyzeTransactionPatterns(params: AMLCheckParams): Promise<number> {
    const { transactionData, userProfile } = params;
    let score = 100;

    // Check for unusual transaction amounts
    const avgTransactionAmount = userProfile.previousTransactions.length > 0 
      ? userProfile.previousTransactions.reduce((sum, tx) => sum + tx.amount, 0) / userProfile.previousTransactions.length
      : 0;

    if (avgTransactionAmount > 0 && transactionData.amount > avgTransactionAmount * 10) {
      score -= 30; // Unusually large transaction
    }

    // Check transaction frequency
    const recentTransactions = userProfile.previousTransactions.filter(tx => {
      const daysDiff = (Date.now() - tx.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    if (recentTransactions.length > 50) {
      score -= 20; // High frequency trading might be suspicious
    }

    return Math.max(0, score);
  }

  private async verifySourceOfFunds(params: AMLCheckParams): Promise<number> {
    const validSources = ['salary', 'business_income', 'investment_returns', 'inheritance', 'loan'];
    const sourceOfFunds = params.transactionData.sourceOfFunds?.toLowerCase();

    if (validSources.includes(sourceOfFunds)) {
      return 100;
    }

    return 50; // Requires additional verification
  }

  private async assessGeographicRisk(userProfile: AMLCheckParams['userProfile']): Promise<number> {
    const riskMultiplier = {
      'low': 100,
      'medium': 70,
      'high': 30,
    };

    return riskMultiplier[userProfile.geographicRisk] || 50;
  }

  private async analyzeBehavioralPatterns(params: AMLCheckParams): Promise<number> {
    // Analyze user behavior patterns
    let score = 100;

    // New customer with large transactions
    if (params.userProfile.businessRelationshipDuration < 3 && params.transactionData.amount > 10000) {
      score -= 40;
    }

    // Inconsistent transaction patterns
    const amounts = params.userProfile.previousTransactions.map(tx => tx.amount);
    if (amounts.length > 0) {
      const stdDev = this.calculateStandardDeviation(amounts);
      const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      
      if (stdDev > mean * 2) {
        score -= 20; // High variability in transaction amounts
      }
    }

    return Math.max(0, score);
  }

  private async detectMarketManipulation(params: TradeComplianceParams): Promise<{ risk: number }> {
    let risk = 0;

    const { tradeData, marketData } = params;

    // Check for suspicious timing
    if (marketData.priceMovement > 5 && tradeData.quantity > marketData.volume * 0.1) {
      risk += 0.4; // Large trade during price movement
    }

    // Check for layering patterns (would require historical order data)
    // This is a simplified check
    if (tradeData.orderType === 'LIMIT' && tradeData.quantity > marketData.volume * 0.05) {
      risk += 0.3;
    }

    return { risk: Math.min(1, risk) };
  }

  private async detectInsiderTrading(params: TradeComplianceParams): Promise<{ risk: number }> {
    let risk = 0;

    // Check timing relative to market events
    // This would require integration with news feeds and corporate announcements
    
    // For now, check for unusual timing patterns
    const hour = params.tradeData.timestamp.getHours();
    if (hour < 9 || hour > 16) { // Outside normal trading hours
      risk += 0.2;
    }

    // Large positions before earnings/announcements
    if (params.tradeData.quantity > params.marketData.volume * 0.05) {
      risk += 0.3;
    }

    return { risk: Math.min(1, risk) };
  }

  private async checkPositionLimits(params: TradeComplianceParams): Promise<{ violation: boolean; currentPosition: number; limit: number }> {
    // This would check against actual position limits from the database
    const defaultLimit = 1000000; // $1M position limit
    const currentPosition = params.tradeData.quantity * params.tradeData.price;

    return {
      violation: currentPosition > defaultLimit,
      currentPosition,
      limit: defaultLimit,
    };
  }

  private async checkTradingHours(params: TradeComplianceParams): Promise<{ compliant: boolean }> {
    const hour = params.tradeData.timestamp.getHours();
    const minute = params.tradeData.timestamp.getMinutes();
    
    // Standard trading hours: 9:30 AM - 4:00 PM EST
    const marketOpen = 9.5; // 9:30 AM
    const marketClose = 16; // 4:00 PM
    const currentTime = hour + minute / 60;

    return {
      compliant: currentTime >= marketOpen && currentTime <= marketClose,
    };
  }

  private generateKYCRemedialActions(flags: any[]): string[] {
    const actions = ['Complete identity verification'];

    for (const flag of flags) {
      switch (flag.flag) {
        case 'high_risk_nationality':
          actions.push('Enhanced due diligence required');
          actions.push('Additional documentation needed');
          break;
        case 'document_verification_failed':
          actions.push('Provide alternative identification documents');
          break;
        case 'address_verification_failed':
          actions.push('Provide utility bill or bank statement');
          break;
        default:
          actions.push('Manual review required');
      }
    }

    return [...new Set(actions)]; // Remove duplicates
  }

  private async createComplianceAlert(
    check: ComplianceCheck,
    title: string,
    results: any,
  ): Promise<void> {
    const alert = this.riskAlertRepository.create({
      userId: check.userId,
      accountId: check.accountId,
      alertType: AlertType.REGULATORY_BREACH,
      severity: check.severity === ComplianceSeverity.REGULATORY_BREACH 
        ? AlertSeverity.CRITICAL 
        : AlertSeverity.HIGH,
      title,
      description: `Compliance check failed: ${check.complianceType}`,
      triggerConditions: {
        rule: 'compliance_check',
        threshold: 70,
        actualValue: results.score,
        operator: 'less_than',
        timeWindow: 'immediate',
      },
      contextData: {
        checkId: check.id,
        complianceType: check.complianceType,
        flags: results.flags,
      },
      recommendedActions: check.remedialActions || ['Review compliance requirements'],
      automaticActions: ['Account restricted pending review'],
      impactAssessment: {
        financialImpact: 0,
        riskExposure: 100 - results.score,
        affectedPositions: 0,
        potentialLoss: 0,
        timeToResolution: '24-48 hours',
      },
      relatedEntities: {
        trades: [],
        positions: [],
        accounts: check.accountId ? [check.accountId] : [],
        alerts: [],
      },
      notificationChannels: ['dashboard', 'email', 'compliance_team'],
    });

    await this.riskAlertRepository.save(alert);
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(variance);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async performDailyComplianceChecks(): Promise<void> {
    this.logger.log('Starting daily compliance monitoring...');
    
    try {
      // This would perform daily compliance checks for all active users
      // For now, it's a placeholder for the scheduled job
      this.logger.log('Daily compliance monitoring completed');
    } catch (error) {
      this.logger.error('Daily compliance monitoring failed:', error);
    }
  }

  async getComplianceHistory(userId: string, type?: ComplianceType): Promise<ComplianceCheck[]> {
    const where = type ? { userId, complianceType: type } : { userId };
    
    return this.complianceCheckRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getComplianceStatus(userId: string): Promise<Record<ComplianceType, ComplianceStatus>> {
    const checks = await this.complianceCheckRepository
      .createQueryBuilder('check')
      .select(['check.complianceType', 'check.status', 'check.createdAt'])
      .where('check.userId = :userId', { userId })
      .orderBy('check.createdAt', 'DESC')
      .getMany();

    const status: Record<ComplianceType, ComplianceStatus> = {} as any;

    for (const type of Object.values(ComplianceType)) {
      const latestCheck = checks.find(check => check.complianceType === type);
      status[type] = latestCheck ? latestCheck.status : ComplianceStatus.PENDING;
    }

    return status;
  }
}