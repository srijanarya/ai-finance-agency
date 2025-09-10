import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";

import { MarketDataService } from "../services/market-data.service";
import { HistoricalDataService } from "../services/historical-data.service";
import { TechnicalIndicatorsService } from "../services/technical-indicators.service";
import { MarketData } from "../entities/market-data.entity";
import { TimeInterval } from "../entities/historical-data.entity";

@ApiTags("Market Data")
@Controller("market-data")
@UseGuards(ThrottlerGuard)
export class MarketDataController {
  constructor(
    private marketDataService: MarketDataService,
    private historicalDataService: HistoricalDataService,
    private technicalIndicatorsService: TechnicalIndicatorsService,
  ) {}

  @Get("realtime/:symbol")
  @ApiOperation({ summary: "Get real-time market data for a symbol" })
  @ApiResponse({
    status: 200,
    description: "Market data retrieved successfully",
    type: MarketData,
  })
  @ApiResponse({ status: 404, description: "Symbol not found" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  async getRealtimeData(@Param("symbol") symbol: string): Promise<MarketData> {
    try {
      const data = await this.marketDataService.getRealtimeData(
        symbol.toUpperCase(),
      );

      if (!data) {
        throw new HttpException(
          "Market data not found for symbol",
          HttpStatus.NOT_FOUND,
        );
      }

      return data;
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get market data",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("realtime/batch")
  @ApiOperation({ summary: "Get real-time market data for multiple symbols" })
  @ApiResponse({
    status: 200,
    description: "Market data retrieved successfully",
    type: [MarketData],
  })
  async getBatchRealtimeData(
    @Body() body: { symbols: string[] },
  ): Promise<MarketData[]> {
    try {
      if (!Array.isArray(body.symbols) || body.symbols.length === 0) {
        throw new HttpException(
          "Symbols array is required",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (body.symbols.length > 50) {
        throw new HttpException(
          "Maximum 50 symbols allowed per request",
          HttpStatus.BAD_REQUEST,
        );
      }

      const normalizedSymbols = body.symbols.map((s) => s.toUpperCase());
      return await this.marketDataService.getMultipleRealtimeData(
        normalizedSymbols,
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get batch market data",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("historical/:symbol")
  @ApiOperation({ summary: "Get historical market data for a symbol" })
  @ApiQuery({
    name: "interval",
    enum: TimeInterval,
    required: false,
    description: "Time interval",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Start date (ISO string)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "End date (ISO string)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Maximum number of records",
  })
  @ApiResponse({
    status: 200,
    description: "Historical data retrieved successfully",
  })
  async getHistoricalData(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: number,
  ) {
    try {
      const query = {
        symbol: symbol.toUpperCase(),
        interval,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      };

      return await this.historicalDataService.getHistoricalData(query);
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get historical data",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("ohlc/:symbol")
  @ApiOperation({
    summary: "Get OHLC (Open, High, Low, Close) data for a symbol",
  })
  @ApiQuery({ name: "interval", enum: TimeInterval, required: false })
  @ApiQuery({ name: "startDate", required: false })
  @ApiQuery({ name: "endDate", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getOHLCData(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: number,
  ) {
    try {
      return await this.historicalDataService.getOHLCData(
        symbol.toUpperCase(),
        interval,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        limit ? parseInt(limit.toString(), 10) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get OHLC data",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("volume-profile/:symbol")
  @ApiOperation({ summary: "Get volume profile for a symbol" })
  @ApiQuery({ name: "interval", enum: TimeInterval, required: false })
  @ApiQuery({
    name: "days",
    required: false,
    description: "Number of days to analyze",
  })
  async getVolumeProfile(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("days") days?: number,
  ) {
    try {
      return await this.historicalDataService.getVolumeProfile(
        symbol.toUpperCase(),
        interval,
        days ? parseInt(days.toString(), 10) : 30,
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get volume profile",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("technical-analysis/:symbol/rsi")
  @ApiOperation({ summary: "Get RSI (Relative Strength Index) for a symbol" })
  @ApiQuery({ name: "interval", enum: TimeInterval, required: false })
  @ApiQuery({
    name: "period",
    required: false,
    description: "RSI period (default: 14)",
  })
  @ApiQuery({
    name: "days",
    required: false,
    description: "Number of days for analysis",
  })
  async getRSI(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("period") period?: number,
    @Query("days") days?: number,
  ) {
    try {
      return await this.technicalIndicatorsService.calculateRSI({
        symbol: symbol.toUpperCase(),
        interval,
        period: period ? parseInt(period.toString(), 10) : 14,
        days: days ? parseInt(days.toString(), 10) : 100,
      });
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to calculate RSI",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("technical-analysis/:symbol/macd")
  @ApiOperation({
    summary: "Get MACD (Moving Average Convergence Divergence) for a symbol",
  })
  @ApiQuery({ name: "interval", enum: TimeInterval, required: false })
  @ApiQuery({ name: "days", required: false })
  async getMACD(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("days") days?: number,
  ) {
    try {
      return await this.technicalIndicatorsService.calculateMACD({
        symbol: symbol.toUpperCase(),
        interval,
        days: days ? parseInt(days.toString(), 10) : 100,
      });
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to calculate MACD",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("technical-analysis/:symbol/bollinger-bands")
  @ApiOperation({ summary: "Get Bollinger Bands for a symbol" })
  @ApiQuery({ name: "interval", enum: TimeInterval, required: false })
  @ApiQuery({
    name: "period",
    required: false,
    description: "Period (default: 20)",
  })
  @ApiQuery({ name: "days", required: false })
  async getBollingerBands(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("period") period?: number,
    @Query("days") days?: number,
  ) {
    try {
      return await this.technicalIndicatorsService.calculateBollingerBands({
        symbol: symbol.toUpperCase(),
        interval,
        period: period ? parseInt(period.toString(), 10) : 20,
        days: days ? parseInt(days.toString(), 10) : 100,
      });
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to calculate Bollinger Bands",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("technical-analysis/:symbol/moving-average")
  @ApiOperation({ summary: "Get Moving Average for a symbol" })
  @ApiQuery({ name: "interval", enum: TimeInterval, required: false })
  @ApiQuery({
    name: "type",
    enum: ["SMA", "EMA"],
    required: false,
    description: "MA type",
  })
  @ApiQuery({
    name: "period",
    required: false,
    description: "Period (default: 20)",
  })
  @ApiQuery({ name: "days", required: false })
  async getMovingAverage(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("type") type: "SMA" | "EMA" = "SMA",
    @Query("period") period?: number,
    @Query("days") days?: number,
  ) {
    try {
      return await this.technicalIndicatorsService.calculateMovingAverage({
        symbol: symbol.toUpperCase(),
        interval,
        type,
        period: period ? parseInt(period.toString(), 10) : 20,
        days: days ? parseInt(days.toString(), 10) : 100,
      });
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to calculate Moving Average",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("technical-analysis/:symbol/stochastic")
  @ApiOperation({ summary: "Get Stochastic Oscillator for a symbol" })
  @ApiQuery({ name: "interval", enum: TimeInterval, required: false })
  @ApiQuery({
    name: "period",
    required: false,
    description: "Period (default: 14)",
  })
  @ApiQuery({ name: "days", required: false })
  async getStochastic(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("period") period?: number,
    @Query("days") days?: number,
  ) {
    try {
      return await this.technicalIndicatorsService.calculateStochastic({
        symbol: symbol.toUpperCase(),
        interval,
        period: period ? parseInt(period.toString(), 10) : 14,
        days: days ? parseInt(days.toString(), 10) : 100,
      });
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to calculate Stochastic",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("technical-analysis/:symbol/volume-indicators")
  @ApiOperation({ summary: "Get volume indicators for a symbol" })
  @ApiQuery({ name: "interval", enum: TimeInterval, required: false })
  @ApiQuery({ name: "days", required: false })
  async getVolumeIndicators(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("days") days?: number,
  ) {
    try {
      return await this.technicalIndicatorsService.calculateVolumeIndicators({
        symbol: symbol.toUpperCase(),
        interval,
        days: days ? parseInt(days.toString(), 10) : 50,
      });
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to calculate volume indicators",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("technical-analysis/:symbol/comprehensive")
  @ApiOperation({
    summary: "Get comprehensive technical analysis for a symbol",
  })
  @ApiQuery({ name: "interval", enum: TimeInterval, required: false })
  @ApiQuery({ name: "days", required: false })
  async getComprehensiveAnalysis(
    @Param("symbol") symbol: string,
    @Query("interval") interval: TimeInterval = TimeInterval.ONE_DAY,
    @Query("days") days?: number,
  ) {
    try {
      return await this.technicalIndicatorsService.getComprehensiveAnalysis({
        symbol: symbol.toUpperCase(),
        interval,
        days: days ? parseInt(days.toString(), 10) : 100,
      });
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get comprehensive analysis",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("search")
  @ApiOperation({ summary: "Search for symbols" })
  @ApiQuery({ name: "query", required: true, description: "Search query" })
  async searchSymbols(@Query("query") query: string) {
    try {
      if (!query || query.trim().length < 1) {
        throw new HttpException(
          "Search query is required",
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.marketDataService.searchSymbols(query.trim());
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to search symbols",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("history/:symbol")
  @ApiOperation({ summary: "Get recent market data history for a symbol" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of records (max 1000)",
  })
  async getMarketDataHistory(
    @Param("symbol") symbol: string,
    @Query("limit") limit?: number,
  ) {
    try {
      const recordLimit = Math.min(
        limit ? parseInt(limit.toString(), 10) : 100,
        1000,
      );

      return await this.marketDataService.getMarketDataHistory(
        symbol.toUpperCase(),
        recordLimit,
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get market data history",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
