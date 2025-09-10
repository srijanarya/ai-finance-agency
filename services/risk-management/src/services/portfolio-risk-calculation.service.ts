import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RiskMetrics, MetricType, MetricScope, MetricFrequency } from '../entities/risk-metrics.entity';
import { RiskAlert, AlertType, AlertSeverity } from '../entities/risk-alert.entity';
import * as _ from 'lodash';

export interface PortfolioPosition {
  symbol: string;
  assetType: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  sector?: string;
  currency?: string;
  beta?: number;
  volatility?: number;
  correlation?: Record<string, number>;
}

export interface PortfolioData {
  userId: string;
  accountId: string;
  portfolioId: string;
  totalValue: number;
  availableBalance: number;
  usedMargin: number;
  leverage: number;
  positions: PortfolioPosition[];
  historicalReturns: number[]; // Daily returns for the last N days
  benchmarkReturns?: number[]; // Benchmark returns for comparison
}

export interface PortfolioRiskMetrics {
  valueAtRisk: {
    var95: number;
    var99: number;
    var999: number;
  };
  expectedShortfall: {
    es95: number;
    es99: number;
  };
  volatility: {
    daily: number;
    annualized: number;
  };
  sharpeRatio: number;
  sortinoRatio: number;
  maximumDrawdown: number;
  beta: number;
  concentration: {
    herfindahlIndex: number;
    topPositionWeight: number;
    top5PositionWeight: number;
  };
  sectorExposure: Record<string, number>;
  currencyExposure: Record<string, number>;
  correlationMatrix: Record<string, Record<string, number>>;
  leverageRatio: number;
  marginUtilization: number;
}

@Injectable()
export class PortfolioRiskCalculationService {
  private readonly logger = new Logger(PortfolioRiskCalculationService.name);

  constructor(
    @InjectRepository(RiskMetrics)
    private readonly riskMetricsRepository: Repository<RiskMetrics>,
    @InjectRepository(RiskAlert)
    private readonly riskAlertRepository: Repository<RiskAlert>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async calculatePortfolioRisk(portfolioData: PortfolioData): Promise<PortfolioRiskMetrics> {
    try {
      this.logger.log(`Calculating portfolio risk for portfolio ${portfolioData.portfolioId}`);

      if (portfolioData.positions.length === 0) {
        this.logger.warn(`No positions found for portfolio ${portfolioData.portfolioId}`);
        return this.getEmptyRiskMetrics();
      }

      // Calculate individual risk metrics
      const valueAtRisk = this.calculateValueAtRisk(portfolioData);
      const expectedShortfall = this.calculateExpectedShortfall(portfolioData);
      const volatility = this.calculateVolatility(portfolioData);
      const sharpeRatio = this.calculateSharpeRatio(portfolioData);
      const sortinoRatio = this.calculateSortinoRatio(portfolioData);
      const maximumDrawdown = this.calculateMaximumDrawdown(portfolioData);
      const beta = this.calculatePortfolioBeta(portfolioData);
      const concentration = this.calculateConcentrationRisk(portfolioData);
      const sectorExposure = this.calculateSectorExposure(portfolioData);
      const currencyExposure = this.calculateCurrencyExposure(portfolioData);
      const correlationMatrix = this.calculateCorrelationMatrix(portfolioData);
      const leverageRatio = this.calculateLeverageRatio(portfolioData);
      const marginUtilization = this.calculateMarginUtilization(portfolioData);

      const riskMetrics: PortfolioRiskMetrics = {
        valueAtRisk,
        expectedShortfall,
        volatility,
        sharpeRatio,
        sortinoRatio,
        maximumDrawdown,
        beta,
        concentration,
        sectorExposure,
        currencyExposure,
        correlationMatrix,
        leverageRatio,
        marginUtilization,
      };

      // Store metrics in database
      await this.storeRiskMetrics(portfolioData, riskMetrics);

      // Check for risk limit breaches and create alerts
      await this.checkRiskLimits(portfolioData, riskMetrics);

      this.logger.log(`Portfolio risk calculation completed for ${portfolioData.portfolioId}`);

      return riskMetrics;
    } catch (error) {
      this.logger.error(`Portfolio risk calculation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private calculateValueAtRisk(portfolioData: PortfolioData): PortfolioRiskMetrics['valueAtRisk'] {
    if (portfolioData.historicalReturns.length < 30) {
      this.logger.warn('Insufficient historical data for VaR calculation');
      return { var95: 0, var99: 0, var999: 0 };
    }

    const sortedReturns = [...portfolioData.historicalReturns].sort((a, b) => a - b);
    const portfolioValue = portfolioData.totalValue;

    // Calculate VaR at different confidence levels
    const var95Index = Math.floor(sortedReturns.length * 0.05);
    const var99Index = Math.floor(sortedReturns.length * 0.01);
    const var999Index = Math.floor(sortedReturns.length * 0.001);

    return {
      var95: Math.abs(sortedReturns[var95Index] * portfolioValue),
      var99: Math.abs(sortedReturns[var99Index] * portfolioValue),
      var999: Math.abs(sortedReturns[Math.max(0, var999Index)] * portfolioValue),
    };
  }

  private calculateExpectedShortfall(portfolioData: PortfolioData): PortfolioRiskMetrics['expectedShortfall'] {
    if (portfolioData.historicalReturns.length < 30) {
      return { es95: 0, es99: 0 };
    }

    const sortedReturns = [...portfolioData.historicalReturns].sort((a, b) => a - b);
    const portfolioValue = portfolioData.totalValue;

    // Calculate ES at different confidence levels
    const var95Index = Math.floor(sortedReturns.length * 0.05);
    const var99Index = Math.floor(sortedReturns.length * 0.01);

    const es95 = sortedReturns.slice(0, var95Index + 1).reduce((sum, ret) => sum + ret, 0) / (var95Index + 1);
    const es99 = sortedReturns.slice(0, var99Index + 1).reduce((sum, ret) => sum + ret, 0) / (var99Index + 1);

    return {
      es95: Math.abs(es95 * portfolioValue),
      es99: Math.abs(es99 * portfolioValue),
    };
  }

  private calculateVolatility(portfolioData: PortfolioData): PortfolioRiskMetrics['volatility'] {
    if (portfolioData.historicalReturns.length < 10) {
      return { daily: 0, annualized: 0 };
    }

    const returns = portfolioData.historicalReturns;
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1);
    const dailyVolatility = Math.sqrt(variance);
    const annualizedVolatility = dailyVolatility * Math.sqrt(252); // 252 trading days per year

    return {
      daily: dailyVolatility,
      annualized: annualizedVolatility,
    };
  }

  private calculateSharpeRatio(portfolioData: PortfolioData): number {
    if (portfolioData.historicalReturns.length < 10) {
      return 0;
    }

    const returns = portfolioData.historicalReturns;
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const riskFreeRate = 0.02 / 252; // Assume 2% annual risk-free rate, daily
    
    const excessReturns = returns.map(ret => ret - riskFreeRate);
    const meanExcessReturn = excessReturns.reduce((sum, ret) => sum + ret, 0) / excessReturns.length;
    
    const variance = excessReturns.reduce((sum, ret) => sum + Math.pow(ret - meanExcessReturn, 2), 0) / (excessReturns.length - 1);
    const volatility = Math.sqrt(variance);
    
    return volatility === 0 ? 0 : (meanExcessReturn / volatility) * Math.sqrt(252);
  }

  private calculateSortinoRatio(portfolioData: PortfolioData): number {
    if (portfolioData.historicalReturns.length < 10) {
      return 0;
    }

    const returns = portfolioData.historicalReturns;
    const riskFreeRate = 0.02 / 252; // Daily risk-free rate
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    const downdeviations = returns
      .filter(ret => ret < riskFreeRate)
      .map(ret => Math.pow(ret - riskFreeRate, 2));
    
    if (downdeviations.length === 0) return 0;
    
    const downVolatility = Math.sqrt(downdeviations.reduce((sum, dev) => sum + dev, 0) / returns.length);
    
    return downVolatility === 0 ? 0 : ((meanReturn - riskFreeRate) / downVolatility) * Math.sqrt(252);
  }

  private calculateMaximumDrawdown(portfolioData: PortfolioData): number {
    if (portfolioData.historicalReturns.length < 10) {
      return 0;
    }

    const returns = portfolioData.historicalReturns;
    let cumulativeReturns = [1];
    let maxDrawdown = 0;
    let peak = 1;

    // Calculate cumulative returns
    for (let i = 0; i < returns.length; i++) {
      cumulativeReturns.push(cumulativeReturns[i] * (1 + returns[i]));
    }

    // Calculate maximum drawdown
    for (let i = 1; i < cumulativeReturns.length; i++) {
      if (cumulativeReturns[i] > peak) {
        peak = cumulativeReturns[i];
      }
      
      const drawdown = (peak - cumulativeReturns[i]) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  private calculatePortfolioBeta(portfolioData: PortfolioData): number {
    // Weight-average beta of positions
    const totalValue = portfolioData.totalValue;
    if (totalValue === 0) return 1;

    let weightedBeta = 0;
    for (const position of portfolioData.positions) {
      const weight = position.marketValue / totalValue;
      const beta = position.beta || 1; // Default beta of 1 if not available
      weightedBeta += weight * beta;
    }

    return weightedBeta;
  }

  private calculateConcentrationRisk(portfolioData: PortfolioData): PortfolioRiskMetrics['concentration'] {
    const totalValue = portfolioData.totalValue;
    if (totalValue === 0) {
      return { herfindahlIndex: 0, topPositionWeight: 0, top5PositionWeight: 0 };
    }

    // Calculate weights
    const weights = portfolioData.positions.map(pos => pos.marketValue / totalValue);
    weights.sort((a, b) => b - a); // Sort descending

    // Herfindahl-Hirschman Index
    const herfindahlIndex = weights.reduce((sum, weight) => sum + Math.pow(weight, 2), 0);

    // Top position weight
    const topPositionWeight = weights.length > 0 ? weights[0] : 0;

    // Top 5 positions weight
    const top5PositionWeight = weights.slice(0, 5).reduce((sum, weight) => sum + weight, 0);

    return {
      herfindahlIndex,
      topPositionWeight,
      top5PositionWeight,
    };
  }

  private calculateSectorExposure(portfolioData: PortfolioData): Record<string, number> {
    const sectorExposure: Record<string, number> = {};
    const totalValue = portfolioData.totalValue;

    if (totalValue === 0) return sectorExposure;

    for (const position of portfolioData.positions) {
      const sector = position.sector || 'Unknown';
      const weight = position.marketValue / totalValue;
      sectorExposure[sector] = (sectorExposure[sector] || 0) + weight;
    }

    return sectorExposure;
  }

  private calculateCurrencyExposure(portfolioData: PortfolioData): Record<string, number> {
    const currencyExposure: Record<string, number> = {};
    const totalValue = portfolioData.totalValue;

    if (totalValue === 0) return currencyExposure;

    for (const position of portfolioData.positions) {
      const currency = position.currency || 'USD';
      const weight = position.marketValue / totalValue;
      currencyExposure[currency] = (currencyExposure[currency] || 0) + weight;
    }

    return currencyExposure;
  }

  private calculateCorrelationMatrix(portfolioData: PortfolioData): Record<string, Record<string, number>> {
    const correlationMatrix: Record<string, Record<string, number>> = {};

    for (const position of portfolioData.positions) {
      correlationMatrix[position.symbol] = position.correlation || {};
    }

    return correlationMatrix;
  }

  private calculateLeverageRatio(portfolioData: PortfolioData): number {
    if (portfolioData.totalValue === 0) return 1;
    
    const grossExposure = portfolioData.positions.reduce((sum, pos) => sum + Math.abs(pos.marketValue), 0);
    return grossExposure / portfolioData.totalValue;
  }

  private calculateMarginUtilization(portfolioData: PortfolioData): number {
    const totalMargin = portfolioData.availableBalance + portfolioData.usedMargin;
    return totalMargin === 0 ? 0 : portfolioData.usedMargin / totalMargin;
  }

  private async storeRiskMetrics(portfolioData: PortfolioData, metrics: PortfolioRiskMetrics): Promise<void> {
    const timestamp = new Date();

    // Store various risk metrics
    const metricsToStore = [
      {
        type: MetricType.VALUE_AT_RISK,
        value: metrics.valueAtRisk.var95,
        details: {
          components: [
            { name: 'VaR 95%', value: metrics.valueAtRisk.var95, weight: 1, contribution: 100 },
            { name: 'VaR 99%', value: metrics.valueAtRisk.var99, weight: 1, contribution: 100 },
            { name: 'VaR 99.9%', value: metrics.valueAtRisk.var999, weight: 1, contribution: 100 },
          ],
        },
      },
      {
        type: MetricType.VOLATILITY,
        value: metrics.volatility.annualized,
        details: {
          components: [
            { name: 'Daily Volatility', value: metrics.volatility.daily, weight: 1, contribution: 100 },
            { name: 'Annualized Volatility', value: metrics.volatility.annualized, weight: 1, contribution: 100 },
          ],
        },
      },
      {
        type: MetricType.SHARPE_RATIO,
        value: metrics.sharpeRatio,
        details: { components: [{ name: 'Sharpe Ratio', value: metrics.sharpeRatio, weight: 1, contribution: 100 }] },
      },
      {
        type: MetricType.MAXIMUM_DRAWDOWN,
        value: metrics.maximumDrawdown,
        details: { components: [{ name: 'Max Drawdown', value: metrics.maximumDrawdown, weight: 1, contribution: 100 }] },
      },
      {
        type: MetricType.PORTFOLIO_CONCENTRATION,
        value: metrics.concentration.herfindahlIndex,
        details: {
          components: [
            { name: 'Herfindahl Index', value: metrics.concentration.herfindahlIndex, weight: 1, contribution: 100 },
            { name: 'Top Position Weight', value: metrics.concentration.topPositionWeight, weight: 1, contribution: 100 },
            { name: 'Top 5 Positions Weight', value: metrics.concentration.top5PositionWeight, weight: 1, contribution: 100 },
          ],
        },
      },
      {
        type: MetricType.LEVERAGE_RATIO,
        value: metrics.leverageRatio,
        details: { components: [{ name: 'Leverage Ratio', value: metrics.leverageRatio, weight: 1, contribution: 100 }] },
      },
    ];

    for (const metric of metricsToStore) {
      const riskMetric = this.riskMetricsRepository.create({
        userId: portfolioData.userId,
        accountId: portfolioData.accountId,
        portfolioId: portfolioData.portfolioId,
        metricType: metric.type,
        scope: MetricScope.PORTFOLIO,
        frequency: MetricFrequency.DAILY,
        metricValue: metric.value,
        timestamp,
        metricDetails: metric.details,
        modelParameters: {
          model: 'PortfolioRiskCalculation',
          version: '1.0.0',
          parameters: {},
          dataSource: 'portfolio_positions',
          calculationMethod: 'historical_simulation',
        },
        dataQuality: {
          completeness: 100,
          accuracy: 95,
          timeliness: 0,
          consistency: 100,
        },
      });

      await this.riskMetricsRepository.save(riskMetric);
    }
  }

  private async checkRiskLimits(portfolioData: PortfolioData, metrics: PortfolioRiskMetrics): Promise<void> {
    const alerts = [];

    // Check VaR limits
    if (metrics.valueAtRisk.var95 > portfolioData.totalValue * 0.05) { // 5% daily VaR limit
      alerts.push({
        type: AlertType.VAR_BREACH,
        severity: AlertSeverity.HIGH,
        title: 'VaR Limit Breach',
        description: `Portfolio VaR (${metrics.valueAtRisk.var95.toFixed(2)}) exceeds 5% limit`,
        value: metrics.valueAtRisk.var95,
        threshold: portfolioData.totalValue * 0.05,
      });
    }

    // Check concentration limits
    if (metrics.concentration.topPositionWeight > 0.25) { // 25% concentration limit
      alerts.push({
        type: AlertType.POSITION_CONCENTRATION,
        severity: AlertSeverity.MEDIUM,
        title: 'Position Concentration Risk',
        description: `Top position represents ${(metrics.concentration.topPositionWeight * 100).toFixed(1)}% of portfolio`,
        value: metrics.concentration.topPositionWeight,
        threshold: 0.25,
      });
    }

    // Check drawdown limits
    if (metrics.maximumDrawdown > 0.15) { // 15% maximum drawdown limit
      alerts.push({
        type: AlertType.DRAWDOWN_THRESHOLD,
        severity: AlertSeverity.HIGH,
        title: 'Maximum Drawdown Breach',
        description: `Portfolio drawdown (${(metrics.maximumDrawdown * 100).toFixed(1)}%) exceeds 15% limit`,
        value: metrics.maximumDrawdown,
        threshold: 0.15,
      });
    }

    // Check leverage limits
    if (metrics.leverageRatio > 5) { // 5x leverage limit
      alerts.push({
        type: AlertType.RISK_LIMIT_BREACH,
        severity: AlertSeverity.HIGH,
        title: 'Leverage Limit Breach',
        description: `Portfolio leverage (${metrics.leverageRatio.toFixed(1)}x) exceeds 5x limit`,
        value: metrics.leverageRatio,
        threshold: 5,
      });
    }

    // Create alerts
    for (const alertData of alerts) {
      const alert = this.riskAlertRepository.create({
        userId: portfolioData.userId,
        accountId: portfolioData.accountId,
        portfolioId: portfolioData.portfolioId,
        alertType: alertData.type,
        severity: alertData.severity,
        title: alertData.title,
        description: alertData.description,
        triggerConditions: {
          rule: 'portfolio_risk_limit',
          threshold: alertData.threshold,
          actualValue: alertData.value,
          operator: 'greater_than',
          timeWindow: 'daily',
        },
        contextData: {
          portfolioMetrics: metrics,
          portfolioValue: portfolioData.totalValue,
        },
        recommendedActions: ['Review position sizes', 'Consider rebalancing', 'Reduce leverage'],
        impactAssessment: {
          financialImpact: portfolioData.totalValue,
          riskExposure: alertData.value,
          affectedPositions: portfolioData.positions.length,
          potentialLoss: metrics.valueAtRisk.var95,
          timeToResolution: '1-4 hours',
        },
        relatedEntities: {
          trades: [],
          positions: portfolioData.positions.map(p => p.symbol),
          accounts: [portfolioData.accountId],
          alerts: [],
        },
        notificationChannels: ['dashboard', 'email'],
      });

      await this.riskAlertRepository.save(alert);
    }
  }

  private getEmptyRiskMetrics(): PortfolioRiskMetrics {
    return {
      valueAtRisk: { var95: 0, var99: 0, var999: 0 },
      expectedShortfall: { es95: 0, es99: 0 },
      volatility: { daily: 0, annualized: 0 },
      sharpeRatio: 0,
      sortinoRatio: 0,
      maximumDrawdown: 0,
      beta: 1,
      concentration: { herfindahlIndex: 0, topPositionWeight: 0, top5PositionWeight: 0 },
      sectorExposure: {},
      currencyExposure: {},
      correlationMatrix: {},
      leverageRatio: 1,
      marginUtilization: 0,
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async calculateAllPortfolioRisks(): Promise<void> {
    this.logger.log('Starting scheduled portfolio risk calculations...');
    
    try {
      // This would be called with actual portfolio data from the trading service
      // For now, it's a placeholder for the scheduled job
      this.logger.log('Scheduled portfolio risk calculation completed');
    } catch (error) {
      this.logger.error('Scheduled portfolio risk calculation failed:', error);
    }
  }

  async getPortfolioRiskHistory(portfolioId: string, days: number = 30): Promise<RiskMetrics[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    return this.riskMetricsRepository.find({
      where: {
        portfolioId,
        timestamp: MoreThan(fromDate),
      },
      order: { timestamp: 'ASC' },
    });
  }

  async getLatestPortfolioMetrics(portfolioId: string): Promise<RiskMetrics[]> {
    return this.riskMetricsRepository.find({
      where: { portfolioId },
      order: { timestamp: 'DESC' },
      take: 10,
    });
  }
}