import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Signal, SignalType, SignalStatus, TimeFrame } from '../entities/signal.entity';
import { MarketData, MarketNews } from '../entities/market-data.entity';
import { MarketDataService } from './market-data.service';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { MLModelService } from './ml-model.service';
import { BacktestService } from './backtest.service';

interface SignalGenerationContext {
  symbol: string;
  timeFrame: TimeFrame;
  marketData: MarketData[];
  technicalIndicators: any;
  fundamentalData?: any;
  sentimentData?: any;
  newsData?: MarketNews[];
  economicContext?: any;
}

interface SignalPrediction {
  signalType: SignalType;
  confidence: number;
  entryPrice: number;
  targetPrice?: number;
  stopLoss?: number;
  expectedReturn?: number;
  analysis: string;
  features: any;
}

@Injectable()
export class SignalGeneratorService {
  private readonly logger = new Logger(SignalGeneratorService.name);
  private readonly activeSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'SPY', 'QQQ', 'IWM', 'GLD', 'SLV', 'BTC-USD', 'ETH-USD'
  ];

  constructor(
    @InjectRepository(Signal)
    private signalRepository: Repository<Signal>,
    private configService: ConfigService,
    private marketDataService: MarketDataService,
    private technicalAnalysisService: TechnicalAnalysisService,
    private mlModelService: MLModelService,
    private backtestService: BacktestService,
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes for real-time signals
  async generateRealtimeSignals(): Promise<void> {
    this.logger.log('Generating real-time trading signals...');
    
    const timeFrames: TimeFrame[] = [TimeFrame.FIVE_MIN, TimeFrame.FIFTEEN_MIN, TimeFrame.THIRTY_MIN];
    
    for (const symbol of this.activeSymbols) {
      for (const timeFrame of timeFrames) {
        try {
          await this.generateSignalForSymbol(symbol, timeFrame);
        } catch (error) {
          this.logger.error(`Error generating signal for ${symbol} ${timeFrame}:`, error);
        }
      }
    }
  }

  @Cron('0 */1 * * * *') // Every hour for hourly signals
  async generateHourlySignals(): Promise<void> {
    this.logger.log('Generating hourly trading signals...');
    
    for (const symbol of this.activeSymbols) {
      try {
        await this.generateSignalForSymbol(symbol, TimeFrame.ONE_HOUR);
      } catch (error) {
        this.logger.error(`Error generating hourly signal for ${symbol}:`, error);
      }
    }
  }

  @Cron('0 0 9 * * *') // Daily at 9 AM
  async generateDailySignals(): Promise<void> {
    this.logger.log('Generating daily trading signals...');
    
    for (const symbol of this.activeSymbols) {
      try {
        await this.generateSignalForSymbol(symbol, TimeFrame.ONE_DAY);
      } catch (error) {
        this.logger.error(`Error generating daily signal for ${symbol}:`, error);
      }
    }
  }

  private async generateSignalForSymbol(symbol: string, timeFrame: TimeFrame): Promise<Signal | null> {
    // Check if we've already generated a recent signal for this symbol/timeframe
    const recentSignal = await this.getRecentSignal(symbol, timeFrame);
    if (recentSignal && this.isSignalTooRecent(recentSignal, timeFrame)) {
      return null;
    }

    // Build signal generation context
    const context = await this.buildSignalContext(symbol, timeFrame);
    if (!context) {
      this.logger.warn(`Insufficient data for ${symbol} ${timeFrame}`);
      return null;
    }

    // Generate predictions using multiple strategies
    const predictions = await this.generatePredictions(context);
    
    // Ensemble and validate predictions
    const finalPrediction = await this.ensemblePredictions(predictions, context);
    
    if (!finalPrediction || !this.meetsSignalCriteria(finalPrediction)) {
      return null;
    }

    // Create and save signal
    const signal = await this.createSignal(context, finalPrediction);
    
    // Perform real-time backtesting for validation
    const backtestScore = await this.quickBacktest(context, finalPrediction);
    signal.backtestMetrics = backtestScore;

    await this.signalRepository.save(signal);
    
    this.logger.log(
      `Generated ${signal.signalType} signal for ${symbol} ${timeFrame} ` +
      `(confidence: ${signal.confidence.toFixed(3)})`
    );

    return signal;
  }

  private async buildSignalContext(symbol: string, timeFrame: TimeFrame): Promise<SignalGenerationContext | null> {
    try {
      // Get market data
      const marketData = await this.marketDataService.getLatestMarketData(symbol, timeFrame, 200);
      if (marketData.length < 50) {
        return null;
      }

      // Get technical indicators
      const technicalIndicators = await this.technicalAnalysisService
        .calculateIndicators(symbol, marketData[0].timestamp, timeFrame);

      // Get recent news
      const newsData = await this.marketDataService.getLatestNews(symbol, 10);

      // Calculate sentiment from news
      const sentimentData = this.calculateNewsSentiment(newsData);

      // Get price patterns
      const pricePatterns = await this.technicalAnalysisService
        .detectPricePatterns(symbol, timeFrame);

      return {
        symbol,
        timeFrame,
        marketData,
        technicalIndicators,
        sentimentData,
        newsData,
        economicContext: {
          pricePatterns,
        },
      };
    } catch (error) {
      this.logger.error(`Error building context for ${symbol}:`, error);
      return null;
    }
  }

  private async generatePredictions(context: SignalGenerationContext): Promise<SignalPrediction[]> {
    const predictions: SignalPrediction[] = [];

    // Technical Analysis Strategy
    const technicalPrediction = await this.generateTechnicalSignal(context);
    if (technicalPrediction) {
      predictions.push(technicalPrediction);
    }

    // Machine Learning Strategy
    const mlPrediction = await this.generateMLSignal(context);
    if (mlPrediction) {
      predictions.push(mlPrediction);
    }

    // Sentiment Analysis Strategy
    const sentimentPrediction = await this.generateSentimentSignal(context);
    if (sentimentPrediction) {
      predictions.push(sentimentPrediction);
    }

    // Momentum Strategy
    const momentumPrediction = await this.generateMomentumSignal(context);
    if (momentumPrediction) {
      predictions.push(momentumPrediction);
    }

    // Mean Reversion Strategy
    const meanReversionPrediction = await this.generateMeanReversionSignal(context);
    if (meanReversionPrediction) {
      predictions.push(meanReversionPrediction);
    }

    return predictions;
  }

  private async generateTechnicalSignal(context: SignalGenerationContext): Promise<SignalPrediction | null> {
    const { technicalIndicators, marketData } = context;
    const currentPrice = marketData[0].close;
    
    if (!technicalIndicators.rsi || !technicalIndicators.macd || !technicalIndicators.bollinger) {
      return null;
    }

    let signalType = SignalType.HOLD;
    let confidence = 0.5;
    let analysis = 'Technical analysis: ';
    const features = { ...technicalIndicators };

    // RSI Analysis
    if (technicalIndicators.rsi < 30) {
      signalType = SignalType.BUY;
      confidence += 0.2;
      analysis += 'RSI oversold. ';
    } else if (technicalIndicators.rsi > 70) {
      signalType = SignalType.SELL;
      confidence += 0.2;
      analysis += 'RSI overbought. ';
    }

    // MACD Analysis
    const macd = technicalIndicators.macd;
    if (macd.macd > macd.signal && macd.histogram > 0) {
      if (signalType === SignalType.BUY || signalType === SignalType.HOLD) {
        signalType = SignalType.BUY;
        confidence += 0.15;
        analysis += 'MACD bullish crossover. ';
      }
    } else if (macd.macd < macd.signal && macd.histogram < 0) {
      if (signalType === SignalType.SELL || signalType === SignalType.HOLD) {
        signalType = SignalType.SELL;
        confidence += 0.15;
        analysis += 'MACD bearish crossover. ';
      }
    }

    // Bollinger Bands Analysis
    const bb = technicalIndicators.bollinger;
    if (currentPrice <= bb.lower) {
      if (signalType === SignalType.BUY || signalType === SignalType.HOLD) {
        signalType = SignalType.BUY;
        confidence += 0.1;
        analysis += 'Price at lower Bollinger Band. ';
      }
    } else if (currentPrice >= bb.upper) {
      if (signalType === SignalType.SELL || signalType === SignalType.HOLD) {
        signalType = SignalType.SELL;
        confidence += 0.1;
        analysis += 'Price at upper Bollinger Band. ';
      }
    }

    // Moving Average Analysis
    if (technicalIndicators.sma?.['20'] && technicalIndicators.sma?.['50']) {
      const sma20 = technicalIndicators.sma['20'];
      const sma50 = technicalIndicators.sma['50'];
      
      if (sma20 > sma50 && currentPrice > sma20) {
        if (signalType === SignalType.BUY || signalType === SignalType.HOLD) {
          confidence += 0.1;
          analysis += 'Price above rising SMA. ';
        }
      } else if (sma20 < sma50 && currentPrice < sma20) {
        if (signalType === SignalType.SELL || signalType === SignalType.HOLD) {
          confidence += 0.1;
          analysis += 'Price below falling SMA. ';
        }
      }
    }

    // Set targets and stop loss
    const atr = technicalIndicators.atr || (currentPrice * 0.02);
    let targetPrice: number | undefined;
    let stopLoss: number | undefined;
    let expectedReturn: number | undefined;

    if (signalType === SignalType.BUY) {
      targetPrice = currentPrice + (atr * 2);
      stopLoss = currentPrice - atr;
      expectedReturn = ((targetPrice - currentPrice) / currentPrice) * 100;
    } else if (signalType === SignalType.SELL) {
      targetPrice = currentPrice - (atr * 2);
      stopLoss = currentPrice + atr;
      expectedReturn = ((currentPrice - targetPrice) / currentPrice) * 100;
    }

    return {
      signalType,
      confidence: Math.min(confidence, 0.95),
      entryPrice: currentPrice,
      targetPrice,
      stopLoss,
      expectedReturn,
      analysis,
      features,
    };
  }

  private async generateMLSignal(context: SignalGenerationContext): Promise<SignalPrediction | null> {
    try {
      const mlPrediction = await this.mlModelService.predictSignal(context);
      return mlPrediction;
    } catch (error) {
      this.logger.error('ML signal generation error:', error);
      return null;
    }
  }

  private async generateSentimentSignal(context: SignalGenerationContext): Promise<SignalPrediction | null> {
    const { sentimentData, marketData } = context;
    if (!sentimentData) return null;

    const currentPrice = marketData[0].close;
    let signalType = SignalType.HOLD;
    let confidence = 0.5;

    const { overallSentiment, newsVolume, sentimentMomentum } = sentimentData;

    if (overallSentiment > 0.2 && newsVolume > 3) {
      signalType = SignalType.BUY;
      confidence += Math.min(overallSentiment * 0.3, 0.25);
    } else if (overallSentiment < -0.2 && newsVolume > 3) {
      signalType = SignalType.SELL;
      confidence += Math.min(Math.abs(overallSentiment) * 0.3, 0.25);
    }

    // Add momentum component
    if (sentimentMomentum > 0.1) {
      confidence += 0.1;
    }

    return {
      signalType,
      confidence: Math.min(confidence, 0.8), // Cap sentiment-based confidence
      entryPrice: currentPrice,
      analysis: `Sentiment analysis: Overall sentiment ${overallSentiment.toFixed(2)}, ` +
                `News volume: ${newsVolume}, Momentum: ${sentimentMomentum.toFixed(2)}`,
      features: { sentimentData },
    };
  }

  private async generateMomentumSignal(context: SignalGenerationContext): Promise<SignalPrediction | null> {
    const { marketData, technicalIndicators } = context;
    if (marketData.length < 20) return null;

    const currentPrice = marketData[0].close;
    const prices = marketData.slice(0, 20).map(d => d.close);
    
    // Calculate momentum indicators
    const momentum1d = (prices[0] - prices[1]) / prices[1];
    const momentum5d = (prices[0] - prices[4]) / prices[4];
    const momentum20d = (prices[0] - prices[19]) / prices[19];
    
    // Volume momentum
    const volumes = marketData.slice(0, 10).map(d => d.volume);
    const avgVolume = volumes.reduce((a, b) => a + b) / volumes.length;
    const volumeRatio = volumes[0] / avgVolume;

    let signalType = SignalType.HOLD;
    let confidence = 0.5;
    let analysis = 'Momentum analysis: ';

    // Strong momentum signals
    if (momentum1d > 0.02 && momentum5d > 0.05 && volumeRatio > 1.5) {
      signalType = SignalType.BUY;
      confidence += 0.25;
      analysis += 'Strong upward momentum with volume confirmation. ';
    } else if (momentum1d < -0.02 && momentum5d < -0.05 && volumeRatio > 1.5) {
      signalType = SignalType.SELL;
      confidence += 0.25;
      analysis += 'Strong downward momentum with volume confirmation. ';
    }

    // RSI momentum confirmation
    if (technicalIndicators.rsi) {
      const rsi = technicalIndicators.rsi;
      if (signalType === SignalType.BUY && rsi > 50 && rsi < 80) {
        confidence += 0.1;
        analysis += 'RSI supports momentum. ';
      } else if (signalType === SignalType.SELL && rsi < 50 && rsi > 20) {
        confidence += 0.1;
        analysis += 'RSI supports momentum. ';
      }
    }

    const atr = technicalIndicators.atr || (currentPrice * 0.02);
    let targetPrice: number | undefined;
    let stopLoss: number | undefined;

    if (signalType === SignalType.BUY) {
      targetPrice = currentPrice * (1 + momentum5d * 2);
      stopLoss = currentPrice - (atr * 1.5);
    } else if (signalType === SignalType.SELL) {
      targetPrice = currentPrice * (1 + momentum5d * 2);
      stopLoss = currentPrice + (atr * 1.5);
    }

    return {
      signalType,
      confidence: Math.min(confidence, 0.9),
      entryPrice: currentPrice,
      targetPrice,
      stopLoss,
      expectedReturn: targetPrice ? ((targetPrice - currentPrice) / currentPrice) * 100 : undefined,
      analysis,
      features: {
        momentum1d,
        momentum5d,
        momentum20d,
        volumeRatio,
      },
    };
  }

  private async generateMeanReversionSignal(context: SignalGenerationContext): Promise<SignalPrediction | null> {
    const { marketData, technicalIndicators } = context;
    if (marketData.length < 20) return null;

    const currentPrice = marketData[0].close;
    const bb = technicalIndicators.bollinger;
    const rsi = technicalIndicators.rsi;
    
    if (!bb || !rsi) return null;

    let signalType = SignalType.HOLD;
    let confidence = 0.5;
    let analysis = 'Mean reversion analysis: ';

    // Bollinger Band mean reversion
    const bbPosition = (currentPrice - bb.lower) / (bb.upper - bb.lower);
    
    if (bbPosition < 0.1 && rsi < 35) {
      // Price near lower band and RSI oversold
      signalType = SignalType.BUY;
      confidence += 0.3;
      analysis += 'Price oversold, expecting reversion to mean. ';
    } else if (bbPosition > 0.9 && rsi > 65) {
      // Price near upper band and RSI overbought
      signalType = SignalType.SELL;
      confidence += 0.3;
      analysis += 'Price overbought, expecting reversion to mean. ';
    }

    // Add stochastic confirmation
    if (technicalIndicators.stochastic) {
      const stoch = technicalIndicators.stochastic;
      if (signalType === SignalType.BUY && stoch.k < 25 && stoch.d < 25) {
        confidence += 0.15;
        analysis += 'Stochastic confirms oversold condition. ';
      } else if (signalType === SignalType.SELL && stoch.k > 75 && stoch.d > 75) {
        confidence += 0.15;
        analysis += 'Stochastic confirms overbought condition. ';
      }
    }

    return {
      signalType,
      confidence: Math.min(confidence, 0.85),
      entryPrice: currentPrice,
      targetPrice: bb.middle, // Target is mean reversion to middle band
      stopLoss: signalType === SignalType.BUY ? 
                 bb.lower * 0.98 : 
                 bb.upper * 1.02,
      expectedReturn: ((bb.middle - currentPrice) / currentPrice) * 100,
      analysis,
      features: {
        bollingerPosition: bbPosition,
        rsi,
        stochastic: technicalIndicators.stochastic,
      },
    };
  }

  private async ensemblePredictions(
    predictions: SignalPrediction[],
    context: SignalGenerationContext
  ): Promise<SignalPrediction | null> {
    if (predictions.length === 0) return null;

    // Weight predictions by confidence and strategy performance
    const strategyWeights = {
      technical: 0.25,
      ml: 0.35,
      sentiment: 0.15,
      momentum: 0.15,
      meanReversion: 0.10,
    };

    // Calculate weighted ensemble
    let buyScore = 0;
    let sellScore = 0;
    let holdScore = 0;
    let totalWeight = 0;
    let combinedAnalysis = 'Ensemble signal: ';
    const combinedFeatures: any = {};

    predictions.forEach((prediction, index) => {
      const strategyNames = ['technical', 'ml', 'sentiment', 'momentum', 'meanReversion'];
      const strategyName = strategyNames[index % strategyNames.length];
      const weight = strategyWeights[strategyName] * prediction.confidence;
      
      totalWeight += weight;

      switch (prediction.signalType) {
        case SignalType.BUY:
        case SignalType.STRONG_BUY:
          buyScore += weight;
          break;
        case SignalType.SELL:
        case SignalType.STRONG_SELL:
          sellScore += weight;
          break;
        default:
          holdScore += weight;
      }

      combinedFeatures[strategyName] = prediction.features;
      combinedAnalysis += `${strategyName}: ${prediction.signalType} (${prediction.confidence.toFixed(2)}); `;
    });

    // Determine final signal
    let finalSignalType: SignalType;
    let finalConfidence: number;

    if (buyScore > sellScore && buyScore > holdScore) {
      finalSignalType = buyScore > 0.3 ? SignalType.STRONG_BUY : SignalType.BUY;
      finalConfidence = buyScore / totalWeight;
    } else if (sellScore > buyScore && sellScore > holdScore) {
      finalSignalType = sellScore > 0.3 ? SignalType.STRONG_SELL : SignalType.SELL;
      finalConfidence = sellScore / totalWeight;
    } else {
      finalSignalType = SignalType.HOLD;
      finalConfidence = holdScore / totalWeight;
    }

    // Calculate average targets
    const validPredictions = predictions.filter(p => p.targetPrice && p.stopLoss);
    if (validPredictions.length === 0) return null;

    const avgTargetPrice = validPredictions.reduce((sum, p) => sum + (p.targetPrice || 0), 0) / validPredictions.length;
    const avgStopLoss = validPredictions.reduce((sum, p) => sum + (p.stopLoss || 0), 0) / validPredictions.length;
    const currentPrice = context.marketData[0].close;

    return {
      signalType: finalSignalType,
      confidence: finalConfidence,
      entryPrice: currentPrice,
      targetPrice: avgTargetPrice,
      stopLoss: avgStopLoss,
      expectedReturn: ((avgTargetPrice - currentPrice) / currentPrice) * 100,
      analysis: combinedAnalysis,
      features: combinedFeatures,
    };
  }

  private calculateNewsSentiment(newsData: MarketNews[]): any {
    if (!newsData || newsData.length === 0) {
      return null;
    }

    const sentimentScores = newsData
      .map(news => news.sentimentScore)
      .filter(score => score !== null && score !== undefined);

    if (sentimentScores.length === 0) {
      return null;
    }

    const overallSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    const newsVolume = newsData.length;
    
    // Calculate sentiment momentum (recent vs older news)
    const recentNews = newsData.slice(0, Math.floor(newsData.length / 2));
    const olderNews = newsData.slice(Math.floor(newsData.length / 2));
    
    const recentSentiment = recentNews
      .map(n => n.sentimentScore)
      .filter(s => s !== null && s !== undefined)
      .reduce((sum, score) => sum + score, 0) / recentNews.length || 0;
    
    const olderSentiment = olderNews
      .map(n => n.sentimentScore)
      .filter(s => s !== null && s !== undefined)
      .reduce((sum, score) => sum + score, 0) / olderNews.length || 0;

    const sentimentMomentum = recentSentiment - olderSentiment;

    return {
      overallSentiment,
      newsVolume,
      sentimentMomentum,
      recentSentiment,
      olderSentiment,
    };
  }

  private meetsSignalCriteria(prediction: SignalPrediction): boolean {
    const confidenceThreshold = this.configService.get('signals.confidenceThreshold') || 0.65;
    
    return (
      prediction.confidence >= confidenceThreshold &&
      prediction.signalType !== SignalType.HOLD &&
      prediction.targetPrice !== undefined &&
      prediction.stopLoss !== undefined &&
      Math.abs(prediction.expectedReturn || 0) >= 1.0 // At least 1% expected return
    );
  }

  private async createSignal(
    context: SignalGenerationContext,
    prediction: SignalPrediction
  ): Promise<Signal> {
    const signal = new Signal();
    
    signal.symbol = context.symbol;
    signal.signalType = prediction.signalType;
    signal.timeFrame = context.timeFrame;
    signal.confidence = prediction.confidence;
    signal.entryPrice = prediction.entryPrice;
    signal.targetPrice = prediction.targetPrice;
    signal.stopLoss = prediction.stopLoss;
    signal.expectedReturn = prediction.expectedReturn;
    signal.analysis = prediction.analysis;
    signal.status = SignalStatus.GENERATED;
    
    // Set expiration based on timeframe
    const expirationMinutes = this.getExpirationMinutes(context.timeFrame);
    signal.expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    
    // Risk-reward ratio
    if (signal.targetPrice && signal.stopLoss) {
      const potential = Math.abs(signal.targetPrice - signal.entryPrice);
      const risk = Math.abs(signal.entryPrice - signal.stopLoss);
      signal.riskRewardRatio = potential / risk;
    }

    // Technical indicators snapshot
    signal.technicalIndicators = context.technicalIndicators;
    
    // Sentiment data
    signal.sentimentData = context.sentimentData;

    // ML features
    signal.mlFeatures = prediction.features;

    return signal;
  }

  private getExpirationMinutes(timeFrame: TimeFrame): number {
    switch (timeFrame) {
      case TimeFrame.ONE_MIN:
      case TimeFrame.FIVE_MIN:
        return 30; // 30 minutes
      case TimeFrame.FIFTEEN_MIN:
        return 60; // 1 hour
      case TimeFrame.THIRTY_MIN:
        return 120; // 2 hours
      case TimeFrame.ONE_HOUR:
        return 240; // 4 hours
      case TimeFrame.FOUR_HOUR:
        return 720; // 12 hours
      case TimeFrame.ONE_DAY:
        return 1440; // 24 hours
      case TimeFrame.ONE_WEEK:
        return 7200; // 5 days
      default:
        return 120; // Default 2 hours
    }
  }

  private async getRecentSignal(symbol: string, timeFrame: TimeFrame): Promise<Signal | null> {
    return this.signalRepository.findOne({
      where: {
        symbol,
        timeFrame,
        status: SignalStatus.GENERATED,
      },
      order: { createdAt: 'DESC' },
    });
  }

  private isSignalTooRecent(signal: Signal, timeFrame: TimeFrame): boolean {
    const now = new Date();
    const signalAge = now.getTime() - signal.createdAt.getTime();
    
    const cooldownPeriods = {
      [TimeFrame.ONE_MIN]: 2 * 60 * 1000, // 2 minutes
      [TimeFrame.FIVE_MIN]: 10 * 60 * 1000, // 10 minutes
      [TimeFrame.FIFTEEN_MIN]: 30 * 60 * 1000, // 30 minutes
      [TimeFrame.THIRTY_MIN]: 60 * 60 * 1000, // 1 hour
      [TimeFrame.ONE_HOUR]: 2 * 60 * 60 * 1000, // 2 hours
      [TimeFrame.FOUR_HOUR]: 8 * 60 * 60 * 1000, // 8 hours
      [TimeFrame.ONE_DAY]: 12 * 60 * 60 * 1000, // 12 hours
      [TimeFrame.ONE_WEEK]: 24 * 60 * 60 * 1000, // 24 hours
    };

    const cooldown = cooldownPeriods[timeFrame] || 60 * 60 * 1000;
    return signalAge < cooldown;
  }

  private async quickBacktest(
    context: SignalGenerationContext,
    prediction: SignalPrediction
  ): Promise<any> {
    try {
      // Perform quick backtest on recent data
      const backtestResults = await this.backtestService.quickBacktest(
        context.symbol,
        context.timeFrame,
        prediction.signalType,
        7 // 7 days
      );
      
      return {
        winRate: backtestResults.winRate,
        avgReturn: backtestResults.avgReturn,
        sharpeRatio: backtestResults.sharpeRatio,
        maxDrawdown: backtestResults.maxDrawdown,
        totalTrades: backtestResults.totalTrades,
      };
    } catch (error) {
      this.logger.error('Quick backtest error:', error);
      return null;
    }
  }

  // API methods for external access
  async getActiveSignals(
    symbol?: string,
    timeFrame?: TimeFrame,
    limit: number = 50
  ): Promise<Signal[]> {
    const where: any = {
      status: SignalStatus.GENERATED,
    };
    
    if (symbol) where.symbol = symbol;
    if (timeFrame) where.timeFrame = timeFrame;

    return this.signalRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async updateSignalStatus(signalId: string, status: SignalStatus): Promise<Signal> {
    const signal = await this.signalRepository.findOne({ where: { id: signalId } });
    if (!signal) {
      throw new Error('Signal not found');
    }

    signal.status = status;
    if (status === SignalStatus.EXECUTED) {
      signal.executedAt = new Date();
    }

    return this.signalRepository.save(signal);
  }

  async getSignalPerformanceMetrics(): Promise<any> {
    const totalSignals = await this.signalRepository.count();
    const executedSignals = await this.signalRepository.count({
      where: { status: SignalStatus.EXECUTED },
    });

    const profitableSignals = await this.signalRepository.count({
      where: {
        status: SignalStatus.EXECUTED,
        actualReturn: { gte: 0 } as any,
      },
    });

    const avgReturn = await this.signalRepository
      .createQueryBuilder('signal')
      .select('AVG(signal.actualReturn)', 'avgReturn')
      .where('signal.status = :status', { status: SignalStatus.EXECUTED })
      .getRawOne();

    return {
      totalSignals,
      executedSignals,
      winRate: executedSignals > 0 ? (profitableSignals / executedSignals) * 100 : 0,
      averageReturn: parseFloat(avgReturn?.avgReturn) || 0,
      executionRate: totalSignals > 0 ? (executedSignals / totalSignals) * 100 : 0,
    };
  }
}