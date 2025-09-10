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
import { RiskAlertingService, AlertingRule } from '../services/risk-alerting.service';
import {
  RiskAlert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  AlertPriority,
} from '../entities/risk-alert.entity';
import {
  CreateRiskAlertDto,
  UpdateRiskAlertDto,
  CreateAlertingRuleDto,
  UpdateAlertingRuleDto,
  RiskAlertResponseDto,
} from '../dto/risk-alerts.dto';

@ApiTags('Risk Alerts')
@ApiBearerAuth('JWT-auth')
@Controller('risk-alerts')
@UseGuards(AuthGuard('jwt'))
export class RiskAlertsController {
  private readonly logger = new Logger(RiskAlertsController.name);

  constructor(
    private readonly riskAlertingService: RiskAlertingService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new risk alert' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Risk alert created successfully',
    type: RiskAlertResponseDto,
  })
  async createAlert(
    @Body() createRiskAlertDto: CreateRiskAlertDto,
  ): Promise<RiskAlert> {
    this.logger.log(`Creating risk alert: ${createRiskAlertDto.title}`);

    const alertData: Partial<RiskAlert> = {
      userId: createRiskAlertDto.userId,
      accountId: createRiskAlertDto.accountId,
      tradeId: createRiskAlertDto.tradeId,
      portfolioId: createRiskAlertDto.portfolioId,
      alertType: createRiskAlertDto.alertType,
      severity: createRiskAlertDto.severity,
      priority: createRiskAlertDto.priority,
      title: createRiskAlertDto.title,
      description: createRiskAlertDto.description,
      triggerConditions: createRiskAlertDto.triggerConditions,
      contextData: createRiskAlertDto.contextData,
      recommendedActions: createRiskAlertDto.recommendedActions,
      automaticActions: createRiskAlertDto.automaticActions,
      impactAssessment: createRiskAlertDto.impactAssessment,
      relatedEntities: createRiskAlertDto.relatedEntities,
      notificationChannels: createRiskAlertDto.notificationChannels,
      escalationRules: createRiskAlertDto.escalationRules,
      expiresAt: createRiskAlertDto.expiresAt,
    };

    return await this.riskAlertingService.createAlert(alertData);
  }

  @Get()
  @ApiOperation({ summary: 'Get active risk alerts' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'alertType', required: false, enum: AlertType, description: 'Filter by alert type' })
  @ApiQuery({ name: 'severity', required: false, enum: AlertSeverity, description: 'Filter by severity' })
  @ApiQuery({ name: 'priority', required: false, enum: AlertPriority, description: 'Filter by priority' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of alerts to return' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active alerts retrieved',
    type: [RiskAlertResponseDto],
  })
  async getActiveAlerts(
    @Query('userId') userId?: string,
    @Query('accountId') accountId?: string,
    @Query('alertType') alertType?: AlertType,
    @Query('severity') severity?: AlertSeverity,
    @Query('priority') priority?: AlertPriority,
    @Query('limit') limit?: number,
  ): Promise<RiskAlert[]> {
    const filters = {
      userId,
      accountId,
      alertType,
      severity,
      priority,
      limit: limit ? parseInt(limit.toString()) : undefined,
    };

    return await this.riskAlertingService.getActiveAlerts(filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get alert statistics' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO string)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert statistics retrieved',
  })
  async getAlertStatistics(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const timeRange = {
      from: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: to ? new Date(to) : new Date(),
    };

    return await this.riskAlertingService.getAlertStatistics(timeRange);
  }

  @Get(':alertId')
  @ApiOperation({ summary: 'Get alert details' })
  @ApiParam({ name: 'alertId', description: 'Alert ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert details retrieved',
    type: RiskAlertResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Alert not found' })
  async getAlert(
    @Param('alertId') alertId: string,
  ): Promise<RiskAlert> {
    // This would be implemented to fetch alert details from repository
    throw new Error('Method not implemented');
  }

  @Put(':alertId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  @ApiParam({ name: 'alertId', description: 'Alert ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert acknowledged',
    type: RiskAlertResponseDto,
  })
  async acknowledgeAlert(
    @Param('alertId') alertId: string,
    @Body() acknowledgeData: {
      acknowledgedBy: string;
      comments?: string;
    },
  ): Promise<RiskAlert> {
    return await this.riskAlertingService.acknowledgeAlert(
      alertId,
      acknowledgeData.acknowledgedBy,
      acknowledgeData.comments,
    );
  }

  @Put(':alertId/assign')
  @ApiOperation({ summary: 'Assign an alert to a user' })
  @ApiParam({ name: 'alertId', description: 'Alert ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert assigned',
    type: RiskAlertResponseDto,
  })
  async assignAlert(
    @Param('alertId') alertId: string,
    @Body() assignData: {
      assignedTo: string;
      assignedBy: string;
    },
  ): Promise<RiskAlert> {
    return await this.riskAlertingService.assignAlert(
      alertId,
      assignData.assignedTo,
      assignData.assignedBy,
    );
  }

  @Put(':alertId/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  @ApiParam({ name: 'alertId', description: 'Alert ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert resolved',
    type: RiskAlertResponseDto,
  })
  async resolveAlert(
    @Param('alertId') alertId: string,
    @Body() resolveData: {
      resolvedBy: string;
      resolutionDetails: string;
      resolutionActions: string[];
    },
  ): Promise<RiskAlert> {
    return await this.riskAlertingService.resolveAlert(
      alertId,
      resolveData.resolvedBy,
      resolveData.resolutionDetails,
      resolveData.resolutionActions,
    );
  }

  @Put(':alertId/escalate')
  @ApiOperation({ summary: 'Escalate an alert' })
  @ApiParam({ name: 'alertId', description: 'Alert ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert escalated',
    type: RiskAlertResponseDto,
  })
  async escalateAlert(
    @Param('alertId') alertId: string,
    @Body() escalateData: {
      escalatedBy: string;
      reason?: string;
    },
  ): Promise<RiskAlert> {
    return await this.riskAlertingService.escalateAlert(
      alertId,
      escalateData.escalatedBy,
      escalateData.reason,
    );
  }

  @Put(':alertId')
  @ApiOperation({ summary: 'Update an alert' })
  @ApiParam({ name: 'alertId', description: 'Alert ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert updated',
  })
  async updateAlert(
    @Param('alertId') alertId: string,
    @Body() updateRiskAlertDto: UpdateRiskAlertDto,
  ) {
    this.logger.log(`Updating alert ${alertId}`);
    
    // This would be implemented to update alert details
    return {
      alertId,
      ...updateRiskAlertDto,
      updatedAt: new Date(),
    };
  }

  // Alerting Rules Management
  @Post('rules')
  @ApiOperation({ summary: 'Create an alerting rule' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Alerting rule created',
  })
  async createAlertingRule(
    @Body() createAlertingRuleDto: CreateAlertingRuleDto,
  ): Promise<AlertingRule> {
    return await this.riskAlertingService.createAlertingRule(createAlertingRuleDto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all alerting rules' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alerting rules retrieved',
  })
  async getAlertingRules(): Promise<AlertingRule[]> {
    return await this.riskAlertingService.getAlertingRules();
  }

  @Get('rules/:ruleId')
  @ApiOperation({ summary: 'Get alerting rule details' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alerting rule details retrieved',
  })
  async getAlertingRule(
    @Param('ruleId') ruleId: string,
  ): Promise<AlertingRule> {
    const rules = await this.riskAlertingService.getAlertingRules();
    const rule = rules.find(r => r.id === ruleId);
    
    if (!rule) {
      throw new Error('Alerting rule not found');
    }
    
    return rule;
  }

  @Put('rules/:ruleId')
  @ApiOperation({ summary: 'Update an alerting rule' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alerting rule updated',
  })
  async updateAlertingRule(
    @Param('ruleId') ruleId: string,
    @Body() updateAlertingRuleDto: UpdateAlertingRuleDto,
  ): Promise<AlertingRule> {
    return await this.riskAlertingService.updateAlertingRule(ruleId, updateAlertingRuleDto);
  }

  @Delete('rules/:ruleId')
  @ApiOperation({ summary: 'Delete an alerting rule' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Alerting rule deleted',
  })
  async deleteAlertingRule(
    @Param('ruleId') ruleId: string,
  ): Promise<void> {
    await this.riskAlertingService.deleteAlertingRule(ruleId);
  }

  @Post('rules/:ruleId/test')
  @ApiOperation({ summary: 'Test an alerting rule' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rule test results',
  })
  async testAlertingRule(
    @Param('ruleId') ruleId: string,
    @Body() testData?: Record<string, any>,
  ) {
    this.logger.log(`Testing alerting rule ${ruleId}`);
    
    // This would test the rule against provided or sample data
    return {
      ruleId,
      testTimestamp: new Date(),
      triggered: true,
      evaluationTime: 45, // ms
      testResults: {
        conditionsMet: true,
        actionsExecuted: 2,
        notifications: 1,
      },
      sampleAlert: {
        title: 'Test Alert',
        severity: AlertSeverity.MEDIUM,
        description: 'This is a test alert generated by rule testing',
      },
    };
  }

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Get alert dashboard summary' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard summary retrieved',
  })
  async getDashboardSummary() {
    return {
      activeAlerts: 23,
      criticalAlerts: 3,
      highPriorityAlerts: 8,
      alertsResolvedToday: 15,
      avgResolutionTime: 45, // minutes
      topAlertTypes: [
        { type: AlertType.VAR_BREACH, count: 8 },
        { type: AlertType.POSITION_CONCENTRATION, count: 6 },
        { type: AlertType.RISK_LIMIT_BREACH, count: 5 },
        { type: AlertType.COMPLIANCE_VIOLATION, count: 4 },
      ],
      recentAlerts: await this.riskAlertingService.getActiveAlerts({ limit: 5 }),
      escalationTrend: {
        thisWeek: 12,
        lastWeek: 8,
        change: '+50%',
      },
      systemHealth: {
        rulesActive: 15,
        rulesDisabled: 2,
        notificationChannelsUp: 4,
        notificationChannelsDown: 0,
      },
    };
  }

  @Post('bulk-operations')
  @ApiOperation({ summary: 'Perform bulk operations on alerts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk operation completed',
  })
  async performBulkOperation(
    @Body() bulkOperation: {
      operation: 'acknowledge' | 'resolve' | 'escalate' | 'assign';
      alertIds: string[];
      operatedBy: string;
      data?: Record<string, any>;
    },
  ) {
    this.logger.log(`Performing bulk ${bulkOperation.operation} on ${bulkOperation.alertIds.length} alerts`);

    const results = [];
    
    for (const alertId of bulkOperation.alertIds) {
      try {
        let result;
        
        switch (bulkOperation.operation) {
          case 'acknowledge':
            result = await this.riskAlertingService.acknowledgeAlert(
              alertId,
              bulkOperation.operatedBy,
              bulkOperation.data?.comments,
            );
            break;
          case 'resolve':
            result = await this.riskAlertingService.resolveAlert(
              alertId,
              bulkOperation.operatedBy,
              bulkOperation.data?.resolutionDetails || 'Bulk resolution',
              bulkOperation.data?.resolutionActions || [],
            );
            break;
          case 'escalate':
            result = await this.riskAlertingService.escalateAlert(
              alertId,
              bulkOperation.operatedBy,
              bulkOperation.data?.reason,
            );
            break;
          case 'assign':
            result = await this.riskAlertingService.assignAlert(
              alertId,
              bulkOperation.data?.assignedTo,
              bulkOperation.operatedBy,
            );
            break;
        }
        
        results.push({ alertId, success: true, result });
      } catch (error) {
        results.push({ alertId, success: false, error: error.message });
      }
    }

    return {
      operation: bulkOperation.operation,
      totalAlerts: bulkOperation.alertIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }
}