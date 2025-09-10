import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SignalGeneratorService } from '../services/signal-generator.service';
import { MarketDataService } from '../services/market-data.service';
import { TechnicalAnalysisService } from '../services/technical-analysis.service';
import { MLModelService } from '../services/ml-model.service';
import { BacktestService } from '../services/backtest.service';
import { SignalType, TimeFrame, SignalStatus } from '../entities/signal.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// DTOs for request validation
export class SignalQueryDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsEnum(TimeFrame)
  timeFrame?: TimeFrame;

  @IsOptional()
  @IsEnum(SignalType)
  signalType?: SignalType;

  @IsOptional()
  @IsEnum(SignalStatus)
  status?: SignalStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;
}

export class UpdateSignalStatusDto {
  @IsEnum(SignalStatus)
  status: SignalStatus;

  @IsOptional()
  @IsNumber()
  executionPrice?: number;

  @IsOptional()
  @IsNumber()
  actualReturn?: number;
}

export class BacktestRequestDto {
  @IsString()
  symbol: string;

  @IsString()
  strategyId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  initialCapital?: number = 100000;
}

export class MarketDataQueryDto {
  @IsOptional()
  @IsString()
  timeFrame?: string = '1min';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;
}

@Controller('signals')
export class SignalsController {
  private readonly logger = new Logger(SignalsController.name);

  constructor(
    private readonly signalGeneratorService: SignalGeneratorService,
    private readonly marketDataService: MarketDataService,
    private readonly technicalAnalysisService: TechnicalAnalysisService,
    private readonly mlModelService: MLModelService,
    private readonly backtestService: BacktestService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSignals(@Query(ValidationPipe) query: SignalQueryDto) {
    try {
      const {
        symbol,
        timeFrame,
        signalType,
        status = SignalStatus.GENERATED,
        limit = 50,
        page = 1,
      } = query;

      this.logger.log(
        `Fetching signals with filters: ${JSON.stringify(query)}`,
      );

      const signals = await this.signalGeneratorService.getActiveSignals(
        symbol,
        timeFrame,
        limit,
      );

      // Apply additional filters
      let filteredSignals = signals;

      if (signalType) {
        filteredSignals = filteredSignals.filter(
          (s) => s.signalType === signalType,
        );
      }

      if (status) {
        filteredSignals = filteredSignals.filter((s) => s.status === status);
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const paginatedSignals = filteredSignals.slice(
        startIndex,
        startIndex + limit,
      );

      return {
        status: 'success',
        data: {
          signals: paginatedSignals,
          pagination: {
            total: filteredSignals.length,
            page,
            limit,
            totalPages: Math.ceil(filteredSignals.length / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error fetching signals:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch signals',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActiveSignals(@Query(ValidationPipe) query: SignalQueryDto) {
    try {
      this.logger.log(`Fetching active signals for symbol: ${query.symbol}`);

      const signals = await this.signalGeneratorService.getActiveSignals(
        query.symbol,
        query.timeFrame,
        query.limit || 20,
      );

      // Filter only active signals (not expired)
      const activeSignals = signals.filter((signal) => {
        const isActive = signal.status === SignalStatus.GENERATED;
        const isNotExpired = !signal.expiresAt || new Date() < signal.expiresAt;
        return isActive && isNotExpired;
      });

      return {
        status: 'success',
        data: {
          signals: activeSignals,
          count: activeSignals.length,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching active signals:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch active signals',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('performance')
  @UseGuards(JwtAuthGuard)
  async getSignalPerformance() {
    try {
      this.logger.log('Fetching signal performance metrics');

      const metrics =
        await this.signalGeneratorService.getSignalPerformanceMetrics();

      return {
        status: 'success',
        data: {
          metrics,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching signal performance:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch performance metrics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getSignalById(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching signal by ID: ${id}`);

      // Mock implementation - replace with actual service method when available
      return {
        status: 'success',
        data: {
          message: 'Signal by ID endpoint - to be implemented',
          id,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching signal ${id}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch signal',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate/:symbol')
  @UseGuards(JwtAuthGuard)
  async generateSignalForSymbol(
    @Param('symbol') symbol: string,
    @Query('timeFrame') timeFrame: TimeFrame = TimeFrame.FIFTEEN_MIN,
  ) {
    try {
      this.logger.log(
        `Manual signal generation requested for ${symbol} ${timeFrame}`,
      );

      // Trigger manual signal generation
      const result = {
        status: 'success',
        data: {
          message: `Signal generation triggered for ${symbol} ${timeFrame}`,
          symbol,
          timeFrame,
          status: 'queued',
          timestamp: new Date().toISOString(),
        },
      };

      return result;
    } catch (error) {
      this.logger.error(`Error generating signal for ${symbol}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to generate signal',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateSignalStatus(
    @Param('id') id: string,
    @Body(ValidationPipe) body: UpdateSignalStatusDto,
  ) {
    try {
      this.logger.log(`Updating signal ${id} status to ${body.status}`);

      const { status, executionPrice, actualReturn } = body;

      const updatedSignal =
        await this.signalGeneratorService.updateSignalStatus(id, status);

      return {
        status: 'success',
        data: {
          message: 'Signal status updated successfully',
          signal: updatedSignal,
          executionDetails: {
            executionPrice,
            actualReturn,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Error updating signal ${id}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Failed to update signal status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('market-data/:symbol')
  @UseGuards(JwtAuthGuard)
  async getMarketData(
    @Param('symbol') symbol: string,
    @Query(ValidationPipe) query: MarketDataQueryDto,
  ) {
    try {
      this.logger.log(`Fetching market data for ${symbol}`);

      // Mock implementation - replace with actual service method when available
      const mockData = Array.from(
        { length: query.limit || 100 },
        (_, index) => ({
          id: `${symbol}-${index}`,
          symbol,
          timestamp: new Date(Date.now() - index * 60000).toISOString(),
          open: 100 + Math.random() * 10,
          high: 105 + Math.random() * 10,
          low: 95 + Math.random() * 10,
          close: 100 + Math.random() * 10,
          volume: Math.floor(Math.random() * 1000000),
        }),
      );

      return {
        status: 'success',
        data: {
          symbol,
          timeFrame: query.timeFrame,
          data: mockData,
          count: mockData.length,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching market data for ${symbol}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch market data',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('technical-analysis/:symbol')
  @UseGuards(JwtAuthGuard)
  async getTechnicalAnalysis(
    @Param('symbol') symbol: string,
    @Query('timeFrame') timeFrame: string = '5min',
  ) {
    try {
      this.logger.log(`Fetching technical analysis for ${symbol}`);

      const currentTime = new Date();
      const indicators: any =
        await this.technicalAnalysisService.calculateIndicators(
          symbol,
          currentTime,
          timeFrame,
        );

      const patterns = await this.technicalAnalysisService.detectPricePatterns(
        symbol,
        timeFrame,
      );

      const volatilityMetrics =
        await this.technicalAnalysisService.calculateVolatilityMetrics(
          symbol,
          timeFrame,
        );

      return {
        status: 'success',
        data: {
          symbol,
          timeFrame,
          timestamp: currentTime.toISOString(),
          analysis: {
            technicalIndicators: indicators,
            pricePatterns: patterns,
            volatilityMetrics,
          },
        },
      };
    } catch (error) {
      this.logger.error(
        `Error fetching technical analysis for ${symbol}:`,
        error,
      );
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch technical analysis',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('news/:symbol?')
  @UseGuards(JwtAuthGuard)
  async getMarketNews(
    @Param('symbol') symbol?: string,
    @Query('limit', new ValidationPipe({ transform: true })) limit: number = 20,
  ) {
    try {
      this.logger.log(`Fetching market news for ${symbol || 'all'}`);

      // Mock implementation - replace with actual service method when available
      const mockNews = Array.from({ length: limit }, (_, index) => ({
        id: `news-${index}`,
        headline: `Market news headline ${index + 1} for ${symbol || 'general market'}`,
        summary: `Summary of news item ${index + 1}`,
        source: `Source ${(index % 3) + 1}`,
        publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
        sentimentScore: (Math.random() - 0.5) * 2, // -1 to 1
        relevanceScore: Math.random(),
      }));

      return {
        status: 'success',
        data: {
          symbol: symbol || 'all',
          news: mockNews,
          count: mockNews.length,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching news for ${symbol}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch market news',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('backtest')
  @UseGuards(JwtAuthGuard)
  async runBacktest(@Body(ValidationPipe) backtestRequest: BacktestRequestDto) {
    try {
      this.logger.log(`Running backtest for ${backtestRequest.symbol}`);

      const {
        symbol,
        strategyId,
        startDate,
        endDate,
        initialCapital = 100000,
      } = backtestRequest;

      const result = await this.backtestService.runFullBacktest(
        symbol,
        strategyId,
        TimeFrame.ONE_DAY,
        new Date(startDate),
        new Date(endDate),
        { initialCapital },
      );

      return {
        status: 'success',
        data: {
          message: 'Backtest completed successfully',
          result,
        },
      };
    } catch (error) {
      this.logger.error('Error running backtest:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to run backtest',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('backtest/:strategyId')
  @UseGuards(JwtAuthGuard)
  async getBacktestResults(@Param('strategyId') strategyId: string) {
    try {
      this.logger.log(`Fetching backtest results for strategy: ${strategyId}`);

      // Mock implementation - replace with actual service method when available
      const mockResults = {
        strategyId,
        totalTrades: 150,
        winningTrades: 95,
        losingTrades: 55,
        winRate: 63.33,
        totalReturn: 15.67,
        averageReturn: 0.104,
        sharpeRatio: 1.45,
        maxDrawdown: -8.23,
        profitFactor: 1.78,
        lastUpdated: new Date().toISOString(),
      };

      return {
        status: 'success',
        data: {
          strategyId,
          results: [mockResults],
          count: 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error fetching backtest results for ${strategyId}:`,
        error,
      );
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch backtest results',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ml-models/:symbol')
  @UseGuards(JwtAuthGuard)
  async getMLModelInfo(@Param('symbol') symbol: string) {
    try {
      this.logger.log(`Fetching ML model info for ${symbol}`);

      const modelInfo = await this.mlModelService.getModelInfo(symbol);

      return {
        status: 'success',
        data: {
          symbol,
          modelInfo,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching ML model info for ${symbol}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch ML model information',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('ml-models/:symbol/retrain')
  @UseGuards(JwtAuthGuard)
  async retrainMLModel(@Param('symbol') symbol: string) {
    try {
      this.logger.log(`Initiating ML model retraining for ${symbol}`);

      await this.mlModelService.forceRetrain(symbol);

      return {
        status: 'success',
        data: {
          message: `ML model retraining initiated for ${symbol}`,
          symbol,
          status: 'training',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error retraining ML model for ${symbol}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to retrain ML model',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('subscribe/:symbol')
  @UseGuards(JwtAuthGuard)
  async subscribeToSymbol(@Param('symbol') symbol: string) {
    try {
      this.logger.log(`Subscribing to real-time data for ${symbol}`);

      // Mock implementation - replace with actual service method when available
      return {
        status: 'success',
        data: {
          message: `Successfully subscribed to real-time data for ${symbol}`,
          symbol,
          status: 'subscribed',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error subscribing to ${symbol}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to subscribe to symbol',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('subscribe/:symbol')
  @UseGuards(JwtAuthGuard)
  async unsubscribeFromSymbol(@Param('symbol') symbol: string) {
    try {
      this.logger.log(`Unsubscribing from ${symbol}`);

      // Mock implementation - replace with actual service method when available
      return {
        status: 'success',
        data: {
          message: `Successfully unsubscribed from ${symbol}`,
          symbol,
          status: 'unsubscribed',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error unsubscribing from ${symbol}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to unsubscribe from symbol',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/patterns')
  @UseGuards(JwtAuthGuard)
  async getSignalPatterns(
    @Query('symbol') symbol?: string,
    @Query('timeFrame') timeFrame?: TimeFrame,
    @Query('limit', new ValidationPipe({ transform: true })) limit: number = 10,
  ) {
    try {
      this.logger.log(
        `Fetching signal patterns for ${symbol || 'all symbols'}`,
      );

      // Mock pattern analysis
      const patterns = Array.from({ length: limit }, (_, index) => ({
        id: `pattern-${index}`,
        pattern: [
          'Head and Shoulders',
          'Double Top',
          'Triangle',
          'Flag',
          'Wedge',
        ][index % 5],
        symbol: symbol || `SYMBOL${index}`,
        timeFrame: timeFrame || TimeFrame.ONE_HOUR,
        confidence: 0.7 + Math.random() * 0.3,
        direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
        detectedAt: new Date(Date.now() - index * 3600000).toISOString(),
        expectedBreakout: new Date(
          Date.now() + Math.random() * 86400000,
        ).toISOString(),
      }));

      return {
        status: 'success',
        data: {
          patterns,
          filters: { symbol, timeFrame },
          count: patterns.length,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching signal patterns:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch signal patterns',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health/check')
  async healthCheck() {
    try {
      const timestamp = new Date().toISOString();

      return {
        status: 'success',
        data: {
          status: 'healthy',
          timestamp,
          service: 'signals-service',
          version: '1.0.0',
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
        },
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Service unhealthy',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
