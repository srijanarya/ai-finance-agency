import { Controller, Post, Get, Body, Query, UseGuards, Logger, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ContentQualityService } from '../services/content-quality.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export class ContentQualityRequestDto {
  content: string;
  contentType: string;
}

export class ContentQualityBatchRequestDto {
  items: Array<{
    content: string;
    contentType: string;
    id: string;
  }>;
}

export class QualityAnalyticsRequestDto {
  assessments: any[];
}

@ApiTags('content-quality')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('content-quality')
export class ContentQualityController {
  private readonly logger = new Logger(ContentQualityController.name);

  constructor(private readonly contentQualityService: ContentQualityService) {}

  @Post('assess')
  @ApiOperation({ summary: 'Assess content quality using multi-agent approach' })
  @ApiBody({ type: ContentQualityRequestDto })
  @ApiResponse({ status: 200, description: 'Content quality assessment completed' })
  async assessQuality(@Body() request: ContentQualityRequestDto) {
    try {
      this.logger.log('Starting content quality assessment', {
        contentLength: request.content.length,
        contentType: request.contentType,
      });

      const assessment = await this.contentQualityService.assessQuality(
        request.content,
        request.contentType,
      );

      this.logger.log('Content quality assessment completed', {
        overallScore: assessment.overallScore,
        agentScores: assessment.agentScores,
      });

      return assessment;
    } catch (error) {
      this.logger.error('Content quality assessment failed', {
        error: error.message,
        contentType: request.contentType,
      });
      throw error;
    }
  }

  @Post('assess-batch')
  @ApiOperation({ summary: 'Assess quality for multiple content items' })
  @ApiBody({ type: ContentQualityBatchRequestDto })
  @ApiResponse({ status: 200, description: 'Batch quality assessment completed' })
  async assessQualityBatch(@Body() request: ContentQualityBatchRequestDto) {
    try {
      this.logger.log('Starting batch quality assessment', {
        itemCount: request.items.length,
      });

      const results = await this.contentQualityService.assessQualityBatch(request.items);

      this.logger.log('Batch quality assessment completed', {
        processedCount: results.length,
        averageScore: results.reduce((sum, r) => sum + r.assessment.overallScore, 0) / results.length,
      });

      return results;
    } catch (error) {
      this.logger.error('Batch quality assessment failed', {
        error: error.message,
        itemCount: request.items?.length,
      });
      throw error;
    }
  }

  @Post('monitor-realtime')
  @ApiOperation({ summary: 'Start real-time quality monitoring' })
  @ApiBody({ type: ContentQualityRequestDto })
  @ApiResponse({ status: 200, description: 'Real-time quality monitoring started' })
  async monitorQualityRealTime(
    @Body() request: ContentQualityRequestDto,
    @Query('checkInterval') checkInterval: number = 5000,
  ) {
    try {
      return await this.contentQualityService.monitorQualityRealTime(
        request.content,
        request.contentType,
        checkInterval,
      );
    } catch (error) {
      this.logger.error('Real-time quality monitoring failed', {
        error: error.message,
        contentType: request.contentType,
      });
      throw error;
    }
  }

  @Post('analytics')
  @ApiOperation({ summary: 'Generate quality analytics and insights' })
  @ApiBody({ type: QualityAnalyticsRequestDto })
  @ApiResponse({ status: 200, description: 'Quality analytics generated successfully' })
  async getQualityAnalytics(@Body() request: QualityAnalyticsRequestDto) {
    try {
      return await this.contentQualityService.getQualityAnalytics(request.assessments);
    } catch (error) {
      this.logger.error('Quality analytics generation failed', {
        error: error.message,
        assessmentCount: request.assessments?.length,
      });
      throw error;
    }
  }

  @Get('standards')
  @ApiOperation({ summary: 'Get quality standards and thresholds' })
  @ApiResponse({ status: 200, description: 'Quality standards retrieved successfully' })
  getQualityStandards() {
    return {
      overallScoreThreshold: 8.0,
      minimumReadabilityScore: 6.0,
      agentThresholds: {
        grammarAgent: 7.0,
        factualAgent: 8.0,
        engagementAgent: 6.0,
        clarityAgent: 7.0,
        complianceAgent: 8.5,
      },
      scoreCategories: {
        excellent: { min: 9.0, max: 10.0 },
        good: { min: 7.0, max: 8.9 },
        fair: { min: 5.0, max: 6.9 },
        poor: { min: 1.0, max: 4.9 },
      },
    };
  }

  @Get('recommendations/:factor')
  @ApiOperation({ summary: 'Get improvement recommendations for specific quality factor' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  getRecommendations(@Param('factor') factor: string) {
    try {
      const recommendations = {
        clarity: [
          'Use shorter sentences and paragraphs',
          'Add clear headings and subheadings',
          'Improve logical flow and transitions',
          'Define technical terms',
        ],
        accuracy: [
          'Verify all financial facts and figures',
          'Add source citations',
          'Update outdated information',
          'Cross-check data consistency',
        ],
        engagement: [
          'Use active voice instead of passive',
          'Add compelling examples and case studies',
          'Include rhetorical questions',
          'Strengthen call-to-action statements',
        ],
        grammar: [
          'Check for spelling errors',
          'Fix punctuation issues',
          'Ensure subject-verb agreement',
          'Maintain consistent tense',
        ],
        compliance: [
          'Add required disclaimers',
          'Include risk warnings',
          'Ensure regulatory compliance',
          'Remove prohibited language',
        ],
      };

      return {
        factor,
        recommendations: recommendations[factor as keyof typeof recommendations] || [],
      };
    } catch (error) {
      this.logger.error('Failed to get recommendations', {
        factor,
        error: error.message,
      });
      throw error;
    }
  }
}