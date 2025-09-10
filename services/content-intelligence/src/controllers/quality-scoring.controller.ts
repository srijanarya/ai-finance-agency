import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Logger,
  BadRequestException,
  Req,
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
import { Request } from 'express';

import { QualityScoringService } from '../services/quality-scoring/quality-scoring.service';
import {
  AssessContentDto,
  BatchAssessContentDto,
  QualityAssessmentResponseDto,
  BatchQualityAssessmentResponseDto,
  QualityAnalyticsDto,
} from '../dto/quality-scoring/quality-scoring.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
  };
}

@ApiTags('Quality Scoring')
@Controller('quality')
@UseGuards(ThrottlerGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class QualityScoringController {
  private readonly logger = new Logger(QualityScoringController.name);

  constructor(private readonly qualityScoringService: QualityScoringService) {}

  @Post('assess')
  @ApiOperation({
    summary: 'Assess content quality using multi-agent system',
    description: 'Performs comprehensive quality assessment using specialized AI agents for readability, accuracy, compliance, and engagement analysis.'
  })
  @ApiResponse({
    status: 201,
    description: 'Quality assessment completed successfully',
    type: QualityAssessmentResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid content or assessment parameters' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async assessContent(@Body() assessDto: AssessContentDto): Promise<QualityAssessmentResponseDto> {
    try {
      this.logger.log(`Assessing content quality: ${assessDto.contentType} (${assessDto.content.length} chars)`);

      const request = {
        content: assessDto.content,
        contentType: assessDto.contentType,
        targetAudience: assessDto.targetAudience,
        industry: assessDto.industry,
        language: assessDto.language,
        assessmentCriteria: assessDto.assessmentCriteria,
      };

      const response = await this.qualityScoringService.assessQuality(request);

      return {
        id: response.id,
        overallScore: response.overallScore,
        passed: response.passed,
        assessmentDate: response.assessmentDate,
        detailed: {
          readability: {
            fleschScore: response.detailed.readability.fleschScore,
            gradeLevel: response.detailed.readability.gradeLevel,
            sentenceComplexity: response.detailed.readability.sentenceComplexity,
            vocabularyComplexity: response.detailed.readability.vocabularyComplexity,
            structureClarity: response.detailed.readability.structureClarity,
            overallReadability: response.detailed.readability.overallReadability,
          },
          accuracy: {
            factualAccuracy: response.detailed.accuracy.factualAccuracy,
            sourceCredibility: response.detailed.accuracy.sourceCredibility,
            dataConsistency: response.detailed.accuracy.dataConsistency,
            logicalCoherence: response.detailed.accuracy.logicalCoherence,
            evidenceSupport: response.detailed.accuracy.evidenceSupport,
            overallAccuracy: response.detailed.accuracy.overallAccuracy,
          },
          compliance: {
            regulatoryCompliance: response.detailed.compliance.regulatoryCompliance,
            ethicalStandards: response.detailed.compliance.ethicalStandards,
            disclosureAdequacy: response.detailed.compliance.disclosureAdequacy,
            riskWarnings: response.detailed.compliance.riskWarnings,
            legalCompliance: response.detailed.compliance.legalCompliance,
            overallCompliance: response.detailed.compliance.overallCompliance,
          },
          engagement: {
            contentAppeal: response.detailed.engagement.contentAppeal,
            audienceRelevance: response.detailed.engagement.audienceRelevance,
            emotionalImpact: response.detailed.engagement.emotionalImpact,
            callToActionEffectiveness: response.detailed.engagement.callToActionEffectiveness,
            shareability: response.detailed.engagement.shareability,
            overallEngagement: response.detailed.engagement.overallEngagement,
          },
          technical: {
            grammarAccuracy: response.detailed.technical.grammarAccuracy,
            spellingAccuracy: response.detailed.technical.spellingAccuracy,
            punctuationAccuracy: response.detailed.technical.punctuationAccuracy,
            styleConsistency: response.detailed.technical.styleConsistency,
            formatCompliance: response.detailed.technical.formatCompliance,
            overallTechnical: response.detailed.technical.overallTechnical,
          },
          financial: {
            marketAnalysisDepth: response.detailed.financial.marketAnalysisDepth,
            riskAssessmentQuality: response.detailed.financial.riskAssessmentQuality,
            dataAccuracy: response.detailed.financial.dataAccuracy,
            professionalTone: response.detailed.financial.professionalTone,
            industryExpertise: response.detailed.financial.industryExpertise,
            overallFinancialQuality: response.detailed.financial.overallFinancialQuality,
          },
        },
        agentAssessments: response.agentAssessments.map(assessment => ({
          agentId: assessment.agentId,
          agentName: assessment.agentName,
          specialty: assessment.specialty,
          score: assessment.score,
          confidence: assessment.confidence,
          reasoning: assessment.reasoning,
          issues: assessment.issues.map(issue => ({
            type: issue.type,
            severity: issue.severity,
            description: issue.description,
            location: issue.location,
            suggestion: issue.suggestion,
            impact: issue.impact,
          })),
          suggestions: assessment.suggestions,
          processingTime: assessment.processingTime,
        })),
        improvements: response.improvements.map(improvement => ({
          category: improvement.category,
          priority: improvement.priority,
          description: improvement.description,
          impact: improvement.impact,
          effort: improvement.effort,
          examples: improvement.examples,
          resources: improvement.resources,
        })),
        confidence: response.confidence,
        processingTime: response.processingTime,
      };
    } catch (error) {
      this.logger.error(`Quality assessment failed: ${error.message}`);
      throw error;
    }
  }

  @Post('assess/batch')
  @ApiOperation({
    summary: 'Assess multiple pieces of content for quality',
    description: 'Performs batch quality assessment with parallel processing and concurrency control for efficiency.'
  })
  @ApiResponse({
    status: 201,
    description: 'Batch quality assessment completed',
    type: BatchQualityAssessmentResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid batch assessment request' })
  async assessBatchContent(@Body() batchDto: BatchAssessContentDto): Promise<BatchQualityAssessmentResponseDto> {
    try {
      this.logger.log(`Assessing batch content quality: ${batchDto.requests.length} items`);

      const startTime = Date.now();

      const requests = batchDto.requests.map(dto => ({
        content: dto.content,
        contentType: dto.contentType,
        targetAudience: dto.targetAudience,
        industry: dto.industry,
        language: dto.language,
        assessmentCriteria: dto.assessmentCriteria,
      }));

      const results = await this.qualityScoringService.assessBatchQuality(
        requests,
        {
          parallel: batchDto.parallel,
          maxConcurrency: batchDto.maxConcurrency,
        }
      );

      const processingTime = Date.now() - startTime;
      const successCount = results.length;
      const failureCount = batchDto.requests.length - successCount;
      const averageScore = results.length > 0 
        ? results.reduce((sum, r) => sum + r.overallScore, 0) / results.length 
        : 0;
      const passRate = results.length > 0 
        ? (results.filter(r => r.passed).length / results.length) * 100 
        : 0;

      return {
        results: results.map(result => ({
          id: result.id,
          overallScore: result.overallScore,
          passed: result.passed,
          assessmentDate: result.assessmentDate,
          detailed: result.detailed as any,
          agentAssessments: result.agentAssessments as any,
          improvements: result.improvements as any,
          confidence: result.confidence,
          processingTime: result.processingTime,
        })),
        totalCount: batchDto.requests.length,
        successCount,
        failureCount,
        errors: [], // Could be enhanced to track specific errors
        processingTime,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Batch quality assessment failed: ${error.message}`);
      throw error;
    }
  }

  @Get('assessment/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get quality assessment by ID',
    description: 'Retrieves a specific quality assessment with detailed scores and recommendations.'
  })
  @ApiParam({ name: 'id', description: 'Assessment ID' })
  @ApiResponse({
    status: 200,
    description: 'Assessment retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Assessment not found' })
  async getAssessment(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<any> {
    try {
      this.logger.log(`Retrieving assessment: ${id} for user: ${req.user?.sub}`);

      const assessment = await this.qualityScoringService.getAssessment(id, req.user?.sub);

      return {
        id: assessment.id,
        content: assessment.content,
        contentType: assessment.contentType,
        targetAudience: assessment.targetAudience,
        industry: assessment.industry,
        language: assessment.language,
        overallScore: assessment.overallScore,
        passed: assessment.passed,
        confidence: assessment.confidence,
        detailedScores: assessment.detailedScores,
        agentAssessments: assessment.agentAssessments,
        qualityIssues: assessment.qualityIssues,
        improvements: assessment.improvements,
        issueSummary: assessment.getIssueDistribution(),
        qualityGrade: assessment.getQualityGrade(),
        strengths: assessment.getStrengths(),
        improvementAreas: assessment.getTopImprovementAreas(),
        recommendedActions: assessment.getRecommendedActions(),
        processingTime: assessment.processingTime,
        createdAt: assessment.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve assessment ${id}: ${error.message}`);
      throw error;
    }
  }

  @Get('assessments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user quality assessments with pagination',
    description: 'Retrieves user\'s quality assessments with filtering and pagination options.'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'contentType', required: false, description: 'Filter by content type' })
  @ApiQuery({ name: 'passed', required: false, description: 'Filter by pass status' })
  @ApiResponse({
    status: 200,
    description: 'Assessments retrieved successfully'
  })
  async getUserAssessments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('contentType') contentType?: string,
    @Query('passed') passed?: boolean,
    @Req() req: AuthenticatedRequest
  ): Promise<any> {
    try {
      this.logger.log(`Retrieving assessments for user: ${req.user?.sub}`);

      if (limit > 100) {
        throw new BadRequestException('Limit cannot exceed 100');
      }

      const result = await this.qualityScoringService.getUserAssessments(req.user?.sub!, {
        page: Number(page),
        limit: Number(limit),
        contentType,
        passed: passed !== undefined ? Boolean(passed) : undefined,
      });

      return {
        assessments: result.assessments.map(assessment => ({
          id: assessment.id,
          contentType: assessment.contentType,
          targetAudience: assessment.targetAudience,
          overallScore: assessment.overallScore,
          qualityGrade: assessment.getQualityGrade(),
          passed: assessment.passed,
          hasCriticalIssues: assessment.hasCriticalIssues(),
          issueCount: assessment.totalIssueCount,
          confidence: assessment.confidence,
          strengths: assessment.getStrengths(),
          improvementAreas: assessment.getTopImprovementAreas(),
          summary: assessment.getScoreSummary(),
          createdAt: assessment.createdAt,
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          pages: result.pages,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve user assessments: ${error.message}`);
      throw error;
    }
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get quality analytics and trends',
    description: 'Retrieves comprehensive quality analytics including score distributions, trends, and performance metrics.'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics (ISO string)' })
  @ApiQuery({ name: 'contentType', required: false, description: 'Filter by content type' })
  @ApiQuery({ name: 'targetAudience', required: false, description: 'Filter by target audience' })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully'
  })
  async getQualityAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('contentType') contentType?: string,
    @Query('targetAudience') targetAudience?: string,
    @Req() req: AuthenticatedRequest
  ): Promise<any> {
    try {
      this.logger.log(`Retrieving quality analytics for user: ${req.user?.sub}`);

      let timeRange: { start: Date; end: Date } | undefined;
      if (startDate && endDate) {
        timeRange = {
          start: new Date(startDate),
          end: new Date(endDate),
        };
      }

      const analytics = await this.qualityScoringService.getQualityAnalytics(req.user?.sub, timeRange);

      return {
        summary: {
          totalAssessments: analytics.summary.totalAssessments,
          passedAssessments: analytics.summary.passedAssessments,
          passRate: Math.round(analytics.summary.passRate * 100) / 100,
          averageScore: Math.round(analytics.summary.averageScore * 100) / 100,
          timeRange: timeRange ? {
            start: timeRange.start,
            end: timeRange.end,
          } : null,
        },
        scoreDistribution: analytics.distributions.scoreDistribution,
        issueDistribution: analytics.distributions.issueDistribution,
        contentTypeDistribution: analytics.distributions.contentTypeDistribution,
        insights: {
          qualityTrend: analytics.summary.averageScore >= 7 ? 'improving' : 'needs_attention',
          mostCommonIssues: this.getMostCommonIssues(analytics.distributions.issueDistribution),
          recommendedFocus: this.getRecommendedFocus(analytics.summary.averageScore, analytics.distributions.issueDistribution),
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve quality analytics: ${error.message}`);
      throw error;
    }
  }

  @Get('benchmarks/:contentType')
  @ApiOperation({
    summary: 'Get quality benchmarks for content type',
    description: 'Retrieves industry benchmarks and quality standards for specific content types.'
  })
  @ApiParam({ name: 'contentType', description: 'Content type for benchmarks' })
  @ApiResponse({
    status: 200,
    description: 'Benchmarks retrieved successfully'
  })
  async getQualityBenchmarks(@Param('contentType') contentType: string): Promise<any> {
    try {
      this.logger.log(`Retrieving quality benchmarks for: ${contentType}`);

      // This would typically fetch from a benchmarks database or service
      const benchmarks = this.generateMockBenchmarks(contentType);

      return {
        contentType,
        benchmarks: {
          industry: {
            averageScore: benchmarks.industryAverage,
            topPerformers: benchmarks.topPerformers,
            minimumAcceptable: benchmarks.minimumAcceptable,
          },
          scoreRanges: {
            excellent: { min: 9, max: 10, description: 'Industry leading quality' },
            good: { min: 7.5, max: 8.9, description: 'Above average quality' },
            acceptable: { min: 6, max: 7.4, description: 'Meets basic standards' },
            needsImprovement: { min: 1, max: 5.9, description: 'Below industry standards' },
          },
          recommendations: benchmarks.recommendations,
        },
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve benchmarks for ${contentType}: ${error.message}`);
      throw error;
    }
  }

  private getMostCommonIssues(issueDistribution: any): string[] {
    const issues = Object.entries(issueDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([issue]) => issue);

    return issues;
  }

  private getRecommendedFocus(averageScore: number, issueDistribution: any): string[] {
    const recommendations: string[] = [];

    if (averageScore < 6) {
      recommendations.push('Focus on fundamental quality improvements');
    }

    if (issueDistribution.critical > 0) {
      recommendations.push('Address critical compliance and accuracy issues');
    }

    if (issueDistribution.high > issueDistribution.medium) {
      recommendations.push('Prioritize high-severity issue resolution');
    }

    if (averageScore >= 8) {
      recommendations.push('Focus on excellence and optimization');
    }

    return recommendations.length > 0 ? recommendations : ['Continue maintaining quality standards'];
  }

  private generateMockBenchmarks(contentType: string): any {
    // Mock benchmarks - in production, this would come from actual industry data
    const benchmarkMap: { [key: string]: any } = {
      'market_analysis': {
        industryAverage: 7.2,
        topPerformers: 8.8,
        minimumAcceptable: 6.5,
        recommendations: [
          'Include current market data and trends',
          'Provide clear risk assessments',
          'Use credible source citations',
        ],
      },
      'research_report': {
        industryAverage: 7.8,
        topPerformers: 9.1,
        minimumAcceptable: 7.0,
        recommendations: [
          'Ensure methodology transparency',
          'Include comprehensive data analysis',
          'Provide actionable recommendations',
        ],
      },
      'newsletter': {
        industryAverage: 6.9,
        topPerformers: 8.5,
        minimumAcceptable: 6.0,
        recommendations: [
          'Focus on audience engagement',
          'Include relevant market updates',
          'Maintain consistent publishing schedule',
        ],
      },
    };

    return benchmarkMap[contentType] || {
      industryAverage: 7.0,
      topPerformers: 8.5,
      minimumAcceptable: 6.0,
      recommendations: [
        'Focus on content clarity and accuracy',
        'Ensure proper compliance measures',
        'Improve reader engagement',
      ],
    };
  }
}