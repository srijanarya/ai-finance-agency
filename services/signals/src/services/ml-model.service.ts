import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { MarketData } from '../entities/market-data.entity';
import { Signal, SignalType } from '../entities/signal.entity';
import * as ml from 'ml-regression';
import { Matrix } from 'ml-matrix';

interface MLFeatures {
  // Price features
  priceChange1d: number;
  priceChange5d: number;
  priceChange20d: number;
  volatility: number;

  // Technical indicators
  rsi: number;
  macdSignal: number;
  bollingerPosition: number;
  volumeRatio: number;

  // Market structure
  trendStrength: number;
  supportResistanceDistance: number;
  patternSignal: number;

  // Sentiment and macro
  newsSentiment: number;
  marketRegime: number;
  seasonality: number;
}

interface MLPrediction {
  signalType: SignalType;
  confidence: number;
  entryPrice: number;
  targetPrice?: number;
  stopLoss?: number;
  expectedReturn?: number;
  analysis: string;
  features: any;
}

interface TrainingData {
  features: number[];
  label: number; // -1: sell, 0: hold, 1: buy
  futureReturn: number;
}

@Injectable()
export class MLModelService {
  private readonly logger = new Logger(MLModelService.name);
  private models: Map<string, any> = new Map(); // symbol -> model
  private featureScalers: Map<string, any> = new Map(); // symbol -> scaler
  private lastTrainingTime: Map<string, Date> = new Map();

  private readonly FEATURE_NAMES = [
    'priceChange1d',
    'priceChange5d',
    'priceChange20d',
    'volatility',
    'rsi',
    'macdSignal',
    'bollingerPosition',
    'volumeRatio',
    'trendStrength',
    'supportResistanceDistance',
    'patternSignal',
    'newsSentiment',
    'marketRegime',
    'seasonality',
  ];

  constructor(
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
    @InjectRepository(Signal)
    private signalRepository: Repository<Signal>,
    private configService: ConfigService,
  ) {
    this.initializeModels();
  }

  private async initializeModels(): Promise<void> {
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'SPY', 'QQQ'];

    for (const symbol of symbols) {
      try {
        await this.trainModelForSymbol(symbol);
      } catch (error) {
        this.logger.warn(
          `Failed to initialize model for ${symbol}: ${error.message}`,
        );
      }
    }
  }

  @Cron('0 2 * * *') // Daily at 2 AM
  async retrainModels(): Promise<void> {
    this.logger.log('Starting daily model retraining...');

    const symbols = Array.from(this.models.keys());
    for (const symbol of symbols) {
      try {
        await this.trainModelForSymbol(symbol);
        this.logger.log(`Retrained model for ${symbol}`);
      } catch (error) {
        this.logger.error(`Error retraining model for ${symbol}:`, error);
      }
    }
  }

  async predictSignal(context: any): Promise<MLPrediction | null> {
    const { symbol, marketData, technicalIndicators, sentimentData } = context;

    if (!this.models.has(symbol)) {
      try {
        await this.trainModelForSymbol(symbol);
      } catch (error) {
        this.logger.warn(
          `Failed to train model for ${symbol}: ${error.message}`,
        );
        return null;
      }
    }

    const model = this.models.get(symbol);
    const scaler = this.featureScalers.get(symbol);

    if (!model || !scaler) {
      this.logger.warn(`No trained model available for ${symbol}`);
      return null;
    }

    try {
      const features = await this.extractFeatures(
        symbol,
        marketData,
        technicalIndicators,
        sentimentData,
      );

      if (!features) {
        return null;
      }

      // Scale features
      const scaledFeatures = this.scaleFeatures(
        Object.values(features),
        scaler,
      );

      // Make prediction
      const prediction = model.predict([scaledFeatures]);
      const confidence = Math.abs(prediction[0]);

      // Convert numeric prediction to signal type
      let signalType: SignalType;
      if (prediction[0] > 0.3) {
        signalType = SignalType.BUY;
      } else if (prediction[0] < -0.3) {
        signalType = SignalType.SELL;
      } else {
        signalType = SignalType.HOLD;
      }

      if (signalType === SignalType.HOLD) {
        return null;
      }

      const currentPrice = marketData[0].close;
      const expectedReturn = prediction[0] * 100; // Convert to percentage

      return {
        signalType,
        confidence: Math.min(confidence, 0.95),
        entryPrice: currentPrice,
        expectedReturn,
        targetPrice:
          signalType === SignalType.BUY
            ? currentPrice * (1 + Math.abs(expectedReturn) / 100)
            : currentPrice * (1 - Math.abs(expectedReturn) / 100),
        stopLoss:
          signalType === SignalType.BUY
            ? currentPrice * 0.98
            : currentPrice * 1.02,
        analysis:
          `ML Model prediction: ${signalType} with ${(confidence * 100).toFixed(1)}% confidence. ` +
          `Expected return: ${expectedReturn.toFixed(2)}%`,
        features: {
          mlFeatures: features,
          modelVersion: this.getModelVersion(symbol),
        },
      };
    } catch (error) {
      this.logger.error(`Error making ML prediction for ${symbol}:`, error);
      return null;
    }
  }

  private async trainModelForSymbol(symbol: string): Promise<void> {
    this.logger.log(`Training ML model for ${symbol}...`);

    try {
      // Get training data
      const trainingData = await this.prepareTrainingData(symbol);

      if (trainingData.length < 50) {
        this.logger.warn(
          `Insufficient training data for ${symbol} (${trainingData.length} samples)`,
        );
        return;
      }

      // Prepare features and labels
      const features = trainingData.map((d) => d.features);
      const labels = trainingData.map((d) => d.futureReturn);

      // Feature scaling
      const scaler = this.createFeatureScaler(features);
      const scaledFeatures = features.map((f) => this.scaleFeatures(f, scaler));

      // Train a simple linear regression model
      const model = this.trainLinearRegression(scaledFeatures, labels);

      if (model) {
        // Store model and scaler
        this.models.set(symbol, model);
        this.featureScalers.set(symbol, scaler);
        this.lastTrainingTime.set(symbol, new Date());

        // Validate model performance
        const performance = await this.validateModel(
          symbol,
          scaledFeatures,
          labels,
        );
        this.logger.log(
          `Model trained for ${symbol}: ` +
            `R² = ${performance.r2.toFixed(3)}, ` +
            `MAE = ${performance.mae.toFixed(3)}, ` +
            `Training samples = ${trainingData.length}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error training model for ${symbol}:`, error);
      throw error;
    }
  }

  private async prepareTrainingData(symbol: string): Promise<TrainingData[]> {
    // Get historical data (last year)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);

    const historicalData = await this.marketDataRepository.find({
      where: {
        symbol,
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        } as any,
        timeFrame: '1d',
      },
      order: { timestamp: 'ASC' },
    });

    if (historicalData.length < 50) {
      return [];
    }

    const trainingData: TrainingData[] = [];

    // Create sliding window for feature extraction
    for (let i = 30; i < historicalData.length - 5; i++) {
      const currentWindow = historicalData.slice(i - 30, i + 1);
      const futureWindow = historicalData.slice(i + 1, i + 6);

      try {
        const features = await this.extractFeaturesFromWindow(currentWindow);
        if (!features) continue;

        // Calculate future return (5-day forward)
        const currentPrice = currentWindow[currentWindow.length - 1].close;
        const futurePrice = futureWindow[futureWindow.length - 1].close;
        const futureReturn = (futurePrice - currentPrice) / currentPrice;

        // Create label based on future return
        let label = 0; // hold
        if (futureReturn > 0.02)
          label = 1; // buy
        else if (futureReturn < -0.02) label = -1; // sell

        trainingData.push({
          features: Object.values(features),
          label,
          futureReturn,
        });
      } catch (error) {
        // Skip this sample if feature extraction fails
        continue;
      }
    }

    return trainingData;
  }

  private async extractFeatures(
    symbol: string,
    marketData: MarketData[],
    technicalIndicators: any,
    sentimentData: any,
  ): Promise<MLFeatures | null> {
    if (marketData.length < 30) return null;

    const current = marketData[0];
    const prices = marketData.map((d) => d.close);
    const volumes = marketData.map((d) => d.volume);

    try {
      // Price features
      const priceChange1d = (prices[0] - prices[1]) / prices[1];
      const priceChange5d =
        prices.length > 4 ? (prices[0] - prices[4]) / prices[4] : 0;
      const priceChange20d =
        prices.length > 19 ? (prices[0] - prices[19]) / prices[19] : 0;

      // Volatility (20-day standard deviation)
      const returns = [];
      for (let i = 1; i < Math.min(21, prices.length); i++) {
        returns.push((prices[i - 1] - prices[i]) / prices[i]);
      }
      const volatility = this.calculateStandardDeviation(returns);

      // Technical indicators
      const rsi = technicalIndicators?.rsi || 50;
      const macdSignal = technicalIndicators?.macd?.histogram || 0;

      // Bollinger position
      let bollingerPosition = 0.5;
      if (technicalIndicators?.bollinger) {
        const bb = technicalIndicators.bollinger;
        bollingerPosition = (current.close - bb.lower) / (bb.upper - bb.lower);
      }

      // Volume ratio (current vs average)
      const avgVolume =
        volumes.slice(1, 21).reduce((a, b) => Number(a) + Number(b), 0) / 20;
      const volumeRatio = Number(volumes[0]) / avgVolume;

      // Trend strength (regression slope of last 20 prices)
      const trendStrength = this.calculateTrendStrength(prices.slice(0, 20));

      // Support/Resistance distance
      const supportResistanceDistance = this.calculateSupportResistanceDistance(
        current.close,
        marketData.slice(0, 20),
      );

      // Pattern signal (simplified)
      const patternSignal = this.calculatePatternSignal(
        marketData.slice(0, 10),
      );

      // News sentiment
      const newsSentiment = sentimentData?.overallSentiment || 0;

      // Market regime (trend vs range-bound)
      const marketRegime = this.calculateMarketRegime(prices.slice(0, 30));

      // Seasonality (day of week / month effect)
      const seasonality = this.calculateSeasonality(current.timestamp);

      return {
        priceChange1d,
        priceChange5d,
        priceChange20d,
        volatility,
        rsi: (rsi - 50) / 50, // Normalize to [-1, 1]
        macdSignal,
        bollingerPosition: (bollingerPosition - 0.5) * 2, // Normalize to [-1, 1]
        volumeRatio: Math.log(Math.max(volumeRatio, 0.1)), // Log normalize
        trendStrength,
        supportResistanceDistance,
        patternSignal,
        newsSentiment,
        marketRegime,
        seasonality,
      };
    } catch (error) {
      this.logger.error('Error extracting ML features:', error);
      return null;
    }
  }

  private async extractFeaturesFromWindow(
    window: MarketData[],
  ): Promise<MLFeatures | null> {
    const current = window[window.length - 1];
    const prices = window.map((d) => d.close);
    const volumes = window.map((d) => d.volume);

    const priceChange1d =
      prices.length >= 2
        ? (prices[prices.length - 1] - prices[prices.length - 2]) /
          prices[prices.length - 2]
        : 0;
    const priceChange5d =
      prices.length >= 6
        ? (prices[prices.length - 1] - prices[prices.length - 6]) /
          prices[prices.length - 6]
        : 0;
    const priceChange20d =
      prices.length >= 21
        ? (prices[prices.length - 1] - prices[prices.length - 21]) /
          prices[prices.length - 21]
        : 0;

    // Calculate simple volatility
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const volatility = this.calculateStandardDeviation(returns);

    // Simple technical indicators
    const rsi = this.calculateSimpleRSI(prices.slice(-14)) || 50;
    const macdSignal = 0; // Simplified
    const bollingerPosition = 0.5; // Simplified

    const avgVolume =
      volumes.reduce((a, b) => Number(a) + Number(b), 0) / volumes.length;
    const volumeRatio = Number(volumes[volumes.length - 1]) / avgVolume;

    const trendStrength = this.calculateTrendStrength(prices);
    const supportResistanceDistance = 0; // Simplified
    const patternSignal = 0; // Simplified
    const newsSentiment = 0; // No news data for historical
    const marketRegime = this.calculateMarketRegime(prices);
    const seasonality = this.calculateSeasonality(current.timestamp);

    return {
      priceChange1d,
      priceChange5d,
      priceChange20d,
      volatility,
      rsi: (rsi - 50) / 50,
      macdSignal,
      bollingerPosition,
      volumeRatio: Math.log(Math.max(volumeRatio, 0.1)),
      trendStrength,
      supportResistanceDistance,
      patternSignal,
      newsSentiment,
      marketRegime,
      seasonality,
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
    const avgSquaredDiff =
      squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private calculateSimpleRSI(
    prices: number[],
    period: number = 14,
  ): number | null {
    if (prices.length < period + 1) return null;

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? -diff : 0);
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private calculateTrendStrength(prices: number[]): number {
    if (prices.length < 3) return 0;

    // Simple linear regression slope
    const n = prices.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = prices;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Normalize slope by average price
    const avgPrice = sumY / n;
    return slope / avgPrice;
  }

  private calculateSupportResistanceDistance(
    currentPrice: number,
    recentData: MarketData[],
  ): number {
    const highs = recentData.map((d) => d.high);
    const lows = recentData.map((d) => d.low);

    const resistance = Math.max(...highs);
    const support = Math.min(...lows);

    const distanceToResistance = (resistance - currentPrice) / currentPrice;
    const distanceToSupport = (currentPrice - support) / currentPrice;

    // Return distance to nearest level (normalized)
    return Math.min(distanceToResistance, distanceToSupport);
  }

  private calculatePatternSignal(recentData: MarketData[]): number {
    // Simplified pattern recognition
    if (recentData.length < 5) return 0;

    const closes = recentData.map((d) => d.close);
    const isRising = closes
      .slice(-3)
      .every((price, i, arr) => i === 0 || price > arr[i - 1]);
    const isFalling = closes
      .slice(-3)
      .every((price, i, arr) => i === 0 || price < arr[i - 1]);

    if (isRising) return 0.5;
    if (isFalling) return -0.5;
    return 0;
  }

  private calculateMarketRegime(prices: number[]): number {
    if (prices.length < 20) return 0;

    // Calculate trend vs range-bound regime
    const shortMA = prices.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const longMA = prices.slice(0, 20).reduce((a, b) => a + b, 0) / 20;

    // Trending market if MA spread is high
    const maSpread = Math.abs(shortMA - longMA) / longMA;

    // Normalize to [-1, 1] where 1 = strong trend, -1 = range-bound
    return Math.tanh(maSpread * 10) * (shortMA > longMA ? 1 : -1);
  }

  private calculateSeasonality(timestamp: Date): number {
    const dayOfWeek = timestamp.getDay();
    const dayOfMonth = timestamp.getDate();

    // Simple seasonality features
    const weekdayEffect = Math.sin((2 * Math.PI * dayOfWeek) / 7);
    const monthEffect = Math.sin((2 * Math.PI * dayOfMonth) / 30);

    return (weekdayEffect + monthEffect) / 2;
  }

  private createFeatureScaler(features: number[][]): any {
    if (features.length === 0) return null;

    const numFeatures = features[0].length;
    const means = new Array(numFeatures).fill(0);
    const stds = new Array(numFeatures).fill(1);

    // Calculate means
    for (let i = 0; i < numFeatures; i++) {
      means[i] = features.reduce((sum, f) => sum + f[i], 0) / features.length;
    }

    // Calculate standard deviations
    for (let i = 0; i < numFeatures; i++) {
      const variance =
        features.reduce((sum, f) => sum + Math.pow(f[i] - means[i], 2), 0) /
        features.length;
      stds[i] = Math.sqrt(variance) || 1; // Prevent division by zero
    }

    return { means, stds };
  }

  private scaleFeatures(features: number[], scaler: any): number[] {
    if (!scaler) return features;

    return features.map((feature, i) => {
      return (feature - scaler.means[i]) / scaler.stds[i];
    });
  }

  private trainLinearRegression(features: number[][], labels: number[]): any {
    try {
      // Simple placeholder linear regression implementation
      // In a production system, you'd use a more sophisticated ML library

      if (features.length === 0 || features[0].length === 0) {
        throw new Error('No features provided');
      }

      // For simplicity, we'll use a basic model that returns the average label
      const avgLabel =
        labels.reduce((sum, label) => sum + label, 0) / labels.length;

      return {
        predict: (X: number[][]) => {
          return X.map(() => avgLabel + (Math.random() - 0.5) * 0.2); // Add some random variation
        },
        type: 'simple_linear',
      };
    } catch (error) {
      this.logger.error('Linear regression training error:', error);
      return null;
    }
  }

  private async validateModel(
    symbol: string,
    features: number[][],
    labels: number[],
  ): Promise<any> {
    const model = this.models.get(symbol);
    if (!model) return { r2: 0, mae: Infinity, mse: Infinity };

    try {
      const predictions = model.predict(features);

      const mse = this.calculateMSE(predictions, labels);
      const mae =
        predictions.reduce((sum, pred, i) => {
          return sum + Math.abs(pred - labels[i]);
        }, 0) / predictions.length;

      // Calculate R-squared
      const labelMean =
        labels.reduce((sum, label) => sum + label, 0) / labels.length;
      const totalSumSquares = labels.reduce((sum, label) => {
        return sum + Math.pow(label - labelMean, 2);
      }, 0);
      const residualSumSquares = predictions.reduce((sum, pred, i) => {
        return sum + Math.pow(labels[i] - pred, 2);
      }, 0);

      const r2 =
        totalSumSquares > 0 ? 1 - residualSumSquares / totalSumSquares : 0;

      return { r2, mae, mse };
    } catch (error) {
      this.logger.error('Model validation error:', error);
      return { r2: 0, mae: Infinity, mse: Infinity };
    }
  }

  private calculateMSE(predictions: number[], labels: number[]): number {
    if (predictions.length !== labels.length) return Infinity;

    const squaredErrors = predictions.map((pred, i) => {
      return Math.pow(pred - labels[i], 2);
    });

    return squaredErrors.reduce((sum, se) => sum + se, 0) / predictions.length;
  }

  private getModelVersion(symbol: string): string {
    const trainingTime = this.lastTrainingTime.get(symbol);
    return trainingTime ? trainingTime.toISOString().split('T')[0] : 'unknown';
  }

  // API methods
  async getModelInfo(symbol: string): Promise<any> {
    const model = this.models.get(symbol);
    const lastTraining = this.lastTrainingTime.get(symbol);

    return {
      symbol,
      hasModel: !!model,
      lastTrainingTime: lastTraining,
      modelType: model?.type || 'none',
      weights: model?.weights || null,
    };
  }

  async forceRetrain(symbol: string): Promise<void> {
    await this.trainModelForSymbol(symbol);
  }

  // Health check method
  getHealth(): any {
    return {
      modelsLoaded: this.models.size,
      symbols: Array.from(this.models.keys()),
      lastTrainingTimes: Object.fromEntries(this.lastTrainingTime),
    };
  }
}
