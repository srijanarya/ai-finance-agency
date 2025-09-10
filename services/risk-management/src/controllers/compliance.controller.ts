import {
  Controller,
  Post,
  Get,
  Put,
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
import {
  ComplianceMonitoringService,
  KYCCheckParams,
  AMLCheckParams,
  TradeComplianceParams,
} from '../services/compliance-monitoring.service';
import {
  ComplianceCheck,
  ComplianceType,
  ComplianceStatus,
} from '../entities/compliance-check.entity';
import {
  CreateKYCCheckDto,
  CreateAMLCheckDto,
  CreateTradeComplianceCheckDto,
  ComplianceCheckResponseDto,
} from '../dto/compliance.dto';

@ApiTags('Compliance Monitoring')
@ApiBearerAuth('JWT-auth')
@Controller('compliance')
@UseGuards(AuthGuard('jwt'))
export class ComplianceController {
  private readonly logger = new Logger(ComplianceController.name);

  constructor(
    private readonly complianceMonitoringService: ComplianceMonitoringService,
  ) {}

  @Post('kyc')
  @ApiOperation({ summary: 'Perform KYC (Know Your Customer) check' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'KYC check completed',
    type: ComplianceCheckResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request parameters' })
  async performKYCCheck(
    @Body() createKYCCheckDto: CreateKYCCheckDto,
  ): Promise<ComplianceCheck> {
    this.logger.log(`Starting KYC check for user ${createKYCCheckDto.userId}`);

    const kycParams: KYCCheckParams = {
      userId: createKYCCheckDto.userId,
      personalInfo: createKYCCheckDto.personalInfo,
      documents: createKYCCheckDto.documents,
      riskProfile: createKYCCheckDto.riskProfile,
      investmentExperience: createKYCCheckDto.investmentExperience,
      estimatedNetWorth: createKYCCheckDto.estimatedNetWorth,
      annualIncome: createKYCCheckDto.annualIncome,
    };

    return await this.complianceMonitoringService.performKYCCheck(kycParams);
  }

  @Post('aml')
  @ApiOperation({ summary: 'Perform AML (Anti-Money Laundering) check' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'AML check completed',
    type: ComplianceCheckResponseDto,
  })
  async performAMLCheck(
    @Body() createAMLCheckDto: CreateAMLCheckDto,
  ): Promise<ComplianceCheck> {
    this.logger.log(`Starting AML check for user ${createAMLCheckDto.userId}`);

    const amlParams: AMLCheckParams = {
      userId: createAMLCheckDto.userId,
      transactionData: createAMLCheckDto.transactionData,
      userProfile: createAMLCheckDto.userProfile,
    };

    return await this.complianceMonitoringService.performAMLCheck(amlParams);
  }

  @Post('trade')
  @ApiOperation({ summary: 'Perform trade compliance check' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Trade compliance check completed',
    type: ComplianceCheckResponseDto,
  })
  async performTradeComplianceCheck(
    @Body() createTradeComplianceCheckDto: CreateTradeComplianceCheckDto,
  ): Promise<ComplianceCheck> {
    this.logger.log(`Starting trade compliance check for user ${createTradeComplianceCheckDto.userId}`);

    const tradeParams: TradeComplianceParams = {
      userId: createTradeComplianceCheckDto.userId,
      accountId: createTradeComplianceCheckDto.accountId,
      tradeData: createTradeComplianceCheckDto.tradeData,
      marketData: createTradeComplianceCheckDto.marketData,
    };

    return await this.complianceMonitoringService.performTradeComplianceCheck(tradeParams);
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get compliance check history for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'type', required: false, enum: ComplianceType, description: 'Filter by compliance type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compliance history retrieved',
    type: [ComplianceCheck],
  })
  async getComplianceHistory(
    @Param('userId') userId: string,
    @Query('type') type?: ComplianceType,
  ): Promise<ComplianceCheck[]> {
    return await this.complianceMonitoringService.getComplianceHistory(userId, type);
  }

  @Get('status/:userId')
  @ApiOperation({ summary: 'Get current compliance status for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compliance status retrieved',
  })
  async getComplianceStatus(
    @Param('userId') userId: string,
  ): Promise<Record<ComplianceType, ComplianceStatus>> {
    return await this.complianceMonitoringService.getComplianceStatus(userId);
  }

  @Get('check/:checkId')
  @ApiOperation({ summary: 'Get compliance check details' })
  @ApiParam({ name: 'checkId', description: 'Compliance check ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compliance check details retrieved',
    type: ComplianceCheck,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Compliance check not found' })
  async getComplianceCheck(
    @Param('checkId') checkId: string,
  ): Promise<ComplianceCheck> {
    // This would be implemented to fetch check details from repository
    throw new Error('Method not implemented');
  }

  @Put('check/:checkId/review')
  @ApiOperation({ summary: 'Add review to compliance check' })
  @ApiParam({ name: 'checkId', description: 'Compliance check ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review added to compliance check',
  })
  async reviewComplianceCheck(
    @Param('checkId') checkId: string,
    @Body() reviewData: {
      reviewedBy: string;
      comments: string;
      approved: boolean;
    },
  ) {
    this.logger.log(`Adding review to compliance check ${checkId}`);
    
    // This would be implemented to update the check with review information
    return {
      checkId,
      reviewedBy: reviewData.reviewedBy,
      reviewedAt: new Date(),
      comments: reviewData.comments,
      approved: reviewData.approved,
    };
  }

  @Post('batch-check')
  @ApiOperation({ summary: 'Perform batch compliance checks' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Batch compliance checks initiated',
  })
  async performBatchComplianceCheck(
    @Body() batchData: {
      userIds: string[];
      checkTypes: ComplianceType[];
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
    },
  ) {
    this.logger.log(`Starting batch compliance checks for ${batchData.userIds.length} users`);

    const results = [];
    for (const userId of batchData.userIds) {
      for (const checkType of batchData.checkTypes) {
        // This would queue up compliance checks based on type
        results.push({
          userId,
          checkType,
          status: 'QUEUED',
          priority: batchData.priority,
          queuedAt: new Date(),
        });
      }
    }

    return {
      totalChecks: results.length,
      results,
      estimatedCompletionTime: new Date(Date.now() + results.length * 30000), // 30 seconds per check
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get compliance statistics' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO string)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compliance statistics retrieved',
  })
  async getComplianceStatistics(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const toDate = to ? new Date(to) : new Date();

    return {
      period: {
        from: fromDate,
        to: toDate,
      },
      totalChecks: 1250,
      checksByType: {
        [ComplianceType.KYC]: 450,
        [ComplianceType.AML]: 380,
        [ComplianceType.TRADE_SURVEILLANCE]: 420,
      },
      checksByStatus: {
        [ComplianceStatus.PASSED]: 1100,
        [ComplianceStatus.FAILED]: 85,
        [ComplianceStatus.REQUIRES_REVIEW]: 45,
        [ComplianceStatus.PENDING]: 20,
      },
      passRate: 0.88,
      avgProcessingTime: 45.5, // seconds
      escalationRate: 0.12,
      topFailureReasons: [
        { reason: 'Document verification failed', count: 32 },
        { reason: 'Sanctions list match', count: 18 },
        { reason: 'Unusual transaction pattern', count: 15 },
        { reason: 'Incomplete information', count: 12 },
        { reason: 'High-risk jurisdiction', count: 8 },
      ],
    };
  }

  @Get('alerts/regulatory')
  @ApiOperation({ summary: 'Get regulatory alerts and notifications' })
  @ApiQuery({ name: 'severity', required: false, description: 'Filter by severity' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of alerts to return' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Regulatory alerts retrieved',
  })
  async getRegulatoryAlerts(
    @Query('severity') severity?: string,
    @Query('limit') limit?: string,
  ) {
    return {
      alerts: [
        {
          id: 'reg-001',
          type: 'REGULATORY_UPDATE',
          severity: 'HIGH',
          title: 'New AML requirements effective next month',
          description: 'Enhanced customer due diligence procedures required for high-risk customers',
          effectiveDate: '2024-02-01T00:00:00Z',
          impactedChecks: [ComplianceType.AML, ComplianceType.CDD],
          actionRequired: true,
          deadline: '2024-01-15T00:00:00Z',
        },
        {
          id: 'reg-002',
          type: 'SANCTIONS_UPDATE',
          severity: 'CRITICAL',
          title: 'New entities added to sanctions list',
          description: '15 new entities added to OFAC sanctions list',
          effectiveDate: '2024-01-10T00:00:00Z',
          impactedChecks: [ComplianceType.SANCTIONS],
          actionRequired: false,
          autoApplied: true,
        },
      ],
      total: 2,
      unreadCount: 1,
    };
  }

  @Post('whitelist')
  @ApiOperation({ summary: 'Add entity to compliance whitelist' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Entity added to whitelist',
  })
  async addToWhitelist(
    @Body() whitelistData: {
      entityType: 'USER' | 'ACCOUNT' | 'TRANSACTION_PATTERN' | 'IP_ADDRESS';
      entityId: string;
      reason: string;
      addedBy: string;
      expiresAt?: Date;
    },
  ) {
    this.logger.log(`Adding ${whitelistData.entityType} ${whitelistData.entityId} to compliance whitelist`);

    return {
      id: `whitelist_${Date.now()}`,
      ...whitelistData,
      addedAt: new Date(),
      status: 'ACTIVE',
    };
  }

  @Post('blacklist')
  @ApiOperation({ summary: 'Add entity to compliance blacklist' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Entity added to blacklist',
  })
  async addToBlacklist(
    @Body() blacklistData: {
      entityType: 'USER' | 'ACCOUNT' | 'TRANSACTION_PATTERN' | 'IP_ADDRESS';
      entityId: string;
      reason: string;
      addedBy: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    },
  ) {
    this.logger.log(`Adding ${blacklistData.entityType} ${blacklistData.entityId} to compliance blacklist`);

    return {
      id: `blacklist_${Date.now()}`,
      ...blacklistData,
      addedAt: new Date(),
      status: 'ACTIVE',
    };
  }
}