import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitutionalOrder } from '../entities/institutional-order.entity';
import { Portfolio } from '../entities/portfolio.entity';
import { InstitutionalStrategy } from '../entities/institutional-strategy.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum RiskMetricType {
  VAR = 'var',
  CVAR = 'cvar',
  SHARPE_RATIO = 'sharpe_ratio',
  MAX_DRAWDOWN = 'max_drawdown',
  VOLATILITY = 'volatility',
  BETA = 'beta',
  CORRELATION = 'correlation',
  CONCENTRATION = 'concentration',
  LIQUIDITY = 'liquidity',
  LEVERAGE = 'leverage',
}

export interface RiskAlert {
  id: string;
  level: RiskLevel;
  metricType: RiskMetricType;
  portfolioId?: string;
  orderId?: string;
  strategyId?: string;
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  actions?: string[];
}

export interface RiskAssessment {
  portfolioId: string;
  timestamp: Date;
  overallRiskLevel: RiskLevel;
  metrics: {
    var95: number;
    var99: number;
    cvar: number;
    sharpeRatio: number;
    maxDrawdown: number;
    currentDrawdown: number;
    volatility: number;
    beta: number;
    leverage: number;
    liquidityScore: number;
    concentrationScore: number;
  };
  alerts: RiskAlert[];
  recommendations: string[];
  requiresAction: boolean;
}

export interface PositionRisk {
  symbol: string;
  positionValue: number;
  var95: number;
  var99: number;
  beta: number;
  contributionToPortfolioRisk: number;
  liquidityDays: number;
  concentrationRisk: number;
}

export interface StressTestScenario {
  name: string;
  description: string;
  marketShock: number;
  volatilityMultiplier: number;
  correlationIncrease: number;
  liquidityReduction: number;
}

export interface StressTestResult {
  scenario: StressTestScenario;
  portfolioId: string;
  baseValue: number;
  stressedValue: number;
  loss: number;
  lossPercent: number;
  var95Stressed: number;
  var99Stressed: number;
  worstPositions: Array<{
    symbol: string;
    loss: number;
    lossPercent: number;
  }>;
  breachedLimits: string[];
  timestamp: Date;
}

@Injectable()
export class RiskManagementService {
  private readonly logger = new Logger(RiskManagementService.name);
  private riskAlerts: Map<string, RiskAlert> = new Map();

  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    @InjectRepository(InstitutionalOrder)
    private orderRepository: Repository<InstitutionalOrder>,
    @InjectRepository(InstitutionalStrategy)
    private strategyRepository: Repository<InstitutionalStrategy>,
    private eventEmitter: EventEmitter2,
  ) {}

  // Real-time Risk Assessment
  async assessPortfolioRisk(portfolioId: string): Promise<RiskAssessment> {
    const portfolio = await this.portfolioRepository.findOne({ where: { id: portfolioId } });
    
    if (!portfolio) {
      throw new Error(`Portfolio ${portfolioId} not found`);
    }

    const metrics = await this.calculateRiskMetrics(portfolio);
    const alerts = await this.checkRiskLimits(portfolio, metrics);
    const recommendations = this.generateRecommendations(metrics, alerts);
    const overallRiskLevel = this.determineOverallRiskLevel(metrics, alerts);

    const assessment: RiskAssessment = {
      portfolioId,
      timestamp: new Date(),
      overallRiskLevel,
      metrics,
      alerts,
      recommendations,
      requiresAction: alerts.some(a => a.level === RiskLevel.CRITICAL || a.level === RiskLevel.HIGH),
    };

    // Emit risk assessment event
    this.eventEmitter.emit('risk.assessment.completed', assessment);

    // Store critical alerts
    alerts.filter(a => a.level === RiskLevel.CRITICAL).forEach(alert => {
      this.riskAlerts.set(alert.id, alert);
    });

    return assessment;
  }

  // Pre-Trade Risk Check
  async assessOrderRisk(
    order: Partial<InstitutionalOrder>,
    portfolioId: string,
  ): Promise<{
    approved: boolean;
    riskScore: number;
    alerts: RiskAlert[];
    adjustments?: any;
  }> {
    const portfolio = await this.portfolioRepository.findOne({ where: { id: portfolioId } });
    
    if (!portfolio) {
      throw new Error(`Portfolio ${portfolioId} not found`);
    }

    // Calculate impact of new order on portfolio
    const simulatedPortfolio = this.simulateOrderImpact(portfolio, order);
    const currentMetrics = await this.calculateRiskMetrics(portfolio);
    const newMetrics = await this.calculateRiskMetrics(simulatedPortfolio);

    const alerts: RiskAlert[] = [];
    let riskScore = 0;

    // Check VaR increase
    const varIncrease = (newMetrics.var95 - currentMetrics.var95) / currentMetrics.var95;
    if (varIncrease > 0.1) { // 10% increase in VaR
      alerts.push(this.createAlert(
        RiskLevel.HIGH,
        RiskMetricType.VAR,
        `Order increases VaR by ${(varIncrease * 100).toFixed(2)}%`,
        newMetrics.var95,
        portfolio.riskLimits?.maxVar95 || 0,
        { orderId: order.id, portfolioId },
      ));
      riskScore += 30;
    }

    // Check concentration risk
    const newPosition = simulatedPortfolio.positions.find(p => p.symbol === order.symbol);
    if (newPosition) {
      const concentrationPercent = (newPosition.marketValue / simulatedPortfolio.totalValue) * 100;
      if (concentrationPercent > 10) {
        alerts.push(this.createAlert(
          RiskLevel.MEDIUM,
          RiskMetricType.CONCENTRATION,
          `Position concentration ${concentrationPercent.toFixed(2)}% exceeds recommended limit`,
          concentrationPercent,
          10,
          { orderId: order.id, portfolioId },
        ));
        riskScore += 20;
      }
    }

    // Check leverage
    if (newMetrics.leverage > (portfolio.riskLimits?.maxBeta || 2)) {
      alerts.push(this.createAlert(
        RiskLevel.HIGH,
        RiskMetricType.LEVERAGE,
        `Leverage ${newMetrics.leverage.toFixed(2)} exceeds limit`,
        newMetrics.leverage,
        portfolio.riskLimits?.maxBeta || 2,
        { orderId: order.id, portfolioId },
      ));
      riskScore += 40;
    }

    // Check liquidity
    const liquidityScore = await this.assessOrderLiquidity(order);
    if (liquidityScore < 0.5) {
      alerts.push(this.createAlert(
        RiskLevel.MEDIUM,
        RiskMetricType.LIQUIDITY,
        'Low liquidity for order size',
        liquidityScore,
        0.5,
        { orderId: order.id },
      ));
      riskScore += 15;
    }

    const approved = riskScore < 50 && !alerts.some(a => a.level === RiskLevel.CRITICAL);

    // Suggest adjustments if not approved
    const adjustments = !approved ? this.suggestOrderAdjustments(order, alerts) : undefined;

    return {
      approved,
      riskScore,
      alerts,
      adjustments,
    };
  }

  // Calculate Risk Metrics
  private async calculateRiskMetrics(portfolio: Portfolio): Promise<any> {
    const returns = await this.getHistoricalReturns(portfolio);
    const prices = await this.getPositionPrices(portfolio);

    // Calculate VaR (Value at Risk)
    const var95 = this.calculateVaR(portfolio, returns, 0.95);
    const var99 = this.calculateVaR(portfolio, returns, 0.99);

    // Calculate CVaR (Conditional Value at Risk)
    const cvar = this.calculateCVaR(portfolio, returns, 0.95);

    // Calculate Sharpe Ratio
    const sharpeRatio = this.calculateSharpeRatio(returns);

    // Calculate Volatility
    const volatility = this.calculateVolatility(returns);

    // Calculate Maximum Drawdown
    const { maxDrawdown, currentDrawdown } = this.calculateDrawdown(portfolio);

    // Calculate Beta
    const beta = await this.calculateBeta(portfolio, returns);

    // Calculate Leverage
    const leverage = this.calculateLeverage(portfolio);

    // Calculate Liquidity Score
    const liquidityScore = await this.calculateLiquidityScore(portfolio);

    // Calculate Concentration Score
    const concentrationScore = this.calculateConcentrationScore(portfolio);

    return {
      var95,
      var99,
      cvar,
      sharpeRatio,
      maxDrawdown,
      currentDrawdown,
      volatility,
      beta,
      leverage,
      liquidityScore,
      concentrationScore,
    };
  }

  // VaR Calculation
  private calculateVaR(portfolio: Portfolio, returns: number[], confidence: number): number {
    if (!returns || returns.length === 0) {
      return 0;
    }

    // Sort returns in ascending order
    const sortedReturns = [...returns].sort((a, b) => a - b);
    
    // Find the percentile
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    const var_value = -sortedReturns[index] * portfolio.totalValue;

    return var_value;
  }

  // CVaR Calculation
  private calculateCVaR(portfolio: Portfolio, returns: number[], confidence: number): number {
    if (!returns || returns.length === 0) {
      return 0;
    }

    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    
    // Calculate average of returns worse than VaR
    const tailReturns = sortedReturns.slice(0, index + 1);
    const avgTailReturn = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
    
    return -avgTailReturn * portfolio.totalValue;
  }

  // Sharpe Ratio Calculation
  private calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (!returns || returns.length === 0) {
      return 0;
    }

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);
    
    if (volatility === 0) {
      return 0;
    }

    return (avgReturn - riskFreeRate / 252) / volatility; // Assuming daily returns
  }

  // Volatility Calculation
  private calculateVolatility(returns: number[]): number {
    if (!returns || returns.length < 2) {
      return 0;
    }

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - avgReturn, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / (returns.length - 1);
    
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
  }

  // Drawdown Calculation
  private calculateDrawdown(portfolio: Portfolio): { maxDrawdown: number; currentDrawdown: number } {
    const navHistory = portfolio.historicalNav || [];
    
    if (navHistory.length < 2) {
      return { maxDrawdown: 0, currentDrawdown: 0 };
    }

    let peak = navHistory[0].nav;
    let maxDrawdown = 0;
    let currentPeak = peak;

    for (const point of navHistory) {
      if (point.nav > peak) {
        peak = point.nav;
        currentPeak = peak;
      }
      
      const drawdown = (peak - point.nav) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    const currentNav = navHistory[navHistory.length - 1].nav;
    const currentDrawdown = (currentPeak - currentNav) / currentPeak;

    return { maxDrawdown, currentDrawdown };
  }

  // Beta Calculation
  private async calculateBeta(portfolio: Portfolio, returns: number[]): Promise<number> {
    if (!portfolio.benchmarkSymbol || returns.length < 20) {
      return 1;
    }

    // Get benchmark returns (mock implementation)
    const benchmarkReturns = await this.getBenchmarkReturns(portfolio.benchmarkSymbol);
    
    if (benchmarkReturns.length !== returns.length) {
      return 1;
    }

    // Calculate covariance and variance
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const avgBenchmark = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;

    let covariance = 0;
    let benchmarkVariance = 0;

    for (let i = 0; i < returns.length; i++) {
      covariance += (returns[i] - avgReturn) * (benchmarkReturns[i] - avgBenchmark);
      benchmarkVariance += Math.pow(benchmarkReturns[i] - avgBenchmark, 2);
    }

    covariance /= (returns.length - 1);
    benchmarkVariance /= (returns.length - 1);

    return benchmarkVariance === 0 ? 1 : covariance / benchmarkVariance;
  }

  // Leverage Calculation
  private calculateLeverage(portfolio: Portfolio): number {
    const longExposure = portfolio.positions
      .filter(p => p.quantity > 0)
      .reduce((sum, p) => sum + p.marketValue, 0);
    
    const shortExposure = Math.abs(
      portfolio.positions
        .filter(p => p.quantity < 0)
        .reduce((sum, p) => sum + p.marketValue, 0)
    );

    const totalExposure = longExposure + shortExposure;
    
    return portfolio.totalValue === 0 ? 0 : totalExposure / portfolio.totalValue;
  }

  // Liquidity Score Calculation
  private async calculateLiquidityScore(portfolio: Portfolio): Promise<number> {
    let totalScore = 0;
    let totalWeight = 0;

    for (const position of portfolio.positions) {
      const avgVolume = await this.getAverageVolume(position.symbol);
      const daysToLiquidate = position.quantity / (avgVolume * 0.1); // Assume 10% of daily volume
      
      // Score based on days to liquidate (1 = very liquid, 0 = illiquid)
      const positionScore = Math.max(0, 1 - daysToLiquidate / 10);
      const weight = position.marketValue / portfolio.totalValue;
      
      totalScore += positionScore * weight;
      totalWeight += weight;
    }

    return totalWeight === 0 ? 0 : totalScore / totalWeight;
  }

  // Concentration Score Calculation
  private calculateConcentrationScore(portfolio: Portfolio): number {
    if (!portfolio.positions || portfolio.positions.length === 0) {
      return 0;
    }

    // Calculate Herfindahl-Hirschman Index (HHI)
    const weights = portfolio.positions.map(p => p.weight / 100);
    const hhi = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);

    // Normalize (0 = perfectly diversified, 1 = fully concentrated)
    const minHHI = 1 / portfolio.positions.length;
    const normalizedHHI = (hhi - minHHI) / (1 - minHHI);

    return normalizedHHI;
  }

  // Stress Testing
  async runStressTest(
    portfolioId: string,
    scenario: StressTestScenario,
  ): Promise<StressTestResult> {
    const portfolio = await this.portfolioRepository.findOne({ where: { id: portfolioId } });
    
    if (!portfolio) {
      throw new Error(`Portfolio ${portfolioId} not found`);
    }

    const baseValue = portfolio.totalValue;
    let stressedValue = baseValue;
    const worstPositions: Array<{ symbol: string; loss: number; lossPercent: number }> = [];

    // Apply market shock to each position
    for (const position of portfolio.positions) {
      const beta = await this.getPositionBeta(position.symbol);
      const positionShock = scenario.marketShock * beta * scenario.volatilityMultiplier;
      const positionLoss = position.marketValue * positionShock;
      
      stressedValue -= positionLoss;
      
      if (positionLoss > 0) {
        worstPositions.push({
          symbol: position.symbol,
          loss: positionLoss,
          lossPercent: (positionLoss / position.marketValue) * 100,
        });
      }
    }

    // Sort worst positions by loss
    worstPositions.sort((a, b) => b.loss - a.loss);

    // Calculate stressed VaR
    const stressedPortfolio = Object.assign(new Portfolio(), { ...portfolio, totalValue: stressedValue });
    const stressedReturns = await this.getStressedReturns(portfolio, scenario);
    const var95Stressed = this.calculateVaR(stressedPortfolio, stressedReturns, 0.95);
    const var99Stressed = this.calculateVaR(stressedPortfolio, stressedReturns, 0.99);

    // Check which limits would be breached
    const breachedLimits: string[] = [];
    if (portfolio.riskLimits) {
      if (var95Stressed > (portfolio.riskLimits.maxVar95 || Infinity)) {
        breachedLimits.push('VaR 95% limit');
      }
      if ((baseValue - stressedValue) / baseValue > (portfolio.riskLimits.maxDrawdown || Infinity)) {
        breachedLimits.push('Maximum drawdown limit');
      }
    }

    return {
      scenario,
      portfolioId,
      baseValue,
      stressedValue,
      loss: baseValue - stressedValue,
      lossPercent: ((baseValue - stressedValue) / baseValue) * 100,
      var95Stressed,
      var99Stressed,
      worstPositions: worstPositions.slice(0, 10), // Top 10 worst positions
      breachedLimits,
      timestamp: new Date(),
    };
  }

  // Monte Carlo Simulation
  async runMonteCarloSimulation(
    portfolioId: string,
    numSimulations: number = 10000,
    timeHorizon: number = 252, // Trading days
  ): Promise<{
    simulations: number[];
    percentiles: Record<number, number>;
    expectedValue: number;
    probability: Record<string, number>;
  }> {
    const portfolio = await this.portfolioRepository.findOne({ where: { id: portfolioId } });
    
    if (!portfolio) {
      throw new Error(`Portfolio ${portfolioId} not found`);
    }

    const returns = await this.getHistoricalReturns(portfolio);
    const volatility = this.calculateVolatility(returns);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    const simulations: number[] = [];

    for (let i = 0; i < numSimulations; i++) {
      let value = portfolio.totalValue;
      
      for (let day = 0; day < timeHorizon; day++) {
        // Generate random return using normal distribution
        const randomReturn = this.generateNormalRandom(avgReturn, volatility / Math.sqrt(252));
        value *= (1 + randomReturn);
      }
      
      simulations.push(value);
    }

    // Sort simulations
    simulations.sort((a, b) => a - b);

    // Calculate percentiles
    const percentiles: Record<number, number> = {};
    [1, 5, 10, 25, 50, 75, 90, 95, 99].forEach(p => {
      const index = Math.floor((p / 100) * numSimulations);
      percentiles[p] = simulations[index];
    });

    // Calculate expected value
    const expectedValue = simulations.reduce((sum, v) => sum + v, 0) / numSimulations;

    // Calculate probabilities
    const initialValue = portfolio.totalValue;
    const probability = {
      profit: simulations.filter(v => v > initialValue).length / numSimulations,
      loss: simulations.filter(v => v < initialValue).length / numSimulations,
      loss10: simulations.filter(v => v < initialValue * 0.9).length / numSimulations,
      loss20: simulations.filter(v => v < initialValue * 0.8).length / numSimulations,
      gain10: simulations.filter(v => v > initialValue * 1.1).length / numSimulations,
      gain20: simulations.filter(v => v > initialValue * 1.2).length / numSimulations,
    };

    return {
      simulations: simulations.slice(0, 100), // Return sample of simulations
      percentiles,
      expectedValue,
      probability,
    };
  }

  // Helper Methods
  private createAlert(
    level: RiskLevel,
    metricType: RiskMetricType,
    message: string,
    currentValue: number,
    threshold: number,
    context: { orderId?: string; portfolioId?: string; strategyId?: string },
  ): RiskAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      metricType,
      message,
      currentValue,
      threshold,
      timestamp: new Date(),
      resolved: false,
      ...context,
    };
  }

  private async checkRiskLimits(portfolio: Portfolio, metrics: any): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = [];

    if (!portfolio.riskLimits) {
      return alerts;
    }

    // Check VaR limit
    if (portfolio.riskLimits.maxVar95 && metrics.var95 > portfolio.riskLimits.maxVar95) {
      alerts.push(this.createAlert(
        RiskLevel.HIGH,
        RiskMetricType.VAR,
        `VaR (95%) exceeds limit: ${metrics.var95.toFixed(2)}`,
        metrics.var95,
        portfolio.riskLimits.maxVar95,
        { portfolioId: portfolio.id },
      ));
    }

    // Check drawdown limit
    if (portfolio.riskLimits.maxDrawdown && metrics.currentDrawdown > portfolio.riskLimits.maxDrawdown) {
      alerts.push(this.createAlert(
        RiskLevel.CRITICAL,
        RiskMetricType.MAX_DRAWDOWN,
        `Current drawdown exceeds limit: ${(metrics.currentDrawdown * 100).toFixed(2)}%`,
        metrics.currentDrawdown,
        portfolio.riskLimits.maxDrawdown,
        { portfolioId: portfolio.id },
      ));
    }

    // Check volatility limit
    if (portfolio.riskLimits.maxVolatility && metrics.volatility > portfolio.riskLimits.maxVolatility) {
      alerts.push(this.createAlert(
        RiskLevel.MEDIUM,
        RiskMetricType.VOLATILITY,
        `Volatility exceeds limit: ${(metrics.volatility * 100).toFixed(2)}%`,
        metrics.volatility,
        portfolio.riskLimits.maxVolatility,
        { portfolioId: portfolio.id },
      ));
    }

    // Check Sharpe ratio minimum
    if (portfolio.riskLimits.minSharpeRatio && metrics.sharpeRatio < portfolio.riskLimits.minSharpeRatio) {
      alerts.push(this.createAlert(
        RiskLevel.LOW,
        RiskMetricType.SHARPE_RATIO,
        `Sharpe ratio below minimum: ${metrics.sharpeRatio.toFixed(2)}`,
        metrics.sharpeRatio,
        portfolio.riskLimits.minSharpeRatio,
        { portfolioId: portfolio.id },
      ));
    }

    return alerts;
  }

  private generateRecommendations(metrics: any, alerts: RiskAlert[]): string[] {
    const recommendations: string[] = [];

    // High VaR recommendation
    if (alerts.some(a => a.metricType === RiskMetricType.VAR && a.level === RiskLevel.HIGH)) {
      recommendations.push('Consider reducing position sizes or hedging to lower VaR');
    }

    // High concentration recommendation
    if (metrics.concentrationScore > 0.7) {
      recommendations.push('Portfolio is highly concentrated. Consider diversifying across more assets');
    }

    // Low Sharpe ratio recommendation
    if (metrics.sharpeRatio < 0.5) {
      recommendations.push('Risk-adjusted returns are low. Review strategy performance and consider rebalancing');
    }

    // High drawdown recommendation
    if (metrics.currentDrawdown > 0.15) {
      recommendations.push('Portfolio is in significant drawdown. Consider implementing stop-loss or reducing exposure');
    }

    // Low liquidity recommendation
    if (metrics.liquidityScore < 0.5) {
      recommendations.push('Portfolio liquidity is low. Consider increasing allocation to more liquid assets');
    }

    return recommendations;
  }

  private determineOverallRiskLevel(metrics: any, alerts: RiskAlert[]): RiskLevel {
    if (alerts.some(a => a.level === RiskLevel.CRITICAL)) {
      return RiskLevel.CRITICAL;
    }
    
    if (alerts.filter(a => a.level === RiskLevel.HIGH).length >= 2) {
      return RiskLevel.HIGH;
    }
    
    if (alerts.some(a => a.level === RiskLevel.HIGH) || 
        alerts.filter(a => a.level === RiskLevel.MEDIUM).length >= 3) {
      return RiskLevel.MEDIUM;
    }
    
    return RiskLevel.LOW;
  }

  private simulateOrderImpact(portfolio: Portfolio, order: Partial<InstitutionalOrder>): Portfolio {
    const simulatedPortfolio = { ...portfolio };
    const orderValue = (order.quantity || 0) * (order.price || 0);

    // Find or create position
    let position = simulatedPortfolio.positions.find(p => p.symbol === order.symbol);
    
    if (position) {
      position.quantity += order.quantity || 0;
      position.marketValue += orderValue;
    } else {
      simulatedPortfolio.positions.push({
        symbol: order.symbol || '',
        name: order.symbol || '',
        assetClass: 'equity',
        quantity: order.quantity || 0,
        averageCost: order.price || 0,
        currentPrice: order.price || 0,
        marketValue: orderValue,
        unrealizedPnl: 0,
        realizedPnl: 0,
        weight: 0,
        currency: 'USD',
        lastUpdated: new Date(),
      });
    }

    // Update total value
    if (order.side === 'buy') {
      simulatedPortfolio.totalValue += orderValue;
      simulatedPortfolio.cashBalance -= orderValue;
    } else {
      simulatedPortfolio.totalValue -= orderValue;
      simulatedPortfolio.cashBalance += orderValue;
    }

    // Recalculate weights
    simulatedPortfolio.positions.forEach(p => {
      p.weight = (p.marketValue / simulatedPortfolio.totalValue) * 100;
    });

    return Object.assign(new Portfolio(), simulatedPortfolio);
  }

  private async assessOrderLiquidity(order: Partial<InstitutionalOrder>): Promise<number> {
    const avgVolume = await this.getAverageVolume(order.symbol || '');
    const orderSize = order.quantity || 0;
    
    if (avgVolume === 0) return 0;
    
    // Score based on order size relative to average volume
    const volumeRatio = orderSize / avgVolume;
    
    if (volumeRatio < 0.01) return 1; // Very liquid
    if (volumeRatio < 0.05) return 0.8; // Liquid
    if (volumeRatio < 0.1) return 0.6; // Moderate
    if (volumeRatio < 0.2) return 0.4; // Low liquidity
    return 0.2; // Very low liquidity
  }

  private suggestOrderAdjustments(order: Partial<InstitutionalOrder>, alerts: RiskAlert[]): any {
    const adjustments: any = {};

    // Suggest quantity reduction for concentration alerts
    if (alerts.some(a => a.metricType === RiskMetricType.CONCENTRATION)) {
      adjustments.reducedQuantity = Math.floor((order.quantity || 0) * 0.7);
    }

    // Suggest order splitting for liquidity alerts
    if (alerts.some(a => a.metricType === RiskMetricType.LIQUIDITY)) {
      adjustments.splitOrder = {
        numberOfOrders: 5,
        timeInterval: '30 minutes',
        algorithm: 'TWAP',
      };
    }

    // Suggest hedging for high VaR
    if (alerts.some(a => a.metricType === RiskMetricType.VAR)) {
      adjustments.hedgingStrategy = {
        instrument: 'put options',
        hedgeRatio: 0.5,
      };
    }

    return adjustments;
  }

  // Mock data methods (would connect to real data sources)
  private async getHistoricalReturns(portfolio: Portfolio): Promise<number[]> {
    // Mock implementation - would fetch from market data service
    const returns: number[] = [];
    for (let i = 0; i < 252; i++) {
      returns.push((Math.random() - 0.5) * 0.02); // Random returns between -1% and 1%
    }
    return returns;
  }

  private async getPositionPrices(portfolio: Portfolio): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    portfolio.positions.forEach(p => {
      prices[p.symbol] = p.currentPrice;
    });
    return prices;
  }

  private async getBenchmarkReturns(benchmarkSymbol: string): Promise<number[]> {
    // Mock implementation
    const returns: number[] = [];
    for (let i = 0; i < 252; i++) {
      returns.push((Math.random() - 0.5) * 0.015);
    }
    return returns;
  }

  private async getAverageVolume(symbol: string): Promise<number> {
    // Mock implementation
    return 1000000 + Math.random() * 9000000; // Random volume between 1M and 10M
  }

  private async getPositionBeta(symbol: string): Promise<number> {
    // Mock implementation
    return 0.5 + Math.random() * 1.5; // Random beta between 0.5 and 2
  }

  private async getStressedReturns(portfolio: Portfolio, scenario: StressTestScenario): Promise<number[]> {
    const normalReturns = await this.getHistoricalReturns(portfolio);
    return normalReturns.map(r => r * scenario.volatilityMultiplier + scenario.marketShock / 252);
  }

  private generateNormalRandom(mean: number, stdDev: number): number {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}