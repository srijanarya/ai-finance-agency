import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  RiskAssessment,
  RiskLevel,
  AssessmentType,
  AssessmentStatus,
} from '../entities/risk-assessment.entity';
import { RiskAlert, AlertType, AlertSeverity } from '../entities/risk-alert.entity';

export interface TradeRiskParams {
  userId: string;
  accountId: string;
  tradeId?: string;
  symbol: string;
  assetType: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage?: number;
  portfolioValue: number;
  availableBalance: number;
  existingPositions: Array<{
    symbol: string;
    quantity: number;
    marketValue: number;
    unrealizedPnl: number;
  }>;
  marketData?: {
    volatility: number;
    liquidity: number;
    beta: number;
    correlation: number;
  };
}

export interface RiskAssessmentResult {
  riskLevel: RiskLevel;
  riskScore: number;
  factors: Array<{
    factor: string;
    value: number;
    weight: number;
    contribution: number;
    description: string;
  }>;
  recommendations: string[];
  warnings: string[];
  approved: boolean;
  maxPositionSize?: number;
  suggestedStopLoss?: number;
}

@Injectable()
export class TradeRiskAssessmentService {
  private readonly logger = new Logger(TradeRiskAssessmentService.name);

  constructor(
    @InjectRepository(RiskAssessment)
    private readonly riskAssessmentRepository: Repository<RiskAssessment>,
    @InjectRepository(RiskAlert)
    private readonly riskAlertRepository: Repository<RiskAlert>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async assessTradeRisk(params: TradeRiskParams): Promise<RiskAssessmentResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting trade risk assessment for user ${params.userId}, trade ${params.tradeId}`);

      // Create assessment record
      const assessment = this.riskAssessmentRepository.create({
        userId: params.userId,
        accountId: params.accountId,
        tradeId: params.tradeId,
        assessmentType: params.tradeId 
          ? AssessmentType.TRADE_POST_EXECUTION 
          : AssessmentType.TRADE_PRE_EXECUTION,
        status: AssessmentStatus.PENDING,
        assessmentParams: params,
      });

      await this.riskAssessmentRepository.save(assessment);

      // Calculate risk factors
      const factors = await this.calculateRiskFactors(params);
      
      // Calculate overall risk score
      const riskScore = this.calculateRiskScore(factors);
      const riskLevel = this.determineRiskLevel(riskScore);
      
      // Generate recommendations and warnings
      const recommendations = this.generateRecommendations(factors, params);
      const warnings = this.generateWarnings(factors, params);
      
      // Determine if trade should be approved
      const approved = this.shouldApproveTrade(riskScore, riskLevel, factors);

      // Calculate suggested parameters
      const maxPositionSize = this.calculateMaxPositionSize(params, factors);
      const suggestedStopLoss = this.calculateSuggestedStopLoss(params, factors);

      const result: RiskAssessmentResult = {
        riskLevel,
        riskScore,
        factors,
        recommendations,
        warnings,
        approved,
        maxPositionSize,
        suggestedStopLoss,
      };

      // Update assessment with results
      const processingTime = Date.now() - startTime;
      assessment.status = AssessmentStatus.COMPLETED;
      assessment.riskLevel = riskLevel;
      assessment.riskScore = riskScore;
      assessment.riskFactors = factors.map(f => f.factor);
      assessment.recommendations = recommendations;
      assessment.processingTimeMs = processingTime;
      assessment.assessmentResults = {
        factors,
        recommendations,
        warnings,
        metrics: {
          maxPositionSize,
          suggestedStopLoss,
          portfolioImpact: this.calculatePortfolioImpact(params),
          riskRewardRatio: this.calculateRiskRewardRatio(params),
        },
      };

      await this.riskAssessmentRepository.save(assessment);

      // Create alerts if necessary
      if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.VERY_HIGH || riskLevel === RiskLevel.CRITICAL) {
        await this.createRiskAlert(params, result, assessment.id);
      }

      // Emit event
      this.eventEmitter.emit('trade.risk.assessed', {
        assessmentId: assessment.id,
        userId: params.userId,
        tradeId: params.tradeId,
        riskLevel,
        riskScore,
        approved,
      });

      this.logger.log(`Trade risk assessment completed in ${processingTime}ms. Risk Level: ${riskLevel}, Score: ${riskScore}, Approved: ${approved}`);

      return result;
    } catch (error) {
      this.logger.error(`Trade risk assessment failed: ${error.message}`, error.stack);
      
      // Update assessment with error
      const assessment = await this.riskAssessmentRepository.findOne({
        where: { tradeId: params.tradeId || undefined, userId: params.userId },
        order: { createdAt: 'DESC' },
      });
      
      if (assessment) {
        assessment.status = AssessmentStatus.FAILED;
        assessment.assessmentResults = {
          factors: [],
          recommendations: ['Manual review required due to assessment failure'],
          warnings: [`Assessment failed: ${error.message}`],
          metrics: {},
        };
        await this.riskAssessmentRepository.save(assessment);
      }

      throw error;
    }
  }

  private async calculateRiskFactors(params: TradeRiskParams): Promise<Array<{
    factor: string;
    value: number;
    weight: number;
    contribution: number;
    description: string;
  }>> {
    const factors = [];

    // Position size risk
    const positionValue = params.quantity * params.price;
    const positionSizeRatio = positionValue / params.portfolioValue;
    factors.push({
      factor: 'position_size',
      value: positionSizeRatio,
      weight: 0.25,
      contribution: Math.min(positionSizeRatio * 100, 100) * 0.25,
      description: `Position represents ${(positionSizeRatio * 100).toFixed(2)}% of portfolio`,
    });

    // Leverage risk
    const leverage = params.leverage || 1;
    const leverageRisk = Math.log(leverage + 1) * 20; // Logarithmic scaling
    factors.push({
      factor: 'leverage',
      value: leverage,
      weight: 0.20,
      contribution: Math.min(leverageRisk, 100) * 0.20,
      description: `Trade uses ${leverage}x leverage`,
    });

    // Concentration risk
    const existingExposure = params.existingPositions
      .filter(p => p.symbol === params.symbol)
      .reduce((sum, p) => sum + Math.abs(p.marketValue), 0);
    const concentrationRatio = (existingExposure + positionValue) / params.portfolioValue;
    factors.push({
      factor: 'concentration',
      value: concentrationRatio,
      weight: 0.15,
      contribution: Math.min(concentrationRatio * 150, 100) * 0.15,
      description: `Total exposure to ${params.symbol} would be ${(concentrationRatio * 100).toFixed(2)}% of portfolio`,
    });

    // Volatility risk
    if (params.marketData?.volatility) {
      const volatilityScore = Math.min(params.marketData.volatility * 2, 100);
      factors.push({
        factor: 'volatility',
        value: params.marketData.volatility,
        weight: 0.15,
        contribution: volatilityScore * 0.15,
        description: `Asset has ${(params.marketData.volatility * 100).toFixed(2)}% annualized volatility`,
      });
    }

    // Liquidity risk
    if (params.marketData?.liquidity) {
      const liquidityScore = Math.max(0, (1 - params.marketData.liquidity) * 100);
      factors.push({
        factor: 'liquidity',
        value: params.marketData.liquidity,
        weight: 0.10,
        contribution: liquidityScore * 0.10,
        description: `Asset liquidity score: ${params.marketData.liquidity.toFixed(2)}`,
      });
    }

    // Stop loss risk
    if (params.stopLoss) {
      const stopLossDistance = Math.abs(params.price - params.stopLoss) / params.price;
      const stopLossRisk = Math.max(0, (0.1 - stopLossDistance) * 1000); // Risk increases as stop gets tighter
      factors.push({
        factor: 'stop_loss',
        value: stopLossDistance,
        weight: 0.10,
        contribution: Math.min(stopLossRisk, 100) * 0.10,
        description: `Stop loss is ${(stopLossDistance * 100).toFixed(2)}% away from entry`,
      });
    } else {
      factors.push({
        factor: 'no_stop_loss',
        value: 1,
        weight: 0.15,
        contribution: 100 * 0.15,
        description: 'No stop loss specified - increases risk significantly',
      });
    }

    // Account balance risk
    const balanceRatio = positionValue / params.availableBalance;
    const balanceRisk = Math.min(balanceRatio * 50, 100);
    factors.push({
      factor: 'balance_utilization',
      value: balanceRatio,
      weight: 0.05,
      contribution: balanceRisk * 0.05,
      description: `Trade uses ${(balanceRatio * 100).toFixed(2)}% of available balance`,
    });

    return factors;
  }

  private calculateRiskScore(factors: Array<{ contribution: number }>): number {
    const totalScore = factors.reduce((sum, factor) => sum + factor.contribution, 0);
    return Math.min(Math.max(totalScore, 0), 100);
  }

  private determineRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 90) return RiskLevel.CRITICAL;
    if (riskScore >= 75) return RiskLevel.VERY_HIGH;
    if (riskScore >= 60) return RiskLevel.HIGH;
    if (riskScore >= 40) return RiskLevel.MEDIUM;
    if (riskScore >= 20) return RiskLevel.LOW;
    return RiskLevel.VERY_LOW;
  }

  private generateRecommendations(factors: any[], params: TradeRiskParams): string[] {
    const recommendations = [];

    const positionSizeFactor = factors.find(f => f.factor === 'position_size');
    if (positionSizeFactor && positionSizeFactor.value > 0.1) {
      recommendations.push('Consider reducing position size to limit portfolio impact');
    }

    const leverageFactor = factors.find(f => f.factor === 'leverage');
    if (leverageFactor && leverageFactor.value > 5) {
      recommendations.push('High leverage detected - consider reducing leverage ratio');
    }

    if (!params.stopLoss) {
      recommendations.push('Strongly recommend setting a stop loss to limit downside risk');
    }

    const concentrationFactor = factors.find(f => f.factor === 'concentration');
    if (concentrationFactor && concentrationFactor.value > 0.2) {
      recommendations.push('High concentration risk - diversify across different assets');
    }

    const volatilityFactor = factors.find(f => f.factor === 'volatility');
    if (volatilityFactor && volatilityFactor.value > 0.3) {
      recommendations.push('High volatility asset - consider smaller position size');
    }

    return recommendations;
  }

  private generateWarnings(factors: any[], params: TradeRiskParams): string[] {
    const warnings = [];

    const positionSizeFactor = factors.find(f => f.factor === 'position_size');
    if (positionSizeFactor && positionSizeFactor.value > 0.25) {
      warnings.push('Position size exceeds 25% of portfolio value');
    }

    if (!params.stopLoss) {
      warnings.push('No stop loss protection - unlimited downside risk');
    }

    const leverageFactor = factors.find(f => f.factor === 'leverage');
    if (leverageFactor && leverageFactor.value > 10) {
      warnings.push('Extreme leverage ratio - potential for significant losses');
    }

    const balanceFactor = factors.find(f => f.factor === 'balance_utilization');
    if (balanceFactor && balanceFactor.value > 0.8) {
      warnings.push('Trade uses majority of available balance - limited flexibility');
    }

    return warnings;
  }

  private shouldApproveTrade(riskScore: number, riskLevel: RiskLevel, factors: any[]): boolean {
    // Critical risk level always requires manual approval
    if (riskLevel === RiskLevel.CRITICAL) return false;
    
    // Very high risk requires additional checks
    if (riskLevel === RiskLevel.VERY_HIGH) {
      // Check for specific high-risk factors
      const noStopLoss = factors.find(f => f.factor === 'no_stop_loss');
      const highLeverage = factors.find(f => f.factor === 'leverage' && f.value > 10);
      
      if (noStopLoss || highLeverage) return false;
    }

    // Auto-approve if risk score is below threshold
    return riskScore < 80;
  }

  private calculateMaxPositionSize(params: TradeRiskParams, factors: any[]): number {
    const baseMaxSize = params.portfolioValue * 0.1; // Max 10% of portfolio by default
    
    // Adjust based on risk factors
    let adjustmentFactor = 1.0;
    
    const volatilityFactor = factors.find(f => f.factor === 'volatility');
    if (volatilityFactor) {
      adjustmentFactor *= Math.max(0.3, 1 - volatilityFactor.value);
    }
    
    const leverageFactor = factors.find(f => f.factor === 'leverage');
    if (leverageFactor) {
      adjustmentFactor *= Math.max(0.2, 1 / Math.log(leverageFactor.value + 1));
    }
    
    return Math.floor((baseMaxSize * adjustmentFactor) / params.price);
  }

  private calculateSuggestedStopLoss(params: TradeRiskParams, factors: any[]): number {
    if (params.stopLoss) return params.stopLoss;
    
    // Default stop loss based on volatility and asset type
    let stopLossPercentage = 0.05; // 5% default
    
    const volatilityFactor = factors.find(f => f.factor === 'volatility');
    if (volatilityFactor) {
      stopLossPercentage = Math.min(0.15, Math.max(0.02, volatilityFactor.value));
    }
    
    if (params.side === 'BUY') {
      return params.price * (1 - stopLossPercentage);
    } else {
      return params.price * (1 + stopLossPercentage);
    }
  }

  private calculatePortfolioImpact(params: TradeRiskParams): number {
    const positionValue = params.quantity * params.price;
    return positionValue / params.portfolioValue;
  }

  private calculateRiskRewardRatio(params: TradeRiskParams): number {
    if (!params.stopLoss || !params.takeProfit) return 0;
    
    const risk = Math.abs(params.price - params.stopLoss);
    const reward = Math.abs(params.takeProfit - params.price);
    
    return reward / risk;
  }

  private async createRiskAlert(
    params: TradeRiskParams,
    result: RiskAssessmentResult,
    assessmentId: string,
  ): Promise<void> {
    const alert = this.riskAlertRepository.create({
      userId: params.userId,
      accountId: params.accountId,
      tradeId: params.tradeId,
      alertType: AlertType.RISK_LIMIT_BREACH,
      severity: result.riskLevel === RiskLevel.CRITICAL 
        ? AlertSeverity.CRITICAL 
        : AlertSeverity.HIGH,
      title: `High Risk Trade Detected - ${params.symbol}`,
      description: `Trade risk assessment for ${params.symbol} resulted in ${result.riskLevel} risk level (score: ${result.riskScore.toFixed(2)})`,
      triggerConditions: {
        rule: 'trade_risk_threshold',
        threshold: 75,
        actualValue: result.riskScore,
        operator: 'greater_than',
        timeWindow: 'immediate',
      },
      contextData: {
        assessmentId,
        symbol: params.symbol,
        positionSize: params.quantity,
        riskFactors: result.factors.map(f => f.factor),
      },
      recommendedActions: result.recommendations,
      automaticActions: result.approved ? [] : ['Trade blocked for manual review'],
      impactAssessment: {
        financialImpact: params.quantity * params.price,
        riskExposure: result.riskScore,
        affectedPositions: 1,
        potentialLoss: params.stopLoss 
          ? Math.abs(params.price - params.stopLoss) * params.quantity 
          : params.quantity * params.price * 0.1,
        timeToResolution: '15-30 minutes',
      },
      relatedEntities: {
        trades: params.tradeId ? [params.tradeId] : [],
        positions: [],
        accounts: [params.accountId],
        alerts: [],
      },
      notificationChannels: ['dashboard', 'email'],
    });

    await this.riskAlertRepository.save(alert);
  }

  async getTradeAssessmentHistory(userId: string, limit: number = 50): Promise<RiskAssessment[]> {
    return this.riskAssessmentRepository.find({
      where: { 
        userId,
        assessmentType: AssessmentType.TRADE_PRE_EXECUTION,
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async reassessTrade(assessmentId: string): Promise<RiskAssessmentResult> {
    const assessment = await this.riskAssessmentRepository.findOne({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    return this.assessTradeRisk(assessment.assessmentParams as TradeRiskParams);
  }
}