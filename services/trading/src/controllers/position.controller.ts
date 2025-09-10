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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PositionService } from '../services/position.service';
import { CurrentUserDto } from '../dto/auth.dto';
import {
  CreatePositionDto,
  UpdatePositionDto,
  PositionSearchDto,
  PositionResponseDto,
  PositionListResponseDto,
  PositionAnalyticsDto,
  AddTradeDto,
  AddDividendDto,
} from '../dto/position.dto';

@ApiTags('Positions')
@ApiBearerAuth()
@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({ status: 201, type: PositionResponseDto })
  async create(
    @Body() createPositionDto: CreatePositionDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PositionResponseDto> {
    return this.positionService.create(createPositionDto, user.tenantId, user.id);
  }

  @Get('search')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Search positions with filters' })
  @ApiResponse({ status: 200, type: PositionListResponseDto })
  async search(
    @Query() searchDto: PositionSearchDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PositionListResponseDto> {
    // Regular users can only see their own positions, admins can see all
    const userId = user.roles?.includes('admin') ? undefined : user.id;
    return this.positionService.search(searchDto, user.tenantId, userId);
  }

  @Get('my-positions')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get current user positions' })
  @ApiResponse({ status: 200, type: [PositionResponseDto] })
  @ApiQuery({ name: 'includeZero', required: false, type: Boolean, description: 'Include positions with zero quantity' })
  async getMyPositions(
    @CurrentUser() user: CurrentUserDto,
    @Query('includeZero') includeZero?: boolean,
  ): Promise<PositionResponseDto[]> {
    const finalIncludeZero = includeZero ?? false;
    return this.positionService.getUserPositions(user.id, user.tenantId, finalIncludeZero);
  }

  @Get('portfolio/:portfolioId')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get positions for specific portfolio' })
  @ApiResponse({ status: 200, type: [PositionResponseDto] })
  @ApiQuery({ name: 'includeZero', required: false, type: Boolean, description: 'Include positions with zero quantity' })
  async getPortfolioPositions(
    @Param('portfolioId') portfolioId: string,
    @CurrentUser() user: CurrentUserDto,
    @Query('includeZero') includeZero?: boolean,
  ): Promise<PositionResponseDto[]> {
    const finalIncludeZero = includeZero ?? false;
    return this.positionService.getPortfolioPositions(portfolioId, user.tenantId, finalIncludeZero);
  }

  @Get('symbol/:symbol')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get position for specific symbol' })
  @ApiResponse({ status: 200, type: PositionResponseDto })
  async getPositionBySymbol(
    @Param('symbol') symbol: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PositionResponseDto | null> {
    return this.positionService.getPositionBySymbol(symbol, user.tenantId, user.id);
  }

  @Get('analytics')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get position analytics and summary' })
  @ApiResponse({ status: 200, type: PositionAnalyticsDto })
  @ApiQuery({ name: 'portfolioId', required: false, type: String, description: 'Filter by portfolio ID' })
  async getAnalytics(
    @CurrentUser() user: CurrentUserDto,
    @Query('portfolioId') portfolioId?: string,
  ): Promise<PositionAnalyticsDto> {
    // Regular users can only see their own analytics, admins can see all
    const userId = user.roles?.includes('admin') ? undefined : user.id;
    return this.positionService.getAnalytics(user.tenantId, userId, portfolioId);
  }

  @Get(':id')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiResponse({ status: 200, type: PositionResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PositionResponseDto> {
    // Regular users can only see their own positions, admins can see all
    const userId = user.roles?.includes('admin') ? undefined : user.id;
    return this.positionService.findOne(id, user.tenantId, userId);
  }

  @Put(':id')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Update position' })
  @ApiResponse({ status: 200, type: PositionResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PositionResponseDto> {
    return this.positionService.update(id, updatePositionDto, user.tenantId, user.id);
  }

  @Post(':id/trade')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Add trade to position' })
  @ApiResponse({ status: 200, type: PositionResponseDto })
  async addTrade(
    @Param('id') id: string,
    @Body() addTradeDto: AddTradeDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PositionResponseDto> {
    return this.positionService.addTrade(id, addTradeDto, user.tenantId, user.id);
  }

  @Post(':id/dividend')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Add dividend to position' })
  @ApiResponse({ status: 200, type: PositionResponseDto })
  async addDividend(
    @Param('id') id: string,
    @Body() dividendDto: AddDividendDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PositionResponseDto> {
    return this.positionService.addDividend(id, dividendDto, user.tenantId, user.id);
  }

  @Put(':id/close')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Close position' })
  @ApiResponse({ status: 200, type: PositionResponseDto })
  async close(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
    @Body('reason') reason?: string,
  ): Promise<PositionResponseDto> {
    const finalReason = reason ?? 'Manual close';
    return this.positionService.close(id, finalReason, user.tenantId, user.id);
  }

  // Analytics and reporting endpoints
  @Get('reports/performance')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get position performance report' })
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (1d, 7d, 30d, 90d, 1y)' })
  @ApiQuery({ name: 'portfolioId', required: false, type: String, description: 'Filter by portfolio ID' })
  async getPerformanceReport(
    @CurrentUser() user: CurrentUserDto,
    @Query('period') period?: string,
    @Query('portfolioId') portfolioId?: string,
  ): Promise<{
    summary: {
      totalPositions: number;
      totalValue: number;
      totalPnl: number;
      totalPnlPercent: number;
      dayPnl: number;
      dayPnlPercent: number;
      winningPositions: number;
      losingPositions: number;
      winRate: number;
    };
    topPerformers: Array<{
      symbol: string;
      pnl: number;
      pnlPercent: number;
      marketValue: number;
    }>;
    worstPerformers: Array<{
      symbol: string;
      pnl: number;
      pnlPercent: number;
      marketValue: number;
    }>;
    sectorPerformance: Record<string, {
      positions: number;
      totalValue: number;
      totalPnl: number;
      pnlPercent: number;
    }>;
    riskMetrics: {
      concentration: number;
      beta: number;
      volatility: number;
      sharpe: number;
      maxDrawdown: number;
    };
  }> {
    const finalPeriod = period ?? '30d';
    const userId = user.roles?.includes('admin') ? undefined : user.id;
    const analytics = await this.positionService.getAnalytics(user.tenantId, userId, portfolioId);

    return {
      summary: {
        totalPositions: analytics.totalPositions,
        totalValue: analytics.totalMarketValue,
        totalPnl: analytics.totalPnl,
        totalPnlPercent: analytics.totalReturnPercent,
        dayPnl: analytics.totalDayPnl,
        dayPnlPercent: analytics.dayReturnPercent,
        winningPositions: analytics.profitablePositions,
        losingPositions: analytics.losingPositions,
        winRate: analytics.winRate,
      },
      topPerformers: analytics.topHoldings
        .filter(holding => holding.pnl > 0)
        .sort((a, b) => b.pnlPercent - a.pnlPercent)
        .slice(0, 10)
        .map(holding => ({
          symbol: holding.symbol,
          pnl: holding.pnl,
          pnlPercent: holding.pnlPercent,
          marketValue: holding.marketValue,
        })),
      worstPerformers: analytics.topHoldings
        .filter(holding => holding.pnl < 0)
        .sort((a, b) => a.pnlPercent - b.pnlPercent)
        .slice(0, 10)
        .map(holding => ({
          symbol: holding.symbol,
          pnl: holding.pnl,
          pnlPercent: holding.pnlPercent,
          marketValue: holding.marketValue,
        })),
      sectorPerformance: Object.entries(analytics.sectorAllocation).reduce((acc, [sector, data]) => {
        acc[sector] = {
          positions: data.count,
          totalValue: data.marketValue,
          totalPnl: data.pnl,
          pnlPercent: data.marketValue > 0 ? (data.pnl / data.marketValue) * 100 : 0,
        };
        return acc;
      }, {} as any),
      riskMetrics: {
        concentration: analytics.concentration,
        beta: analytics.riskMetrics.portfolioBeta,
        volatility: analytics.riskMetrics.portfolioVolatility,
        sharpe: 0, // Would need risk-free rate and historical data
        maxDrawdown: 0, // Would need historical NAV data
      },
    };
  }

  @Get('reports/allocation')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get position allocation report' })
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'portfolioId', required: false, type: String, description: 'Filter by portfolio ID' })
  async getAllocationReport(
    @CurrentUser() user: CurrentUserDto,
    @Query('portfolioId') portfolioId?: string,
  ): Promise<{
    assetAllocation: Record<string, {
      weight: number;
      value: number;
      positions: number;
      pnl: number;
    }>;
    sectorAllocation: Record<string, {
      weight: number;
      value: number;
      positions: number;
      pnl: number;
    }>;
    geographicAllocation: Record<string, {
      weight: number;
      value: number;
      positions: number;
    }>;
    concentrationAnalysis: {
      top10Concentration: number;
      top5Concentration: number;
      largestPosition: {
        symbol: string;
        weight: number;
        value: number;
      };
    };
    rebalancingOpportunities: Array<{
      symbol: string;
      currentWeight: number;
      targetWeight: number;
      deviation: number;
      suggestedAction: 'buy' | 'sell' | 'hold';
      quantity: number;
    }>;
  }> {
    const userId = user.roles?.includes('admin') ? undefined : user.id;
    const analytics = await this.positionService.getAnalytics(user.tenantId, userId, portfolioId);

    // Convert analytics data to report format
    const assetAllocation = Object.entries(analytics.assetClassAllocation).reduce((acc, [assetClass, data]) => {
      acc[assetClass] = {
        weight: data.weight,
        value: data.marketValue,
        positions: data.count,
        pnl: data.pnl,
      };
      return acc;
    }, {} as any);

    const sectorAllocation = Object.entries(analytics.sectorAllocation).reduce((acc, [sector, data]) => {
      acc[sector] = {
        weight: data.weight,
        value: data.marketValue,
        positions: data.count,
        pnl: data.pnl,
      };
      return acc;
    }, {} as any);

    // Find largest position for concentration analysis
    const largestPosition = analytics.topHoldings[0] || {
      symbol: 'N/A',
      weight: 0,
      marketValue: 0,
    };

    // Calculate top 5 and top 10 concentration
    const top5Concentration = analytics.topHoldings
      .slice(0, 5)
      .reduce((sum, holding) => sum + holding.weight, 0);

    const top10Concentration = analytics.topHoldings
      .slice(0, 10)
      .reduce((sum, holding) => sum + holding.weight, 0);

    return {
      assetAllocation,
      sectorAllocation,
      geographicAllocation: {
        'United States': {
          weight: 100, // Placeholder - would need country data
          value: analytics.totalMarketValue,
          positions: analytics.totalPositions,
        },
      },
      concentrationAnalysis: {
        top10Concentration,
        top5Concentration,
        largestPosition: {
          symbol: largestPosition.symbol,
          weight: largestPosition.weight,
          value: largestPosition.marketValue,
        },
      },
      rebalancingOpportunities: analytics.rebalancingCandidates.map(candidate => ({
        symbol: candidate.symbol,
        currentWeight: candidate.currentWeight,
        targetWeight: candidate.targetWeight,
        deviation: candidate.deviation,
        suggestedAction: candidate.deviation > 0 ? 'sell' as const : 'buy' as const,
        quantity: Math.abs(candidate.deviation * analytics.totalMarketValue / 100), // Approximate
      })),
    };
  }

  // Admin endpoints for bulk operations
  @Post('bulk/update-prices')
  @Roles('admin', 'system', 'data_provider')
  @ApiOperation({ summary: 'Update prices for multiple positions (admin only)' })
  @ApiResponse({ status: 200 })
  async updatePrices(
    @Body() priceUpdates: Array<{
      symbol: string;
      price: number;
      previousClose?: number;
    }>,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{ message: string; updatedPositions: number }> {
    if (!priceUpdates || priceUpdates.length === 0) {
      throw new BadRequestException('At least one price update is required');
    }

    if (priceUpdates.length > 1000) {
      throw new BadRequestException('Maximum 1000 price updates allowed per request');
    }

    // Validate price updates
    for (const update of priceUpdates) {
      if (!update.symbol || typeof update.symbol !== 'string') {
        throw new BadRequestException('All updates must have a valid symbol');
      }
      if (typeof update.price !== 'number' || update.price <= 0) {
        throw new BadRequestException('All updates must have a valid positive price');
      }
    }

    const updatedCount = await this.positionService.updatePrices(user.tenantId, priceUpdates);

    return {
      message: 'Price updates completed',
      updatedPositions: updatedCount,
    };
  }

  @Get('health/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Get position service health status' })
  @ApiResponse({ status: 200 })
  async getHealthStatus(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{
    status: string;
    totalPositions: number;
    activePositions: number;
    totalValue: number;
    lastPriceUpdate: string;
  }> {
    // This would typically include more comprehensive health checks
    const analytics = await this.positionService.getAnalytics(user.tenantId);

    return {
      status: 'healthy',
      totalPositions: analytics.totalPositions,
      activePositions: analytics.totalPositions, // Assuming all returned positions are active
      totalValue: analytics.totalMarketValue,
      lastPriceUpdate: new Date().toISOString(),
    };
  }
}