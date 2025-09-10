import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitutionalOrder } from '../entities/institutional-order.entity';
import { Portfolio } from '../entities/portfolio.entity';
import { InstitutionalStrategy } from '../entities/institutional-strategy.entity';

export enum ComplianceCheckType {
  PRE_TRADE = 'pre_trade',
  POST_TRADE = 'post_trade',
  CONTINUOUS = 'continuous',
}

export enum ComplianceRuleType {
  POSITION_LIMIT = 'position_limit',
  CONCENTRATION_LIMIT = 'concentration_limit',
  WASH_SALE = 'wash_sale',
  BEST_EXECUTION = 'best_execution',
  MARKET_MANIPULATION = 'market_manipulation',
  INSIDER_TRADING = 'insider_trading',
  RESTRICTED_LIST = 'restricted_list',
  TRADE_SURVEILLANCE = 'trade_surveillance',
  REGULATORY_REPORTING = 'regulatory_reporting',
  KYC_AML = 'kyc_aml',
}

export enum ComplianceStatus {
  PASS = 'pass',
  FAIL = 'fail',
  WARNING = 'warning',
  REVIEW_REQUIRED = 'review_required',
}

export interface ComplianceCheckResult {
  ruleType: ComplianceRuleType;
  status: ComplianceStatus;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requiresApproval?: boolean;
  approver?: string;
}

export interface ComplianceReport {
  orderId?: string;
  portfolioId?: string;
  checkType: ComplianceCheckType;
  results: ComplianceCheckResult[];
  overallStatus: ComplianceStatus;
  executionAllowed: boolean;
  reportId: string;
  generatedAt: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class ComplianceEngineService {
  private readonly logger = new Logger(ComplianceEngineService.name);

  constructor(
    @InjectRepository(InstitutionalOrder)
    private orderRepository: Repository<InstitutionalOrder>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    @InjectRepository(InstitutionalStrategy)
    private strategyRepository: Repository<InstitutionalStrategy>,
  ) {}

  // Pre-Trade Compliance Checks
  async performPreTradeChecks(
    order: Partial<InstitutionalOrder>,
    portfolioId: string,
  ): Promise<ComplianceReport> {
    const results: ComplianceCheckResult[] = [];
    const portfolio = await this.portfolioRepository.findOne({ where: { id: portfolioId } });

    if (!portfolio) {
      return this.createComplianceReport(
        order.id,
        portfolioId,
        ComplianceCheckType.PRE_TRADE,
        [{
          ruleType: ComplianceRuleType.POSITION_LIMIT,
          status: ComplianceStatus.FAIL,
          message: 'Portfolio not found',
          timestamp: new Date(),
        }],
      );
    }

    // Check Position Limits
    results.push(await this.checkPositionLimits(order, portfolio));

    // Check Concentration Limits
    results.push(await this.checkConcentrationLimits(order, portfolio));

    // Check Restricted List
    results.push(await this.checkRestrictedList(order));

    // Check Wash Sale Rules
    results.push(await this.checkWashSaleRule(order, portfolioId));

    // Check Market Manipulation
    results.push(await this.checkMarketManipulation(order));

    // Check KYC/AML
    results.push(await this.checkKycAml(order));

    return this.createComplianceReport(
      order.id,
      portfolioId,
      ComplianceCheckType.PRE_TRADE,
      results,
    );
  }

  // Post-Trade Compliance Checks
  async performPostTradeChecks(
    orderId: string,
    portfolioId: string,
  ): Promise<ComplianceReport> {
    const results: ComplianceCheckResult[] = [];
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    const portfolio = await this.portfolioRepository.findOne({ where: { id: portfolioId } });

    if (!order || !portfolio) {
      return this.createComplianceReport(
        orderId,
        portfolioId,
        ComplianceCheckType.POST_TRADE,
        [{
          ruleType: ComplianceRuleType.BEST_EXECUTION,
          status: ComplianceStatus.FAIL,
          message: 'Order or portfolio not found',
          timestamp: new Date(),
        }],
      );
    }

    // Check Best Execution
    results.push(await this.checkBestExecution(order));

    // Check Trade Surveillance
    results.push(await this.checkTradeSurveillance(order));

    // Check Regulatory Reporting Requirements
    results.push(await this.checkRegulatoryReporting(order));

    // Update Portfolio Compliance Status
    results.push(await this.updatePortfolioCompliance(portfolio, order));

    return this.createComplianceReport(
      orderId,
      portfolioId,
      ComplianceCheckType.POST_TRADE,
      results,
    );
  }

  // Individual Compliance Checks
  private async checkPositionLimits(
    order: Partial<InstitutionalOrder>,
    portfolio: Portfolio,
  ): Promise<ComplianceCheckResult> {
    const currentPosition = portfolio.positions?.find(p => p.symbol === order.symbol) || null;
    const proposedQuantity = (currentPosition?.quantity || 0) + (order.quantity || 0);
    const proposedValue = proposedQuantity * (order.price || 0);
    const maxPositionValue = portfolio.totalValue * 0.1; // 10% max position size

    if (proposedValue > maxPositionValue) {
      return {
        ruleType: ComplianceRuleType.POSITION_LIMIT,
        status: ComplianceStatus.FAIL,
        message: `Position size exceeds 10% limit. Proposed: ${proposedValue}, Max: ${maxPositionValue}`,
        details: {
          currentPosition: currentPosition?.quantity || 0,
          proposedAddition: order.quantity,
          proposedTotal: proposedQuantity,
          proposedValue,
          maxAllowed: maxPositionValue,
        },
        timestamp: new Date(),
        requiresApproval: true,
      };
    }

    return {
      ruleType: ComplianceRuleType.POSITION_LIMIT,
      status: ComplianceStatus.PASS,
      message: 'Position limit check passed',
      timestamp: new Date(),
    };
  }

  private async checkConcentrationLimits(
    order: Partial<InstitutionalOrder>,
    portfolio: Portfolio,
  ): Promise<ComplianceCheckResult> {
    const sectorConcentration = portfolio.analytics?.sectorAllocation || {};
    const maxSectorConcentration = 30; // 30% max sector concentration

    // This would need sector mapping for the symbol
    const orderSector = await this.getSymbolSector(order.symbol || '');
    const currentSectorWeight = sectorConcentration[orderSector] || 0;

    if (currentSectorWeight > maxSectorConcentration) {
      return {
        ruleType: ComplianceRuleType.CONCENTRATION_LIMIT,
        status: ComplianceStatus.WARNING,
        message: `Sector concentration approaching limit: ${currentSectorWeight}%`,
        details: {
          sector: orderSector,
          currentWeight: currentSectorWeight,
          maxAllowed: maxSectorConcentration,
        },
        timestamp: new Date(),
      };
    }

    return {
      ruleType: ComplianceRuleType.CONCENTRATION_LIMIT,
      status: ComplianceStatus.PASS,
      message: 'Concentration limits check passed',
      timestamp: new Date(),
    };
  }

  private async checkRestrictedList(
    order: Partial<InstitutionalOrder>,
  ): Promise<ComplianceCheckResult> {
    const restrictedSymbols = await this.getRestrictedSymbols();

    if (restrictedSymbols.includes(order.symbol || '')) {
      return {
        ruleType: ComplianceRuleType.RESTRICTED_LIST,
        status: ComplianceStatus.FAIL,
        message: `Symbol ${order.symbol} is on restricted list`,
        details: {
          symbol: order.symbol,
          reason: 'Regulatory restriction',
        },
        timestamp: new Date(),
        requiresApproval: true,
      };
    }

    return {
      ruleType: ComplianceRuleType.RESTRICTED_LIST,
      status: ComplianceStatus.PASS,
      message: 'Restricted list check passed',
      timestamp: new Date(),
    };
  }

  private async checkWashSaleRule(
    order: Partial<InstitutionalOrder>,
    portfolioId: string,
  ): Promise<ComplianceCheckResult> {
    const lookbackDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

    // Check for recent sales of the same symbol
    const recentSales = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.portfolioId = :portfolioId', { portfolioId })
      .andWhere('order.symbol = :symbol', { symbol: order.symbol })
      .andWhere('order.side = :side', { side: 'sell' })
      .andWhere('order.executedAt >= :cutoffDate', { cutoffDate })
      .getMany();

    if (recentSales.length > 0 && order.side === 'buy') {
      const lastSale = recentSales[0];
      const daysSinceSale = Math.floor(
        (new Date().getTime() - new Date(lastSale.executedAt!).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceSale < 30) {
        return {
          ruleType: ComplianceRuleType.WASH_SALE,
          status: ComplianceStatus.WARNING,
          message: `Potential wash sale violation. Last sale was ${daysSinceSale} days ago`,
          details: {
            lastSaleDate: lastSale.executedAt,
            daysSinceSale,
            symbol: order.symbol,
          },
          timestamp: new Date(),
        };
      }
    }

    return {
      ruleType: ComplianceRuleType.WASH_SALE,
      status: ComplianceStatus.PASS,
      message: 'Wash sale rule check passed',
      timestamp: new Date(),
    };
  }

  private async checkMarketManipulation(
    order: Partial<InstitutionalOrder>,
  ): Promise<ComplianceCheckResult> {
    // Check for patterns indicating market manipulation
    const recentOrders = await this.getRecentOrdersForSymbol(order.symbol || '', 60); // Last 60 minutes

    // Check for layering/spoofing patterns
    const cancelledOrdersRatio = recentOrders.filter(o => o.status === 'cancelled').length / recentOrders.length;
    
    if (cancelledOrdersRatio > 0.8) {
      return {
        ruleType: ComplianceRuleType.MARKET_MANIPULATION,
        status: ComplianceStatus.REVIEW_REQUIRED,
        message: 'High cancellation rate detected - possible layering/spoofing',
        details: {
          cancelledRatio: cancelledOrdersRatio,
          totalOrders: recentOrders.length,
          timeWindow: '60 minutes',
        },
        timestamp: new Date(),
        requiresApproval: true,
      };
    }

    // Check for wash trading patterns
    const selfTrades = await this.checkForSelfTrading(order);
    if (selfTrades > 0) {
      return {
        ruleType: ComplianceRuleType.MARKET_MANIPULATION,
        status: ComplianceStatus.FAIL,
        message: 'Potential wash trading detected',
        details: {
          selfTrades,
          symbol: order.symbol,
        },
        timestamp: new Date(),
        requiresApproval: true,
      };
    }

    return {
      ruleType: ComplianceRuleType.MARKET_MANIPULATION,
      status: ComplianceStatus.PASS,
      message: 'Market manipulation check passed',
      timestamp: new Date(),
    };
  }

  private async checkBestExecution(
    order: InstitutionalOrder,
  ): Promise<ComplianceCheckResult> {
    if (!order.executedPrice || !order.arrivalPrice) {
      return {
        ruleType: ComplianceRuleType.BEST_EXECUTION,
        status: ComplianceStatus.WARNING,
        message: 'Unable to verify best execution - missing price data',
        timestamp: new Date(),
      };
    }

    const slippage = Math.abs(order.executedPrice - order.arrivalPrice) / order.arrivalPrice;
    const acceptableSlippage = 0.005; // 0.5%

    if (slippage > acceptableSlippage) {
      return {
        ruleType: ComplianceRuleType.BEST_EXECUTION,
        status: ComplianceStatus.WARNING,
        message: `Execution slippage exceeds threshold: ${(slippage * 100).toFixed(2)}%`,
        details: {
          arrivalPrice: order.arrivalPrice,
          executedPrice: order.executedPrice,
          slippage: slippage * 100,
          threshold: acceptableSlippage * 100,
        },
        timestamp: new Date(),
      };
    }

    return {
      ruleType: ComplianceRuleType.BEST_EXECUTION,
      status: ComplianceStatus.PASS,
      message: 'Best execution requirements met',
      details: {
        slippage: slippage * 100,
        executionQuality: order.executionQualityScore,
      },
      timestamp: new Date(),
    };
  }

  private async checkTradeSurveillance(
    order: InstitutionalOrder,
  ): Promise<ComplianceCheckResult> {
    // Implement trade surveillance logic
    // Check for unusual trading patterns, front-running, etc.

    return {
      ruleType: ComplianceRuleType.TRADE_SURVEILLANCE,
      status: ComplianceStatus.PASS,
      message: 'Trade surveillance check passed',
      timestamp: new Date(),
    };
  }

  private async checkRegulatoryReporting(
    order: InstitutionalOrder,
  ): Promise<ComplianceCheckResult> {
    const reportingThreshold = 1000000; // $1M threshold for regulatory reporting

    if (order.totalCost && order.totalCost > reportingThreshold) {
      return {
        ruleType: ComplianceRuleType.REGULATORY_REPORTING,
        status: ComplianceStatus.WARNING,
        message: 'Order requires regulatory reporting',
        details: {
          orderValue: order.totalCost,
          reportingRequired: true,
          regulations: ['MiFID II', 'Dodd-Frank'],
        },
        timestamp: new Date(),
      };
    }

    return {
      ruleType: ComplianceRuleType.REGULATORY_REPORTING,
      status: ComplianceStatus.PASS,
      message: 'No regulatory reporting required',
      timestamp: new Date(),
    };
  }

  private async checkKycAml(
    order: Partial<InstitutionalOrder>,
  ): Promise<ComplianceCheckResult> {
    // Check KYC/AML compliance
    // This would integrate with KYC service

    return {
      ruleType: ComplianceRuleType.KYC_AML,
      status: ComplianceStatus.PASS,
      message: 'KYC/AML check passed',
      timestamp: new Date(),
    };
  }

  private async updatePortfolioCompliance(
    portfolio: Portfolio,
    order: InstitutionalOrder,
  ): Promise<ComplianceCheckResult> {
    const violations = portfolio.checkComplianceViolations();

    if (violations.length > 0) {
      return {
        ruleType: ComplianceRuleType.POSITION_LIMIT,
        status: ComplianceStatus.WARNING,
        message: 'Portfolio compliance violations detected',
        details: {
          violations,
        },
        timestamp: new Date(),
      };
    }

    return {
      ruleType: ComplianceRuleType.POSITION_LIMIT,
      status: ComplianceStatus.PASS,
      message: 'Portfolio compliance maintained',
      timestamp: new Date(),
    };
  }

  // Helper Methods
  private createComplianceReport(
    orderId: string | undefined,
    portfolioId: string,
    checkType: ComplianceCheckType,
    results: ComplianceCheckResult[],
  ): ComplianceReport {
    const failedChecks = results.filter(r => r.status === ComplianceStatus.FAIL);
    const warningChecks = results.filter(r => r.status === ComplianceStatus.WARNING);
    const reviewRequired = results.filter(r => r.status === ComplianceStatus.REVIEW_REQUIRED);

    let overallStatus = ComplianceStatus.PASS;
    let executionAllowed = true;

    if (failedChecks.length > 0) {
      overallStatus = ComplianceStatus.FAIL;
      executionAllowed = false;
    } else if (reviewRequired.length > 0) {
      overallStatus = ComplianceStatus.REVIEW_REQUIRED;
      executionAllowed = false;
    } else if (warningChecks.length > 0) {
      overallStatus = ComplianceStatus.WARNING;
      // Warnings don't block execution by default
    }

    return {
      orderId,
      portfolioId,
      checkType,
      results,
      overallStatus,
      executionAllowed,
      reportId: `comp_${Date.now()}`,
      generatedAt: new Date(),
      metadata: {
        totalChecks: results.length,
        passed: results.filter(r => r.status === ComplianceStatus.PASS).length,
        failed: failedChecks.length,
        warnings: warningChecks.length,
        reviewRequired: reviewRequired.length,
      },
    };
  }

  private async getSymbolSector(symbol: string): Promise<string> {
    // Mock implementation - would integrate with market data service
    const sectorMap: Record<string, string> = {
      'AAPL': 'Technology',
      'GOOGL': 'Technology',
      'JPM': 'Financial',
      'XOM': 'Energy',
      'JNJ': 'Healthcare',
    };

    return sectorMap[symbol] || 'Unknown';
  }

  private async getRestrictedSymbols(): Promise<string[]> {
    // Mock implementation - would fetch from database or external service
    return ['RESTRICTED1', 'RESTRICTED2'];
  }

  private async getRecentOrdersForSymbol(symbol: string, minutes: number): Promise<any[]> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);

    return this.orderRepository
      .createQueryBuilder('order')
      .where('order.symbol = :symbol', { symbol })
      .andWhere('order.createdAt >= :cutoffTime', { cutoffTime })
      .getMany();
  }

  private async checkForSelfTrading(order: Partial<InstitutionalOrder>): Promise<number> {
    // Check if there are matching opposite-side orders from the same tenant
    // This would need more sophisticated logic in production
    return 0;
  }

  // Continuous Monitoring
  async startContinuousMonitoring(portfolioId: string): Promise<void> {
    this.logger.log(`Starting continuous compliance monitoring for portfolio: ${portfolioId}`);
    
    // Set up periodic checks
    setInterval(async () => {
      const portfolio = await this.portfolioRepository.findOne({ where: { id: portfolioId } });
      if (portfolio) {
        const violations = portfolio.checkComplianceViolations();
        if (violations.length > 0) {
          this.logger.warn(`Compliance violations detected for portfolio ${portfolioId}:`, violations);
          // Trigger alerts, notifications, etc.
        }
      }
    }, 60000); // Check every minute
  }

  // Reporting
  async generateComplianceReport(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.tenantId = :tenantId', { tenantId })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    const complianceMetrics = {
      totalOrders: orders.length,
      complianceChecks: {
        preTradeChecks: 0,
        postTradeChecks: 0,
        continuousChecks: 0,
      },
      violations: {
        positionLimit: 0,
        concentrationLimit: 0,
        washSale: 0,
        bestExecution: 0,
        marketManipulation: 0,
      },
      overallComplianceRate: 0,
    };

    // Calculate metrics from orders
    // This is a simplified implementation

    return {
      reportId: `compliance_report_${Date.now()}`,
      tenantId,
      period: { startDate, endDate },
      metrics: complianceMetrics,
      generatedAt: new Date(),
    };
  }
}