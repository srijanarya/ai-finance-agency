import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MarketData } from '../entities/market-data.entity';
import { BacktestResult, BacktestTrade } from '../entities/backtest-result.entity';
import { Signal, SignalType, TimeFrame } from '../entities/signal.entity';

interface BacktestConfig {
  initialCapital: number;
  commission: number;
  slippage: number;
  maxPositionSize: number;
  riskPerTrade: number;
}

interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  entryTime: Date;
  stopLoss?: number;
  takeProfit?: number;
  maxFavorableExcursion: number;
  maxAdverseExcursion: number;
}

interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  avgReturn: number;
  totalTrades: number;
}

@Injectable()
export class BacktestService {
  private readonly logger = new Logger(BacktestService.name);

  constructor(
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
    @InjectRepository(BacktestResult)
    private backtestResultRepository: Repository<BacktestResult>,
    @InjectRepository(BacktestTrade)
    private backtestTradeRepository: Repository<BacktestTrade>,
    private configService: ConfigService,
  ) {}

  async quickBacktest(
    symbol: string,
    timeFrame: TimeFrame,
    signalType: SignalType,
    daysBack: number = 7
  ): Promise<BacktestMetrics> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const historicalData = await this.marketDataRepository.find({
      where: {
        symbol,
        timeFrame,
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
      order: { timestamp: 'ASC' },
    });

    if (historicalData.length < 10) {
      throw new Error('Insufficient data for backtesting');
    }

    const config: BacktestConfig = {
      initialCapital: 10000,
      commission: 0.001, // 0.1%
      slippage: 0.0005, // 0.05%
      maxPositionSize: 1.0, // 100% of capital
      riskPerTrade: 0.02, // 2% risk per trade
    };

    return this.runSimpleBacktest(historicalData, signalType, config);
  }

  async runFullBacktest(
    symbol: string,
    strategyId: string,
    timeFrame: TimeFrame,
    startDate: Date,
    endDate: Date,
    config?: Partial<BacktestConfig>
  ): Promise<BacktestResult> {
    this.logger.log(
      `Running full backtest for ${symbol} from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const historicalData = await this.marketDataRepository.find({
      where: {
        symbol,
        timeFrame,
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
      order: { timestamp: 'ASC' },
    });

    if (historicalData.length < 50) {
      throw new Error('Insufficient data for comprehensive backtesting');
    }

    const backtestConfig: BacktestConfig = {
      initialCapital: 100000,
      commission: 0.001,
      slippage: 0.0005,
      maxPositionSize: 0.2, // 20% max position size
      riskPerTrade: 0.01, // 1% risk per trade
      ...config,
    };

    const result = await this.runComprehensiveBacktest(
      symbol,
      strategyId,
      historicalData,
      backtestConfig
    );

    // Save backtest result
    await this.backtestResultRepository.save(result);
    
    return result;
  }

  private runSimpleBacktest(
    data: MarketData[],
    signalType: SignalType,
    config: BacktestConfig
  ): BacktestMetrics {
    let capital = config.initialCapital;
    let position: Position | null = null;
    const trades: any[] = [];
    const capitalHistory: number[] = [capital];

    for (let i = 1; i < data.length; i++) {
      const currentBar = data[i];
      const prevBar = data[i - 1];

      // Check for exit conditions first
      if (position) {
        const { exitPrice, exitReason } = this.checkExitConditions(
          position,
          currentBar,
          prevBar
        );

        if (exitPrice) {
          // Close position
          const pnl = this.calculatePnL(position, exitPrice, config);
          capital += pnl;
          
          trades.push({
            entryPrice: position.entryPrice,
            exitPrice,
            pnl: (pnl / config.initialCapital) * 100,
            holdingPeriod: i - trades.length,
            exitReason,
          });
          
          position = null;
        } else {
          // Update MFE/MAE
          this.updatePositionExcursions(position, currentBar);
        }
      }

      // Check for entry conditions
      if (!position && this.shouldEnter(signalType, currentBar, prevBar, data, i)) {
        const entryPrice = this.getEntryPrice(currentBar, config);
        const positionSize = this.calculatePositionSize(capital, entryPrice, config);
        
        position = {
          symbol: currentBar.symbol,
          side: this.getPositionSide(signalType),
          entryPrice,
          quantity: positionSize,
          entryTime: currentBar.timestamp,
          stopLoss: this.calculateStopLoss(entryPrice, signalType, currentBar),
          takeProfit: this.calculateTakeProfit(entryPrice, signalType, currentBar),
          maxFavorableExcursion: 0,
          maxAdverseExcursion: 0,
        };
      }

      capitalHistory.push(capital);
    }

    // Close any remaining position
    if (position && data.length > 0) {
      const lastBar = data[data.length - 1];
      const pnl = this.calculatePnL(position, lastBar.close, config);
      capital += pnl;
      
      trades.push({
        entryPrice: position.entryPrice,
        exitPrice: lastBar.close,
        pnl: (pnl / config.initialCapital) * 100,
        holdingPeriod: data.length - trades.length,
        exitReason: 'END_OF_DATA',
      });
    }

    return this.calculateMetrics(config.initialCapital, capital, trades, capitalHistory);
  }

  private async runComprehensiveBacktest(
    symbol: string,
    strategyId: string,
    data: MarketData[],
    config: BacktestConfig
  ): Promise<BacktestResult> {
    let capital = config.initialCapital;
    let position: Position | null = null;
    const trades: BacktestTrade[] = [];
    const capitalHistory: number[] = [capital];
    const drawdownHistory: number[] = [];
    let maxCapital = capital;

    // Simulate trading through historical data
    for (let i = 20; i < data.length; i++) { // Start after 20 bars for indicators
      const currentBar = data[i];
      const historicalWindow = data.slice(Math.max(0, i - 50), i + 1);
      
      // Update drawdown tracking
      if (capital > maxCapital) {
        maxCapital = capital;
      }
      const drawdown = (maxCapital - capital) / maxCapital;
      drawdownHistory.push(drawdown);

      // Check for exit conditions
      if (position) {
        const { exitPrice, exitReason } = this.checkExitConditions(
          position,
          currentBar,
          data[i - 1]
        );

        if (exitPrice) {
          // Close position and record trade
          const pnl = this.calculatePnL(position, exitPrice, config);
          capital += pnl;
          
          const trade = new BacktestTrade();
          trade.symbol = symbol;
          trade.side = position.side;
          trade.entryTime = position.entryTime;
          trade.entryPrice = position.entryPrice;
          trade.exitTime = currentBar.timestamp;
          trade.exitPrice = exitPrice;
          trade.quantity = position.quantity;
          trade.pnl = (pnl / config.initialCapital) * 100;
          trade.pnlAmount = pnl;
          trade.holdingPeriodHours = Math.round(
            (currentBar.timestamp.getTime() - position.entryTime.getTime()) / (1000 * 60 * 60)
          );
          trade.maxFavorableExcursion = position.maxFavorableExcursion;
          trade.maxAdverseExcursion = position.maxAdverseExcursion;
          trade.exitReason = exitReason;
          
          trades.push(trade);
          position = null;
        } else {
          this.updatePositionExcursions(position, currentBar);
        }
      }

      // Check for entry conditions
      if (!position && this.shouldEnterAdvanced(currentBar, historicalWindow, i)) {
        const signalType = this.generateSignalType(currentBar, historicalWindow);
        if (signalType !== SignalType.HOLD) {
          const entryPrice = this.getEntryPrice(currentBar, config);
          const positionSize = this.calculateAdvancedPositionSize(
            capital,
            entryPrice,
            config,
            historicalWindow
          );
          
          position = {
            symbol,
            side: this.getPositionSide(signalType),
            entryPrice,
            quantity: positionSize,
            entryTime: currentBar.timestamp,
            stopLoss: this.calculateAdvancedStopLoss(entryPrice, signalType, historicalWindow),
            takeProfit: this.calculateAdvancedTakeProfit(entryPrice, signalType, historicalWindow),
            maxFavorableExcursion: 0,
            maxAdverseExcursion: 0,
          };
        }
      }

      capitalHistory.push(capital);
    }

    // Create backtest result
    const result = new BacktestResult();
    result.strategyId = strategyId;
    result.symbol = symbol;
    result.startDate = data[0].timestamp;
    result.endDate = data[data.length - 1].timestamp;
    result.initialCapital = config.initialCapital;
    result.finalCapital = capital;
    
    const metrics = this.calculateAdvancedMetrics(
      config.initialCapital,
      capital,
      trades,
      capitalHistory,
      drawdownHistory,
      data
    );
    
    Object.assign(result, metrics);
    
    return result;
  }

  private shouldEnter(
    signalType: SignalType,
    currentBar: MarketData,
    prevBar: MarketData,
    data: MarketData[],
    index: number
  ): boolean {
    // Simple entry logic based on signal type
    switch (signalType) {
      case SignalType.BUY:
        return currentBar.close > prevBar.close; // Simple momentum
      case SignalType.SELL:
        return currentBar.close < prevBar.close;
      default:
        return false;
    }
  }

  private shouldEnterAdvanced(
    currentBar: MarketData,
    historicalWindow: MarketData[],
    index: number
  ): boolean {
    // More sophisticated entry logic
    if (historicalWindow.length < 20) return false;
    
    const closes = historicalWindow.map(d => d.close);
    const volumes = historicalWindow.map(d => d.volume);
    
    // Calculate simple technical indicators
    const sma20 = closes.slice(-20).reduce((a, b) => a + b) / 20;
    const sma5 = closes.slice(-5).reduce((a, b) => a + b) / 5;
    const avgVolume = volumes.slice(-10).reduce((a, b) => a + b) / 10;
    
    // Entry conditions
    const priceAboveSMA = currentBar.close > sma20;
    const shortAboveLong = sma5 > sma20;
    const volumeConfirmation = currentBar.volume > avgVolume * 1.2;
    
    return (priceAboveSMA && shortAboveLong && volumeConfirmation) ||
           (!priceAboveSMA && !shortAboveLong && volumeConfirmation);
  }

  private generateSignalType(
    currentBar: MarketData,
    historicalWindow: MarketData[]
  ): SignalType {
    const closes = historicalWindow.map(d => d.close);
    const sma20 = closes.slice(-20).reduce((a, b) => a + b) / 20;
    const sma5 = closes.slice(-5).reduce((a, b) => a + b) / 5;
    
    if (currentBar.close > sma20 && sma5 > sma20) {
      return SignalType.BUY;
    } else if (currentBar.close < sma20 && sma5 < sma20) {
      return SignalType.SELL;
    }
    
    return SignalType.HOLD;
  }

  private checkExitConditions(
    position: Position,
    currentBar: MarketData,
    prevBar: MarketData
  ): { exitPrice: number | null; exitReason: string | null } {
    const currentPrice = currentBar.close;
    
    // Stop loss
    if (position.stopLoss) {
      if (
        (position.side === 'LONG' && currentPrice <= position.stopLoss) ||
        (position.side === 'SHORT' && currentPrice >= position.stopLoss)
      ) {
        return { exitPrice: position.stopLoss, exitReason: 'STOP_LOSS' };
      }
    }
    
    // Take profit
    if (position.takeProfit) {
      if (
        (position.side === 'LONG' && currentPrice >= position.takeProfit) ||
        (position.side === 'SHORT' && currentPrice <= position.takeProfit)
      ) {
        return { exitPrice: position.takeProfit, exitReason: 'TAKE_PROFIT' };
      }
    }
    
    // Time-based exit (example: hold for max 10 bars)
    const holdingTime = Date.now() - position.entryTime.getTime();
    const maxHoldingTime = 10 * 60 * 60 * 1000; // 10 hours
    if (holdingTime > maxHoldingTime) {
      return { exitPrice: currentPrice, exitReason: 'TIMEOUT' };
    }
    
    return { exitPrice: null, exitReason: null };
  }

  private updatePositionExcursions(position: Position, currentBar: MarketData): void {
    const currentPrice = currentBar.close;
    const entryPrice = position.entryPrice;
    
    if (position.side === 'LONG') {
      const favorableMove = (currentPrice - entryPrice) / entryPrice;
      const adverseMove = (entryPrice - currentPrice) / entryPrice;
      
      position.maxFavorableExcursion = Math.max(position.maxFavorableExcursion, favorableMove);
      position.maxAdverseExcursion = Math.max(position.maxAdverseExcursion, adverseMove);
    } else {
      const favorableMove = (entryPrice - currentPrice) / entryPrice;
      const adverseMove = (currentPrice - entryPrice) / entryPrice;
      
      position.maxFavorableExcursion = Math.max(position.maxFavorableExcursion, favorableMove);
      position.maxAdverseExcursion = Math.max(position.maxAdverseExcursion, adverseMove);
    }
  }

  private getEntryPrice(currentBar: MarketData, config: BacktestConfig): number {
    // Simulate slippage
    const slippageAmount = currentBar.close * config.slippage;
    return currentBar.close + slippageAmount;
  }

  private getPositionSide(signalType: SignalType): 'LONG' | 'SHORT' {
    return signalType === SignalType.BUY || signalType === SignalType.STRONG_BUY 
      ? 'LONG' 
      : 'SHORT';
  }

  private calculatePositionSize(
    capital: number,
    entryPrice: number,
    config: BacktestConfig
  ): number {
    // Simple fixed fractional position sizing
    const positionValue = capital * config.maxPositionSize;
    return Math.floor(positionValue / entryPrice);
  }

  private calculateAdvancedPositionSize(
    capital: number,
    entryPrice: number,
    config: BacktestConfig,
    historicalWindow: MarketData[]
  ): number {
    // Volatility-based position sizing
    const volatility = this.calculateVolatility(historicalWindow);
    const adjustedRisk = config.riskPerTrade / Math.max(volatility, 0.01);
    const positionValue = capital * Math.min(adjustedRisk, config.maxPositionSize);
    
    return Math.floor(positionValue / entryPrice);
  }

  private calculateVolatility(data: MarketData[]): number {
    if (data.length < 2) return 0.02; // Default 2%
    
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].close - data[i - 1].close) / data[i - 1].close);
    }
    
    const mean = returns.reduce((a, b) => a + b) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateStopLoss(
    entryPrice: number,
    signalType: SignalType,
    currentBar: MarketData
  ): number {
    const atr = (currentBar.high - currentBar.low) || entryPrice * 0.02; // Use range as ATR proxy
    const stopDistance = atr * 2;
    
    if (signalType === SignalType.BUY || signalType === SignalType.STRONG_BUY) {
      return entryPrice - stopDistance;
    } else {
      return entryPrice + stopDistance;
    }
  }

  private calculateTakeProfit(
    entryPrice: number,
    signalType: SignalType,
    currentBar: MarketData
  ): number {
    const atr = (currentBar.high - currentBar.low) || entryPrice * 0.02;
    const targetDistance = atr * 3; // 3:1 risk-reward
    
    if (signalType === SignalType.BUY || signalType === SignalType.STRONG_BUY) {
      return entryPrice + targetDistance;
    } else {
      return entryPrice - targetDistance;
    }
  }

  private calculateAdvancedStopLoss(
    entryPrice: number,
    signalType: SignalType,
    historicalWindow: MarketData[]
  ): number {
    const atr = this.calculateATR(historicalWindow);
    const stopDistance = atr * 1.5;
    
    if (signalType === SignalType.BUY || signalType === SignalType.STRONG_BUY) {
      return entryPrice - stopDistance;
    } else {
      return entryPrice + stopDistance;
    }
  }

  private calculateAdvancedTakeProfit(
    entryPrice: number,
    signalType: SignalType,
    historicalWindow: MarketData[]
  ): number {
    const atr = this.calculateATR(historicalWindow);
    const targetDistance = atr * 2.5;
    
    if (signalType === SignalType.BUY || signalType === SignalType.STRONG_BUY) {
      return entryPrice + targetDistance;
    } else {
      return entryPrice - targetDistance;
    }
  }

  private calculateATR(data: MarketData[], period: number = 14): number {
    if (data.length < period + 1) return data[0]?.close * 0.02 || 100; // Default
    
    const trueRanges = [];
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      const tr1 = current.high - current.low;
      const tr2 = Math.abs(current.high - previous.close);
      const tr3 = Math.abs(current.low - previous.close);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    const recentTR = trueRanges.slice(-period);
    return recentTR.reduce((a, b) => a + b) / recentTR.length;
  }

  private calculatePnL(position: Position, exitPrice: number, config: BacktestConfig): number {
    const grossPnL = position.side === 'LONG'
      ? (exitPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - exitPrice) * position.quantity;
    
    // Subtract commissions
    const entryCommission = position.entryPrice * position.quantity * config.commission;
    const exitCommission = exitPrice * position.quantity * config.commission;
    
    return grossPnL - entryCommission - exitCommission;
  }

  private calculateMetrics(
    initialCapital: number,
    finalCapital: number,
    trades: any[],
    capitalHistory: number[]
  ): BacktestMetrics {
    const totalReturn = ((finalCapital - initialCapital) / initialCapital) * 100;
    
    // Calculate other metrics
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
    const avgReturn = trades.length > 0 
      ? trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length 
      : 0;
    
    // Calculate max drawdown
    let maxCapital = initialCapital;
    let maxDrawdown = 0;
    
    capitalHistory.forEach(capital => {
      if (capital > maxCapital) {
        maxCapital = capital;
      }
      const drawdown = ((maxCapital - capital) / maxCapital) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    // Calculate volatility and Sharpe ratio
    const returns = [];
    for (let i = 1; i < capitalHistory.length; i++) {
      returns.push((capitalHistory[i] - capitalHistory[i - 1]) / capitalHistory[i - 1]);
    }
    
    const avgDailyReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = this.calculateStandardDeviation(returns) * Math.sqrt(252) * 100; // Annualized
    const annualizedReturn = ((Math.pow(finalCapital / initialCapital, 252 / returns.length) - 1) * 100);
    const sharpeRatio = volatility > 0 ? (annualizedReturn - 2) / volatility : 0; // Assuming 2% risk-free rate
    
    return {
      totalReturn,
      annualizedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown,
      winRate,
      avgReturn,
      totalTrades: trades.length,
    };
  }

  private calculateAdvancedMetrics(
    initialCapital: number,
    finalCapital: number,
    trades: BacktestTrade[],
    capitalHistory: number[],
    drawdownHistory: number[],
    data: MarketData[]
  ): any {
    const baseMetrics = this.calculateMetrics(
      initialCapital,
      finalCapital,
      trades.map(t => ({ pnl: t.pnl })),
      capitalHistory
    );
    
    // Additional advanced metrics
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = trades.filter(t => (t.pnl || 0) <= 0);
    
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length
      : 0;
    
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length)
      : 0;
    
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    // Sortino Ratio (using downside deviation)
    const returns = [];
    for (let i = 1; i < capitalHistory.length; i++) {
      returns.push((capitalHistory[i] - capitalHistory[i - 1]) / capitalHistory[i - 1]);
    }
    
    const negativeReturns = returns.filter(r => r < 0);
    const downsideDeviation = negativeReturns.length > 0
      ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + r * r, 0) / negativeReturns.length)
      : 0;
    
    const sortinoRatio = downsideDeviation > 0
      ? (baseMetrics.annualizedReturn - 2) / (downsideDeviation * Math.sqrt(252) * 100)
      : 0;
    
    // Calmar Ratio
    const calmarRatio = baseMetrics.maxDrawdown > 0
      ? baseMetrics.annualizedReturn / baseMetrics.maxDrawdown
      : 0;
    
    // Max drawdown duration
    const maxDrawdown = Math.max(...drawdownHistory) * 100;
    const maxDrawdownDuration = this.calculateMaxDrawdownDuration(drawdownHistory);
    
    return {
      ...baseMetrics,
      sortinoRatio,
      calmarRatio,
      maxDrawdown,
      maxDrawdownDuration,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      avgWin,
      avgLoss,
      profitFactor,
      expectancy: (baseMetrics.winRate / 100) * avgWin - ((100 - baseMetrics.winRate) / 100) * avgLoss,
      monthlyReturns: this.calculateMonthlyReturns(capitalHistory, data),
      drawdownPeriods: this.calculateDrawdownPeriods(drawdownHistory, data),
      performanceMetrics: {},
      riskMetrics: {},
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b) / squaredDiffs.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  private calculateMaxDrawdownDuration(drawdownHistory: number[]): number {
    let maxDuration = 0;
    let currentDuration = 0;
    
    drawdownHistory.forEach(drawdown => {
      if (drawdown > 0) {
        currentDuration++;
        maxDuration = Math.max(maxDuration, currentDuration);
      } else {
        currentDuration = 0;
      }
    });
    
    return maxDuration;
  }

  private calculateMonthlyReturns(
    capitalHistory: number[],
    data: MarketData[]
  ): { [month: string]: number } {
    const monthlyReturns: { [month: string]: number } = {};
    
    // Group capital history by month
    const monthlyCapital: { [month: string]: number[] } = {};
    
    capitalHistory.forEach((capital, index) => {
      if (index < data.length) {
        const date = data[index].timestamp;
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyCapital[monthKey]) {
          monthlyCapital[monthKey] = [];
        }
        monthlyCapital[monthKey].push(capital);
      }
    });
    
    // Calculate returns for each month
    Object.keys(monthlyCapital).forEach(month => {
      const capitals = monthlyCapital[month];
      if (capitals.length >= 2) {
        const startCapital = capitals[0];
        const endCapital = capitals[capitals.length - 1];
        monthlyReturns[month] = ((endCapital - startCapital) / startCapital) * 100;
      }
    });
    
    return monthlyReturns;
  }

  private calculateDrawdownPeriods(
    drawdownHistory: number[],
    data: MarketData[]
  ): Array<{ start: Date; end: Date; duration: number; magnitude: number }> {
    const drawdownPeriods = [];
    let inDrawdown = false;
    let drawdownStart = 0;
    let maxDrawdownInPeriod = 0;
    
    drawdownHistory.forEach((drawdown, index) => {
      if (drawdown > 0 && !inDrawdown) {
        // Start of drawdown
        inDrawdown = true;
        drawdownStart = index;
        maxDrawdownInPeriod = drawdown;
      } else if (drawdown > 0 && inDrawdown) {
        // Continue drawdown
        maxDrawdownInPeriod = Math.max(maxDrawdownInPeriod, drawdown);
      } else if (drawdown === 0 && inDrawdown) {
        // End of drawdown
        inDrawdown = false;
        
        if (drawdownStart < data.length && index < data.length) {
          drawdownPeriods.push({
            start: data[drawdownStart].timestamp,
            end: data[index].timestamp,
            duration: index - drawdownStart,
            magnitude: maxDrawdownInPeriod * 100,
          });
        }
      }
    });
    
    return drawdownPeriods;
  }

  // API methods
  async getBacktestResults(strategyId: string): Promise<BacktestResult[]> {
    return this.backtestResultRepository.find({
      where: { strategyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getBacktestTrades(backtestId: string): Promise<BacktestTrade[]> {
    return this.backtestTradeRepository.find({
      where: { backtestId },
      order: { entryTime: 'ASC' },
    });
  }
}