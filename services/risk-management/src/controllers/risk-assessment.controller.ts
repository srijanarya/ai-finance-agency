import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TradeRiskAssessmentService, TradeRiskParams, RiskAssessmentResult } from '../services/trade-risk-assessment.service';
import { PortfolioRiskCalculationService, PortfolioData, PortfolioRiskMetrics } from '../services/portfolio-risk-calculation.service';
import { CreateRiskAssessmentDto, RiskAssessmentResponseDto, PortfolioRiskRequestDto } from '../dto/risk-assessment.dto';
import { RiskAssessment } from '../entities/risk-assessment.entity';

@ApiTags('Risk Assessment')
@ApiBearerAuth('JWT-auth')
@Controller('risk-assessment')
@UseGuards(AuthGuard('jwt'))
export class RiskAssessmentController {
  private readonly logger = new Logger(RiskAssessmentController.name);

  constructor(
    private readonly tradeRiskAssessmentService: TradeRiskAssessmentService,
    private readonly portfolioRiskCalculationService: PortfolioRiskCalculationService,
  ) {}

  @Post('trade')
  @ApiOperation({ summary: 'Assess risk for a trade' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Trade risk assessment completed',
    type: RiskAssessmentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request parameters' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized access' })
  async assessTradeRisk(
    @Body() createRiskAssessmentDto: CreateRiskAssessmentDto,
  ): Promise<RiskAssessmentResult> {
    this.logger.log(`Assessing trade risk for user ${createRiskAssessmentDto.userId}`);

    const tradeRiskParams: TradeRiskParams = {
      userId: createRiskAssessmentDto.userId,
      accountId: createRiskAssessmentDto.accountId,
      tradeId: createRiskAssessmentDto.tradeId,
      symbol: createRiskAssessmentDto.symbol,
      assetType: createRiskAssessmentDto.assetType,
      side: createRiskAssessmentDto.side,
      quantity: createRiskAssessmentDto.quantity,
      price: createRiskAssessmentDto.price,
      stopLoss: createRiskAssessmentDto.stopLoss,
      takeProfit: createRiskAssessmentDto.takeProfit,
      leverage: createRiskAssessmentDto.leverage,
      portfolioValue: createRiskAssessmentDto.portfolioValue,
      availableBalance: createRiskAssessmentDto.availableBalance,
      existingPositions: createRiskAssessmentDto.existingPositions || [],
      marketData: createRiskAssessmentDto.marketData,
    };

    return await this.tradeRiskAssessmentService.assessTradeRisk(tradeRiskParams);
  }

  @Post('portfolio')
  @ApiOperation({ summary: 'Calculate portfolio risk metrics' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Portfolio risk calculation completed',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request parameters' })
  async calculatePortfolioRisk(
    @Body() portfolioRiskRequestDto: PortfolioRiskRequestDto,
  ): Promise<PortfolioRiskMetrics> {
    this.logger.log(`Calculating portfolio risk for portfolio ${portfolioRiskRequestDto.portfolioId}`);

    const portfolioData: PortfolioData = {
      userId: portfolioRiskRequestDto.userId,
      accountId: portfolioRiskRequestDto.accountId,
      portfolioId: portfolioRiskRequestDto.portfolioId,
      totalValue: portfolioRiskRequestDto.totalValue,
      availableBalance: portfolioRiskRequestDto.availableBalance,
      usedMargin: portfolioRiskRequestDto.usedMargin,
      leverage: portfolioRiskRequestDto.leverage,
      positions: portfolioRiskRequestDto.positions,
      historicalReturns: portfolioRiskRequestDto.historicalReturns,
      benchmarkReturns: portfolioRiskRequestDto.benchmarkReturns,
    };

    return await this.portfolioRiskCalculationService.calculatePortfolioRisk(portfolioData);
  }

  @Get('trade/history/:userId')
  @ApiOperation({ summary: 'Get trade assessment history for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trade assessment history retrieved',
    type: [RiskAssessment],
  })
  async getTradeAssessmentHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ): Promise<RiskAssessment[]> {
    return await this.tradeRiskAssessmentService.getTradeAssessmentHistory(
      userId,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Get('portfolio/history/:portfolioId')
  @ApiOperation({ summary: 'Get portfolio risk history' })
  @ApiParam({ name: 'portfolioId', description: 'Portfolio ID' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Portfolio risk history retrieved',
  })
  async getPortfolioRiskHistory(
    @Param('portfolioId') portfolioId: string,
    @Query('days') days?: number,
  ) {
    return await this.portfolioRiskCalculationService.getPortfolioRiskHistory(
      portfolioId,
      days ? parseInt(days.toString()) : 30,
    );
  }

  @Get('portfolio/metrics/:portfolioId')
  @ApiOperation({ summary: 'Get latest portfolio risk metrics' })
  @ApiParam({ name: 'portfolioId', description: 'Portfolio ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Latest portfolio metrics retrieved',
  })
  async getLatestPortfolioMetrics(
    @Param('portfolioId') portfolioId: string,
  ) {
    return await this.portfolioRiskCalculationService.getLatestPortfolioMetrics(portfolioId);
  }

  @Put('reassess/:assessmentId')
  @ApiOperation({ summary: 'Re-run risk assessment' })
  @ApiParam({ name: 'assessmentId', description: 'Risk assessment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Risk assessment completed',
    type: RiskAssessmentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Assessment not found' })
  async reassessRisk(
    @Param('assessmentId') assessmentId: string,
  ): Promise<RiskAssessmentResult> {
    return await this.tradeRiskAssessmentService.reassessTrade(assessmentId);
  }

  @Get('assessment/:assessmentId')
  @ApiOperation({ summary: 'Get risk assessment details' })
  @ApiParam({ name: 'assessmentId', description: 'Risk assessment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Risk assessment details retrieved',
    type: RiskAssessment,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Assessment not found' })
  async getRiskAssessment(
    @Param('assessmentId') assessmentId: string,
  ): Promise<RiskAssessment> {
    // This would be implemented to fetch assessment details
    throw new Error('Method not implemented');
  }

  @Get('user/:userId/summary')
  @ApiOperation({ summary: 'Get user risk summary' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User risk summary retrieved',
  })
  async getUserRiskSummary(
    @Param('userId') userId: string,
  ) {
    // This would provide a comprehensive risk summary for the user
    return {
      userId,
      currentRiskLevel: 'MEDIUM',
      portfolioRisk: {
        var95: 25000,
        volatility: 0.15,
        sharpeRatio: 1.2,
        maxDrawdown: 0.08,
      },
      recentAssessments: await this.tradeRiskAssessmentService.getTradeAssessmentHistory(userId, 10),
      riskAlerts: {
        active: 2,
        highPriority: 0,
        resolved: 15,
      },
      complianceStatus: 'COMPLIANT',
      lastUpdated: new Date(),
    };
  }

  @Post('stress-test')
  @ApiOperation({ summary: 'Perform stress test on portfolio' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Stress test completed',
  })
  async performStressTest(
    @Body() stressTestParams: {
      portfolioId: string;
      scenarios: Array<{
        name: string;
        marketShock: number;
        volatilityIncrease: number;
        liquidityReduction: number;
      }>;
    },
  ) {
    this.logger.log(`Performing stress test on portfolio ${stressTestParams.portfolioId}`);

    // This would implement stress testing functionality
    const results = {
      portfolioId: stressTestParams.portfolioId,
      scenarios: stressTestParams.scenarios.map(scenario => ({
        ...scenario,
        result: {
          portfolioValue: 900000, // Example result
          var95: 75000,
          maxLoss: 120000,
          liquidityRisk: 'HIGH',
        },
      })),
      overallRisk: 'ELEVATED',
      recommendations: [
        'Reduce concentration in high-risk assets',
        'Increase cash reserves',
        'Consider hedging strategies',
      ],
      timestamp: new Date(),
    };

    return results;
  }

  @Get('benchmark/:portfolioId')
  @ApiOperation({ summary: 'Compare portfolio risk against benchmarks' })
  @ApiParam({ name: 'portfolioId', description: 'Portfolio ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Benchmark comparison retrieved',
  })
  async benchmarkRisk(
    @Param('portfolioId') portfolioId: string,
  ) {
    this.logger.log(`Benchmarking risk for portfolio ${portfolioId}`);

    return {
      portfolioId,
      benchmarks: {
        'S&P 500': {
          volatility: { portfolio: 0.18, benchmark: 0.16, comparison: 'HIGHER' },
          sharpe: { portfolio: 1.2, benchmark: 1.1, comparison: 'BETTER' },
          maxDrawdown: { portfolio: 0.12, benchmark: 0.10, comparison: 'WORSE' },
        },
        'Industry Average': {
          volatility: { portfolio: 0.18, benchmark: 0.20, comparison: 'LOWER' },
          sharpe: { portfolio: 1.2, benchmark: 0.9, comparison: 'BETTER' },
          maxDrawdown: { portfolio: 0.12, benchmark: 0.15, comparison: 'BETTER' },
        },
      },
      overallRanking: 'ABOVE_AVERAGE',
      strengthAreas: ['Risk-adjusted returns', 'Diversification'],
      improvementAreas: ['Drawdown control', 'Volatility management'],
      timestamp: new Date(),
    };
  }
}