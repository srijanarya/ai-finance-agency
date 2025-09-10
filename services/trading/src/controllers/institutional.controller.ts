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
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { InstitutionalTradingService } from '../services/institutional-trading.service';
import { CurrentUserDto } from '../dto/auth.dto';
import {
  CreateInstitutionalOrderDto,
  BulkOrderDto,
  InstitutionalOrderSearchDto,
  InstitutionalOrderResponseDto,
  RiskLimitsDto,
  ComplianceSettingsDto,
  TradingPermissionsDto,
  InstitutionalReportDto,
  ExecutionQualityReportDto,
  BestExecutionReportDto,
} from '../dto/institutional.dto';

@ApiTags('Institutional Trading')
@ApiBearerAuth()
@Controller('institutional')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstitutionalController {
  constructor(
    private readonly institutionalTradingService: InstitutionalTradingService,
  ) {}

  // Large Order Management
  @Post('orders/large')
  @Roles('institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Create large institutional order with smart execution' })
  @ApiResponse({ status: 201, type: InstitutionalOrderResponseDto })
  async createLargeOrder(
    @Body() orderDto: CreateInstitutionalOrderDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<InstitutionalOrderResponseDto> {
    return this.institutionalTradingService.createLargeOrder(orderDto, user.tenantId, user.id);
  }

  @Post('orders/bulk')
  @Roles('institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Execute bulk orders with optimization' })
  @ApiResponse({ status: 201, type: [InstitutionalOrderResponseDto] })
  async executeBulkOrders(
    @Body() bulkOrderDto: BulkOrderDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<InstitutionalOrderResponseDto[]> {
    return this.institutionalTradingService.executeBulkOrders(bulkOrderDto, user.tenantId, user.id);
  }

  @Get('orders')
  @Roles('institutional_trader', 'portfolio_manager', 'compliance_officer', 'admin')
  @ApiOperation({ summary: 'Search institutional orders with advanced filters' })
  @ApiResponse({ status: 200, type: [InstitutionalOrderResponseDto] })
  async searchOrders(
    @Query() searchDto: InstitutionalOrderSearchDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{ orders: InstitutionalOrderResponseDto[]; total: number; page: number; limit: number }> {
    return this.institutionalTradingService.searchOrders(searchDto, user.tenantId);
  }

  @Get('orders/:orderId')
  @Roles('institutional_trader', 'portfolio_manager', 'compliance_officer', 'admin')
  @ApiOperation({ summary: 'Get detailed institutional order information' })
  @ApiResponse({ status: 200, type: InstitutionalOrderResponseDto })
  async getOrderDetails(
    @Param('orderId') orderId: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<InstitutionalOrderResponseDto> {
    return this.institutionalTradingService.getOrderDetails(orderId, user.tenantId);
  }

  @Put('orders/:orderId/cancel')
  @Roles('institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Cancel institutional order' })
  @ApiResponse({ status: 200, type: InstitutionalOrderResponseDto })
  async cancelOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<InstitutionalOrderResponseDto> {
    return this.institutionalTradingService.cancelOrder(orderId, user.tenantId, user.id);
  }

  // Risk Management
  @Get('risk/limits')
  @Roles('institutional_trader', 'portfolio_manager', 'risk_manager', 'admin')
  @ApiOperation({ summary: 'Get current risk limits and utilization' })
  @ApiResponse({ status: 200, type: RiskLimitsDto })
  async getRiskLimits(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RiskLimitsDto> {
    return this.institutionalTradingService.getRiskLimits(user.tenantId);
  }

  @Put('risk/limits')
  @Roles('risk_manager', 'admin')
  @ApiOperation({ summary: 'Update risk limits for tenant' })
  @ApiResponse({ status: 200, type: RiskLimitsDto })
  async updateRiskLimits(
    @Body() riskLimitsDto: RiskLimitsDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RiskLimitsDto> {
    return this.institutionalTradingService.updateRiskLimits(riskLimitsDto, user.tenantId, user.id);
  }

  @Get('risk/monitoring')
  @Roles('institutional_trader', 'portfolio_manager', 'risk_manager', 'admin')
  @ApiOperation({ summary: 'Get real-time risk monitoring data' })
  @ApiResponse({ status: 200 })
  async getRiskMonitoring(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<any> {
    return this.institutionalTradingService.getRiskMonitoring(user.tenantId);
  }

  // Compliance Management
  @Get('compliance/settings')
  @Roles('compliance_officer', 'admin')
  @ApiOperation({ summary: 'Get compliance settings for tenant' })
  @ApiResponse({ status: 200, type: ComplianceSettingsDto })
  async getComplianceSettings(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<ComplianceSettingsDto> {
    return this.institutionalTradingService.getComplianceSettings(user.tenantId);
  }

  @Put('compliance/settings')
  @Roles('compliance_officer', 'admin')
  @ApiOperation({ summary: 'Update compliance settings' })
  @ApiResponse({ status: 200, type: ComplianceSettingsDto })
  async updateComplianceSettings(
    @Body() complianceDto: ComplianceSettingsDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<ComplianceSettingsDto> {
    return this.institutionalTradingService.updateComplianceSettings(complianceDto, user.tenantId, user.id);
  }

  @Get('compliance/violations')
  @Roles('compliance_officer', 'admin')
  @ApiOperation({ summary: 'Get compliance violations and alerts' })
  @ApiResponse({ status: 200 })
  async getComplianceViolations(
    @CurrentUser() user: CurrentUserDto,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.institutionalTradingService.getComplianceViolations(
      user.tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Trading Permissions
  @Get('permissions')
  @Roles('institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get trading permissions for current user' })
  @ApiResponse({ status: 200, type: TradingPermissionsDto })
  async getTradingPermissions(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<TradingPermissionsDto> {
    return this.institutionalTradingService.getTradingPermissions(user.id, user.tenantId);
  }

  @Put('permissions/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Update trading permissions for user' })
  @ApiResponse({ status: 200, type: TradingPermissionsDto })
  async updateTradingPermissions(
    @Param('userId') userId: string,
    @Body() permissionsDto: TradingPermissionsDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<TradingPermissionsDto> {
    return this.institutionalTradingService.updateTradingPermissions(
      userId,
      permissionsDto,
      user.tenantId,
      user.id,
    );
  }

  // Execution Quality & Best Execution
  @Get('execution/quality')
  @Roles('institutional_trader', 'portfolio_manager', 'compliance_officer', 'admin')
  @ApiOperation({ summary: 'Get execution quality report' })
  @ApiResponse({ status: 200, type: ExecutionQualityReportDto })
  async getExecutionQuality(
    @CurrentUser() user: CurrentUserDto,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('symbol') symbol?: string,
  ): Promise<ExecutionQualityReportDto> {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
    return this.institutionalTradingService.getExecutionQuality(
      user.tenantId,
      new Date(startDate),
      new Date(endDate),
      symbol,
    );
  }

  @Get('execution/best-execution')
  @Roles('institutional_trader', 'portfolio_manager', 'compliance_officer', 'admin')
  @ApiOperation({ summary: 'Get best execution analysis' })
  @ApiResponse({ status: 200, type: BestExecutionReportDto })
  async getBestExecutionReport(
    @CurrentUser() user: CurrentUserDto,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<BestExecutionReportDto> {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
    return this.institutionalTradingService.getBestExecutionReport(
      user.tenantId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // Reporting & Analytics
  @Get('reports/trading')
  @Roles('institutional_trader', 'portfolio_manager', 'compliance_officer', 'admin')
  @ApiOperation({ summary: 'Generate institutional trading report' })
  @ApiResponse({ status: 200, type: InstitutionalReportDto })
  async generateTradingReport(
    @CurrentUser() user: CurrentUserDto,
    @Query('reportType') reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json',
  ): Promise<InstitutionalReportDto | Buffer> {
    return this.institutionalTradingService.generateTradingReport(
      user.tenantId,
      reportType,
      format,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('reports/custom')
  @Roles('portfolio_manager', 'compliance_officer', 'admin')
  @ApiOperation({ summary: 'Generate custom institutional report' })
  @ApiResponse({ status: 200 })
  async generateCustomReport(
    @Body() reportConfig: any,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<any> {
    return this.institutionalTradingService.generateCustomReport(reportConfig, user.tenantId, user.id);
  }

  @Post('reports/regulatory')
  @Roles('compliance_officer', 'admin')
  @ApiOperation({ summary: 'Generate regulatory reporting files' })
  @ApiResponse({ status: 200 })
  async generateRegulatoryReport(
    @Body() reportConfig: {
      reportType: 'mifid2' | 'finra' | 'sec' | 'custom';
      period: string;
      includeDetails: boolean;
    },
    @CurrentUser() user: CurrentUserDto,
  ): Promise<any> {
    return this.institutionalTradingService.generateRegulatoryReport(reportConfig, user.tenantId, user.id);
  }

  // Document Management
  @Post('documents/upload')
  @Roles('institutional_trader', 'portfolio_manager', 'compliance_officer', 'admin')
  @ApiOperation({ summary: 'Upload trading-related documents' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadDocuments(
    @CurrentUser() user: CurrentUserDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('documentType') documentType: string,
    @Body('orderId') orderId?: string,
  ): Promise<{ documentIds: string[]; message: string }> {
    return this.institutionalTradingService.uploadDocuments(
      files,
      documentType,
      user.tenantId,
      user.id,
      orderId,
    );
  }

  @Get('documents')
  @Roles('institutional_trader', 'portfolio_manager', 'compliance_officer', 'admin')
  @ApiOperation({ summary: 'Get trading documents' })
  @ApiResponse({ status: 200 })
  async getDocuments(
    @CurrentUser() user: CurrentUserDto,
    @Query('documentType') documentType?: string,
    @Query('orderId') orderId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    return this.institutionalTradingService.getDocuments(
      user.tenantId,
      { documentType, orderId, page, limit },
    );
  }

  // Real-time Market Data & Streaming
  @Get('market-data/subscription')
  @Roles('institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get market data subscription status' })
  @ApiResponse({ status: 200 })
  async getMarketDataSubscription(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<any> {
    return this.institutionalTradingService.getMarketDataSubscription(user.tenantId);
  }

  @Post('market-data/subscribe')
  @Roles('admin')
  @ApiOperation({ summary: 'Subscribe to premium market data feeds' })
  @ApiResponse({ status: 200 })
  async subscribeToMarketData(
    @Body() subscriptionDto: {
      feeds: string[];
      symbols: string[];
      level: 'level1' | 'level2' | 'full_depth';
    },
    @CurrentUser() user: CurrentUserDto,
  ): Promise<any> {
    return this.institutionalTradingService.subscribeToMarketData(subscriptionDto, user.tenantId, user.id);
  }

  // Algorithm Configuration
  @Get('algorithms')
  @Roles('institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get available trading algorithms' })
  @ApiResponse({ status: 200 })
  async getTradingAlgorithms(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<any> {
    return this.institutionalTradingService.getTradingAlgorithms(user.tenantId);
  }

  @Post('algorithms/configure')
  @Roles('portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Configure custom trading algorithm' })
  @ApiResponse({ status: 201 })
  async configureAlgorithm(
    @Body() algorithmConfig: any,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<any> {
    return this.institutionalTradingService.configureAlgorithm(algorithmConfig, user.tenantId, user.id);
  }

  // Performance Analytics
  @Get('analytics/performance')
  @Roles('institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get institutional trading performance analytics' })
  @ApiResponse({ status: 200 })
  async getPerformanceAnalytics(
    @CurrentUser() user: CurrentUserDto,
    @Query('period') period: '1d' | '1w' | '1m' | '3m' | '1y' = '1m',
    @Query('benchmark') benchmark?: string,
  ): Promise<any> {
    return this.institutionalTradingService.getPerformanceAnalytics(user.tenantId, period, benchmark);
  }

  @Get('analytics/attribution')
  @Roles('portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get performance attribution analysis' })
  @ApiResponse({ status: 200 })
  async getPerformanceAttribution(
    @CurrentUser() user: CurrentUserDto,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('portfolioId') portfolioId?: string,
  ): Promise<any> {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
    return this.institutionalTradingService.getPerformanceAttribution(
      user.tenantId,
      new Date(startDate),
      new Date(endDate),
      portfolioId,
    );
  }
}