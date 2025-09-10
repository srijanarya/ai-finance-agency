import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

import { MarketDataService } from '../services/market-data/market-data.service';
import {
  GetQuoteDto,
  GetHistoricalDataDto,
  MarketQuoteResponseDto,
  HistoricalDataResponseDto,
  MarketStatusResponseDto,
  ValidateSymbolDto,
  SymbolValidationResponseDto,
} from '../dto/market-data/market-data.dto';

@ApiTags('Market Data')
@Controller('market-data')
@UseGuards(ThrottlerGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class MarketDataController {
  private readonly logger = new Logger(MarketDataController.name);

  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('quote/:symbol')
  @ApiOperation({ 
    summary: 'Get real-time quote for a symbol',
    description: 'Retrieves current market quote with caching. Updates every 5 minutes during market hours.'
  })
  @ApiParam({ 
    name: 'symbol', 
    description: 'Stock symbol (e.g., AAPL, TSLA)', 
    example: 'AAPL' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quote retrieved successfully',
    type: MarketQuoteResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Symbol not found' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Rate limit exceeded' 
  })
  async getQuote(@Param('symbol') symbol: string): Promise<MarketQuoteResponseDto> {
    try {
      this.logger.log(`Getting quote for symbol: ${symbol}`);
      
      if (!symbol || symbol.trim().length === 0) {
        throw new BadRequestException('Symbol is required');
      }

      const quote = await this.marketDataService.getQuote(symbol.toUpperCase());
      const isMarketOpen = await this.marketDataService.isMarketOpen();

      return {
        ...quote,
        isMarketOpen,
        source: 'api',
      };
    } catch (error) {
      this.logger.error(`Error getting quote for ${symbol}: ${error.message}`);
      throw error;
    }
  }

  @Get('quotes')
  @ApiOperation({ 
    summary: 'Get quotes for multiple symbols',
    description: 'Retrieves quotes for multiple symbols efficiently'
  })
  @ApiQuery({ 
    name: 'symbols', 
    description: 'Comma-separated list of symbols', 
    example: 'AAPL,TSLA,GOOGL' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quotes retrieved successfully',
    type: [MarketQuoteResponseDto] 
  })
  async getMultipleQuotes(@Query('symbols') symbolsParam: string): Promise<MarketQuoteResponseDto[]> {
    try {
      if (!symbolsParam || symbolsParam.trim().length === 0) {
        throw new BadRequestException('Symbols parameter is required');
      }

      const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
      
      if (symbols.length === 0) {
        throw new BadRequestException('At least one valid symbol is required');
      }

      if (symbols.length > 10) {
        throw new BadRequestException('Maximum 10 symbols allowed per request');
      }

      this.logger.log(`Getting quotes for symbols: ${symbols.join(', ')}`);
      
      const quotes = await this.marketDataService.getMultipleQuotes(symbols);
      const isMarketOpen = await this.marketDataService.isMarketOpen();

      return quotes.map(quote => ({
        ...quote,
        isMarketOpen,
        source: 'api',
      }));
    } catch (error) {
      this.logger.error(`Error getting multiple quotes: ${error.message}`);
      throw error;
    }
  }

  @Get('historical/:symbol')
  @ApiOperation({ 
    summary: 'Get historical data for a symbol',
    description: 'Retrieves historical OHLCV data for analysis and charting'
  })
  @ApiParam({ 
    name: 'symbol', 
    description: 'Stock symbol', 
    example: 'AAPL' 
  })
  @ApiQuery({ 
    name: 'startDate', 
    description: 'Start date (YYYY-MM-DD)', 
    example: '2024-01-01' 
  })
  @ApiQuery({ 
    name: 'endDate', 
    description: 'End date (YYYY-MM-DD)', 
    example: '2024-12-31' 
  })
  @ApiQuery({ 
    name: 'interval', 
    description: 'Data interval', 
    enum: ['1d', '1h', '5m', '1m'],
    required: false,
    example: '1d' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Historical data retrieved successfully',
    type: HistoricalDataResponseDto 
  })
  async getHistoricalData(
    @Param('symbol') symbol: string,
    @Query() queryParams: GetHistoricalDataDto
  ): Promise<HistoricalDataResponseDto> {
    try {
      this.logger.log(`Getting historical data for ${symbol} from ${queryParams.startDate} to ${queryParams.endDate}`);
      
      if (!symbol || symbol.trim().length === 0) {
        throw new BadRequestException('Symbol is required');
      }

      const startDate = new Date(queryParams.startDate);
      const endDate = new Date(queryParams.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Limit historical data requests to 2 years
      const maxDays = 365 * 2; // 2 years
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > maxDays) {
        throw new BadRequestException(`Date range too large. Maximum ${maxDays} days allowed`);
      }

      const data = await this.marketDataService.getHistoricalData(
        symbol.toUpperCase(),
        startDate,
        endDate,
        queryParams.interval || '1d'
      );

      return {
        symbol: symbol.toUpperCase(),
        data,
        interval: queryParams.interval || '1d',
        startDate,
        endDate,
        source: 'api',
        totalPoints: data.length,
      };
    } catch (error) {
      this.logger.error(`Error getting historical data for ${symbol}: ${error.message}`);
      throw error;
    }
  }

  @Get('status')
  @ApiOperation({ 
    summary: 'Get current market status',
    description: 'Returns market open/close status and trading hours'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Market status retrieved successfully',
    type: MarketStatusResponseDto 
  })
  async getMarketStatus(): Promise<MarketStatusResponseDto> {
    try {
      this.logger.log('Getting market status');
      const status = await this.marketDataService.getMarketStatus();
      return status;
    } catch (error) {
      this.logger.error(`Error getting market status: ${error.message}`);
      throw error;
    }
  }

  @Get('validate/:symbol')
  @ApiOperation({ 
    summary: 'Validate if a symbol exists',
    description: 'Checks if a stock symbol is valid and returns basic information'
  })
  @ApiParam({ 
    name: 'symbol', 
    description: 'Stock symbol to validate', 
    example: 'AAPL' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Symbol validation result',
    type: SymbolValidationResponseDto 
  })
  async validateSymbol(@Param('symbol') symbol: string): Promise<SymbolValidationResponseDto> {
    try {
      this.logger.log(`Validating symbol: ${symbol}`);
      
      if (!symbol || symbol.trim().length === 0) {
        throw new BadRequestException('Symbol is required');
      }

      const isValid = await this.marketDataService.validateSymbol(symbol.toUpperCase());

      let response: SymbolValidationResponseDto = {
        symbol: symbol.toUpperCase(),
        isValid,
      };

      // If valid, try to get additional information
      if (isValid) {
        try {
          const quote = await this.marketDataService.getQuote(symbol.toUpperCase());
          response = {
            ...response,
            // You could extend this with additional symbol information
            // companyName: 'Retrieved from quote or separate endpoint',
            // exchange: 'NASDAQ',
            // sector: 'Technology',
            // industry: 'Consumer Electronics',
          };
        } catch (error) {
          // If we can't get additional info, that's okay
          this.logger.warn(`Could not get additional info for ${symbol}: ${error.message}`);
        }
      }

      return response;
    } catch (error) {
      this.logger.error(`Error validating symbol ${symbol}: ${error.message}`);
      throw error;
    }
  }

  @Post('cache/clear/:symbol')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Clear cache for a specific symbol',
    description: 'Clears cached data for a symbol (requires authentication)'
  })
  @ApiParam({ 
    name: 'symbol', 
    description: 'Stock symbol', 
    example: 'AAPL' 
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Cache cleared successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async clearSymbolCache(@Param('symbol') symbol: string): Promise<void> {
    try {
      this.logger.log(`Clearing cache for symbol: ${symbol}`);
      await this.marketDataService.clearCache(symbol.toUpperCase());
    } catch (error) {
      this.logger.error(`Error clearing cache for ${symbol}: ${error.message}`);
      throw error;
    }
  }

  @Post('cache/clear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Clear all market data cache',
    description: 'Clears all cached market data (requires authentication)'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'All cache cleared successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async clearAllCache(): Promise<void> {
    try {
      this.logger.log('Clearing all market data cache');
      await this.marketDataService.clearCache();
    } catch (error) {
      this.logger.error(`Error clearing all cache: ${error.message}`);
      throw error;
    }
  }
}