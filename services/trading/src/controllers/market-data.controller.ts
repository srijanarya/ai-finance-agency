import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  BadRequestException,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { MarketDataService } from '../services/market-data.service';
import { CurrentUserDto } from '../dto/auth.dto';
import {
  CreateMarketDataDto,
  UpdateMarketDataDto,
  MarketDataSearchDto,
  MarketDataResponseDto,
  MarketDataListResponseDto,
  MarketDataSnapshotDto,
  MarketDataSubscriptionDto,
} from '../dto/market-data.dto';

@ApiTags('Market Data')
@ApiBearerAuth()
@Controller('market-data')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Post()
  @Roles('admin', 'data_provider')
  @ApiOperation({ summary: 'Create market data record' })
  @ApiResponse({ status: 201, type: MarketDataResponseDto })
  async create(
    @Body() createMarketDataDto: CreateMarketDataDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<MarketDataResponseDto> {
    return this.marketDataService.create(createMarketDataDto);
  }

  @Post('bulk')
  @Roles('admin', 'data_provider')
  @ApiOperation({ summary: 'Create multiple market data records' })
  @ApiResponse({ status: 201, type: [MarketDataResponseDto] })
  async createBulk(
    @Body() createMarketDataDtos: CreateMarketDataDto[],
    @CurrentUser() user: CurrentUserDto,
  ): Promise<MarketDataResponseDto[]> {
    return this.marketDataService.createBulk(createMarketDataDtos);
  }

  @Put(':id')
  @Roles('admin', 'data_provider')
  @ApiOperation({ summary: 'Update market data record' })
  @ApiResponse({ status: 200, type: MarketDataResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateMarketDataDto: UpdateMarketDataDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<MarketDataResponseDto> {
    return this.marketDataService.update(id, updateMarketDataDto);
  }

  @Get('search')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Search market data with filters' })
  @ApiResponse({ status: 200, type: MarketDataListResponseDto })
  async search(
    @Query() searchDto: MarketDataSearchDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<MarketDataListResponseDto> {
    return this.marketDataService.search(searchDto);
  }

  @Get('quote/:symbol')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get latest quote for symbol' })
  @ApiResponse({ status: 200, type: MarketDataResponseDto })
  async getLatestQuote(
    @Param('symbol') symbol: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<MarketDataResponseDto | null> {
    return this.marketDataService.getLatestQuote(symbol.toUpperCase());
  }

  @Get('trade/:symbol')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get latest trade for symbol' })
  @ApiResponse({ status: 200, type: MarketDataResponseDto })
  async getLatestTrade(
    @Param('symbol') symbol: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<MarketDataResponseDto | null> {
    return this.marketDataService.getLatestTrade(symbol.toUpperCase());
  }

  @Get('ohlcv/:symbol')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get OHLCV data for symbol' })
  @ApiResponse({ status: 200, type: [MarketDataResponseDto] })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (1m, 5m, 1h, 1d, etc.)' })
  @ApiQuery({ name: 'startDate', required: false, type: Date, description: 'Start date' })
  @ApiQuery({ name: 'endDate', required: false, type: Date, description: 'End date' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of records' })
  async getOHLCV(
    @Param('symbol') symbol: string,
    @CurrentUser() user: CurrentUserDto,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ): Promise<MarketDataResponseDto[]> {
    const finalPeriod = period || '1d';
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const finalLimit = limit || 100;

    if (start && isNaN(start.getTime())) {
      throw new BadRequestException('Invalid start date format');
    }

    if (end && isNaN(end.getTime())) {
      throw new BadRequestException('Invalid end date format');
    }

    if (finalLimit < 1 || finalLimit > 1000) {
      throw new BadRequestException('Limit must be between 1 and 1000');
    }

    return this.marketDataService.getOHLCV(symbol.toUpperCase(), finalPeriod, start, end, finalLimit);
  }

  @Post('snapshot')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get market data snapshot for multiple symbols' })
  @ApiResponse({ status: 200, type: MarketDataSnapshotDto })
  async getSnapshot(
    @Body('symbols', new ParseArrayPipe({ items: String })) symbols: string[],
    @CurrentUser() user: CurrentUserDto,
  ): Promise<MarketDataSnapshotDto> {
    if (!symbols || symbols.length === 0) {
      throw new BadRequestException('At least one symbol is required');
    }

    if (symbols.length > 100) {
      throw new BadRequestException('Maximum 100 symbols allowed per snapshot');
    }

    const upperSymbols = symbols.map(s => s.toUpperCase());
    return this.marketDataService.getSnapshot(upperSymbols);
  }

  @Post('subscribe')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Subscribe to real-time market data' })
  @ApiResponse({ status: 200 })
  async subscribe(
    @Body() subscriptionDto: MarketDataSubscriptionDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{ message: string; subscribedSymbols: string[] }> {
    if (!subscriptionDto.symbols || subscriptionDto.symbols.length === 0) {
      throw new BadRequestException('At least one symbol is required');
    }

    if (subscriptionDto.symbols.length > 50) {
      throw new BadRequestException('Maximum 50 symbols allowed per subscription');
    }

    const upperSymbols = subscriptionDto.symbols.map(s => s.toUpperCase());
    
    for (const symbol of upperSymbols) {
      await this.marketDataService.subscribeToSymbol(symbol, user.id);
    }

    return {
      message: 'Successfully subscribed to market data',
      subscribedSymbols: upperSymbols,
    };
  }

  @Delete('subscribe/:symbol')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Unsubscribe from real-time market data for symbol' })
  @ApiResponse({ status: 200 })
  async unsubscribe(
    @Param('symbol') symbol: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{ message: string; unsubscribedSymbol: string }> {
    const upperSymbol = symbol.toUpperCase();
    await this.marketDataService.unsubscribeFromSymbol(upperSymbol, user.id);

    return {
      message: 'Successfully unsubscribed from market data',
      unsubscribedSymbol: upperSymbol,
    };
  }

  @Get('subscriptions')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get user market data subscriptions' })
  @ApiResponse({ status: 200 })
  async getUserSubscriptions(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{ userId: string; subscriptions: string[] }> {
    const subscriptions = await this.marketDataService.getUserSubscriptions(user.id);
    
    return {
      userId: user.id,
      subscriptions,
    };
  }

  @Get('subscriptions/active')
  @Roles('admin', 'data_provider')
  @ApiOperation({ summary: 'Get all active market data subscriptions' })
  @ApiResponse({ status: 200 })
  async getActiveSubscriptions(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{ activeSubscriptions: string[]; count: number }> {
    const subscriptions = await this.marketDataService.getActiveSubscriptions();
    
    return {
      activeSubscriptions: subscriptions,
      count: subscriptions.length,
    };
  }

  @Get(':id')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get market data record by ID' })
  @ApiResponse({ status: 200, type: MarketDataResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<MarketDataResponseDto> {
    return this.marketDataService.findOne(id);
  }

  // Admin endpoints for data maintenance
  @Post('maintenance/mark-stale')
  @Roles('admin')
  @ApiOperation({ summary: 'Mark old market data as stale' })
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'olderThanMinutes', required: false, type: Number, description: 'Mark data older than X minutes as stale' })
  async markStaleData(
    @Query('olderThanMinutes') olderThanMinutes: number = 15,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{ message: string; recordsMarked: number }> {
    if (olderThanMinutes < 1 || olderThanMinutes > 1440) { // 1 minute to 1 day
      throw new BadRequestException('olderThanMinutes must be between 1 and 1440');
    }

    const recordsMarked = await this.marketDataService.markStaleData(olderThanMinutes);
    
    return {
      message: 'Data maintenance completed',
      recordsMarked,
    };
  }

  @Delete('maintenance/cleanup')
  @Roles('admin')
  @ApiOperation({ summary: 'Cleanup old market data records' })
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'olderThanDays', required: false, type: Number, description: 'Delete data older than X days' })
  async cleanupOldData(
    @Query('olderThanDays') olderThanDays: number = 30,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{ message: string; recordsDeleted: number }> {
    if (olderThanDays < 7 || olderThanDays > 365) { // 1 week to 1 year
      throw new BadRequestException('olderThanDays must be between 7 and 365');
    }

    const recordsDeleted = await this.marketDataService.cleanupOldData(olderThanDays);
    
    return {
      message: 'Old data cleanup completed',
      recordsDeleted,
    };
  }

  // Health and status endpoints
  @Get('health/status')
  @Roles('admin', 'data_provider')
  @ApiOperation({ summary: 'Get market data service health status' })
  @ApiResponse({ status: 200 })
  async getHealthStatus(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{
    status: string;
    activeSubscriptions: number;
    totalUsers: number;
    dataFreshness: {
      fresh: number;
      stale: number;
      total: number;
    };
  }> {
    const [activeSubscriptions, dataStats] = await Promise.all([
      this.marketDataService.getActiveSubscriptions(),
      // You might want to add a method to get data freshness statistics
      Promise.resolve({ fresh: 0, stale: 0, total: 0 }), // Placeholder
    ]);

    return {
      status: 'healthy',
      activeSubscriptions: activeSubscriptions.length,
      totalUsers: 0, // You might want to track this
      dataFreshness: dataStats,
    };
  }
}