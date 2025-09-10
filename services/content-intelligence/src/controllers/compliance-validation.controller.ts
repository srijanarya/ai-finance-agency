import { Controller, Post, Get, Body, Query, UseGuards, Logger, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ComplianceValidationService } from '../services/compliance/compliance-validation.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export class ComplianceValidationRequestDto {
  content: string;
  contentType: string;
  targetAudience?: string;
  jurisdictions?: string[];
  regulatoryFrameworks?: string[];
  riskTolerance?: 'low' | 'medium' | 'high';
}

export class ComplianceBatchRequestDto {
  items: Array<{
    id: string;
    content: string;
    contentType: string;
    metadata?: Record<string, any>;
  }>;
  targetAudience?: string;
  jurisdictions?: string[];
  regulatoryFrameworks?: string[];
}

export class ComplianceReportRequestDto {
  validations: any[];
  period?: string;
  includeRecommendations?: boolean;
}

export class ComplianceUpdateRequestDto {
  ruleId: string;
  updates: Record<string, any>;
  reason: string;
}

@ApiTags('compliance-validation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('compliance-validation')
export class ComplianceValidationController {
  private readonly logger = new Logger(ComplianceValidationController.name);

  constructor(private readonly complianceValidationService: ComplianceValidationService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate content against compliance rules' })
  @ApiBody({ type: ComplianceValidationRequestDto })
  @ApiResponse({ status: 200, description: 'Compliance validation completed successfully' })
  async validateContent(@Body() request: ComplianceValidationRequestDto) {
    try {
      this.logger.log('Starting compliance validation', {
        contentLength: request.content.length,
        contentType: request.contentType,
        jurisdictions: request.jurisdictions,
        frameworks: request.regulatoryFrameworks,
      });

      const validation = await this.complianceValidationService.validateContent({
        content: request.content,
        contentType: request.contentType,
        targetAudience: request.targetAudience || 'general',
        publishChannel: request.jurisdictions?.[0],
        metadata: {
          jurisdictions: request.jurisdictions,
          regulatoryFrameworks: request.regulatoryFrameworks,
          riskTolerance: request.riskTolerance
        }
      });

      this.logger.log('Compliance validation completed', {
        overallScore: validation.overallScore,
        violationCount: validation.violations?.length || 0,
        isCompliant: validation.isCompliant,
      });

      return validation;
    } catch (error) {
      this.logger.error('Compliance validation failed', {
        error: error.message,
        contentType: request.contentType,
        jurisdictions: request.jurisdictions,
      });
      throw error;
    }
  }

  @Post('validate-batch')
  @ApiOperation({ summary: 'Validate multiple content items for compliance' })
  @ApiBody({ type: ComplianceBatchRequestDto })
  @ApiResponse({ status: 200, description: 'Batch compliance validation completed successfully' })
  async validateContentBatch(@Body() request: ComplianceBatchRequestDto) {
    try {
      this.logger.log('Starting batch compliance validation', {
        itemCount: request.items.length,
        jurisdictions: request.jurisdictions,
        frameworks: request.regulatoryFrameworks,
      });

      const results = await this.complianceValidationService.validateContentBatch(
        request.items,
        request.targetAudience,
        request.jurisdictions,
        request.regulatoryFrameworks,
      );

      this.logger.log('Batch compliance validation completed', {
        processedCount: results.length,
        averageCompliance: results.reduce((sum, r) => sum + (r.validation.overallCompliance ? 1 : 0), 0) / results.length,
        totalViolations: results.reduce((sum, r) => sum + (r.validation.violations?.length || 0), 0),
      });

      return results;
    } catch (error) {
      this.logger.error('Batch compliance validation failed', {
        error: error.message,
        itemCount: request.items?.length,
      });
      throw error;
    }
  }

  @Post('auto-correct')
  @ApiOperation({ summary: 'Auto-correct content compliance issues' })
  @ApiBody({ type: ComplianceValidationRequestDto })
  @ApiResponse({ status: 200, description: 'Content auto-correction completed successfully' })
  async autoCorrectContent(@Body() request: ComplianceValidationRequestDto) {
    try {
      this.logger.log('Starting compliance auto-correction', {
        contentLength: request.content.length,
        contentType: request.contentType,
        frameworks: request.regulatoryFrameworks,
      });

      const correction = await this.complianceValidationService.autoCorrectContent(
        request.content,
        request.contentType,
        request.jurisdictions,
        request.regulatoryFrameworks,
      );

      this.logger.log('Compliance auto-correction completed', {
        correctionsMade: correction.corrections?.length || 0,
        confidenceScore: correction.confidenceScore,
        remainingIssues: correction.remainingIssues?.length || 0,
      });

      return correction;
    } catch (error) {
      this.logger.error('Compliance auto-correction failed', {
        error: error.message,
        contentType: request.contentType,
      });
      throw error;
    }
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get available compliance rules' })
  @ApiQuery({ name: 'framework', description: 'Regulatory framework filter', required: false })
  @ApiQuery({ name: 'jurisdiction', description: 'Jurisdiction filter', required: false })
  @ApiQuery({ name: 'category', description: 'Rule category filter', required: false })
  @ApiResponse({ status: 200, description: 'Compliance rules retrieved successfully' })
  async getComplianceRules(
    @Query('framework') framework?: string,
    @Query('jurisdiction') jurisdiction?: string,
    @Query('category') category?: string,
  ) {
    try {
      this.logger.log('Fetching compliance rules', { framework, jurisdiction, category });

      const rules = await this.complianceValidationService.getComplianceRules(
        framework,
        jurisdiction,
        category,
      );

      this.logger.log('Compliance rules retrieved', {
        ruleCount: rules.length,
        framework,
        jurisdiction,
      });

      return rules;
    } catch (error) {
      this.logger.error('Failed to get compliance rules', {
        error: error.message,
        framework,
        jurisdiction,
      });
      throw error;
    }
  }

  @Get('frameworks')
  @ApiOperation({ summary: 'Get available regulatory frameworks' })
  @ApiResponse({ status: 200, description: 'Regulatory frameworks retrieved successfully' })
  getRegulatoryFrameworks() {
    try {
      return this.complianceValidationService.getAvailableFrameworks();
    } catch (error) {
      this.logger.error('Failed to get regulatory frameworks', {
        error: error.message,
      });
      throw error;
    }
  }

  @Get('jurisdictions')
  @ApiOperation({ summary: 'Get supported jurisdictions' })
  @ApiResponse({ status: 200, description: 'Jurisdictions retrieved successfully' })
  getSupportedJurisdictions() {
    try {
      return this.complianceValidationService.getSupportedJurisdictions();
    } catch (error) {
      this.logger.error('Failed to get jurisdictions', {
        error: error.message,
      });
      throw error;
    }
  }

  @Post('audit-trail')
  @ApiOperation({ summary: 'Generate compliance audit trail report' })
  @ApiBody({ type: ComplianceReportRequestDto })
  @ApiResponse({ status: 200, description: 'Audit trail report generated successfully' })
  async generateAuditTrail(@Body() request: ComplianceReportRequestDto) {
    try {
      this.logger.log('Generating audit trail report', {
        validationCount: request.validations?.length || 0,
        period: request.period,
        includeRecommendations: request.includeRecommendations,
      });

      const auditTrail = await this.complianceValidationService.generateAuditTrail(
        request.validations,
        request.period,
        request.includeRecommendations,
      );

      this.logger.log('Audit trail report generated', {
        reportId: auditTrail.reportId,
        totalValidations: auditTrail.summary?.totalValidations,
        complianceRate: auditTrail.summary?.complianceRate,
      });

      return auditTrail;
    } catch (error) {
      this.logger.error('Failed to generate audit trail', {
        error: error.message,
        validationCount: request.validations?.length,
      });
      throw error;
    }
  }

  @Get('checklist/:framework')
  @ApiOperation({ summary: 'Get compliance checklist for specific framework' })
  @ApiResponse({ status: 200, description: 'Compliance checklist retrieved successfully' })
  async getComplianceChecklist(
    @Param('framework') framework: string,
    @Query('contentType') contentType?: string,
  ) {
    try {
      this.logger.log('Fetching compliance checklist', { framework, contentType });

      const checklist = await this.complianceValidationService.getComplianceChecklist(
        framework,
        contentType,
      );

      this.logger.log('Compliance checklist retrieved', {
        framework,
        checklistItems: checklist.items?.length || 0,
      });

      return checklist;
    } catch (error) {
      this.logger.error('Failed to get compliance checklist', {
        error: error.message,
        framework,
        contentType,
      });
      throw error;
    }
  }

  @Post('rules/update')
  @ApiOperation({ summary: 'Update compliance rule configuration' })
  @ApiBody({ type: ComplianceUpdateRequestDto })
  @ApiResponse({ status: 200, description: 'Compliance rule updated successfully' })
  async updateComplianceRule(@Body() request: ComplianceUpdateRequestDto) {
    try {
      this.logger.log('Updating compliance rule', {
        ruleId: request.ruleId,
        reason: request.reason,
      });

      const result = await this.complianceValidationService.updateComplianceRule(
        request.ruleId,
        request.updates,
        request.reason,
      );

      this.logger.log('Compliance rule updated successfully', {
        ruleId: request.ruleId,
        updatedFields: Object.keys(request.updates),
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to update compliance rule', {
        error: error.message,
        ruleId: request.ruleId,
      });
      throw error;
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get compliance analytics and insights' })
  @ApiQuery({ name: 'period', description: 'Analytics period', required: false })
  @ApiQuery({ name: 'framework', description: 'Framework filter', required: false })
  @ApiResponse({ status: 200, description: 'Compliance analytics retrieved successfully' })
  async getComplianceAnalytics(
    @Query('period') period: string = '30d',
    @Query('framework') framework?: string,
  ) {
    try {
      this.logger.log('Fetching compliance analytics', { period, framework });

      const analytics = await this.complianceValidationService.getComplianceAnalytics(
        period,
        framework,
      );

      this.logger.log('Compliance analytics retrieved', {
        period,
        framework,
        metricsCount: Object.keys(analytics).length,
      });

      return analytics;
    } catch (error) {
      this.logger.error('Failed to get compliance analytics', {
        error: error.message,
        period,
        framework,
      });
      throw error;
    }
  }

  @Get('risk-assessment/:contentType')
  @ApiOperation({ summary: 'Get risk assessment guidelines for content type' })
  @ApiResponse({ status: 200, description: 'Risk assessment guidelines retrieved successfully' })
  getRiskAssessmentGuidelines(@Param('contentType') contentType: string) {
    try {
      this.logger.log('Fetching risk assessment guidelines', { contentType });

      const guidelines = this.complianceValidationService.getRiskAssessmentGuidelines(contentType);

      this.logger.log('Risk assessment guidelines retrieved', {
        contentType,
        guidelineCount: guidelines.guidelines?.length || 0,
      });

      return guidelines;
    } catch (error) {
      this.logger.error('Failed to get risk assessment guidelines', {
        error: error.message,
        contentType,
      });
      throw error;
    }
  }
}