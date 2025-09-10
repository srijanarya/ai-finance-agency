import { Controller, Post, Get, Put, Body, Query, UseGuards, Logger, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PersonalizationService } from '../services/personalization.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export class PersonalizeContentRequestDto {
  content: string;
  userId: string;
  contentType: string;
  targetPlatform?: string;
  personalizationLevel?: 'basic' | 'advanced' | 'deep';
}

export class UserProfileUpdateDto {
  userId: string;
  profileData: {
    demographics?: Record<string, any>;
    preferences?: Record<string, any>;
    investmentProfile?: Record<string, any>;
    behaviorData?: Record<string, any>;
  };
}

export class ContentRecommendationRequestDto {
  userId: string;
  contentTypes?: string[];
  limit?: number;
  excludeViewed?: boolean;
  includeRationale?: boolean;
}

export class PersonalizationBatchRequestDto {
  items: Array<{
    id: string;
    content: string;
    contentType: string;
    userId: string;
    metadata?: Record<string, any>;
  }>;
  personalizationLevel?: 'basic' | 'advanced' | 'deep';
}

export class ABTestRequestDto {
  testName: string;
  variants: Array<{
    id: string;
    content: string;
    personalizationStrategy: string;
  }>;
  userId: string;
  duration?: number;
}

@ApiTags('personalization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('personalization')
export class PersonalizationController {
  private readonly logger = new Logger(PersonalizationController.name);

  constructor(private readonly personalizationService: PersonalizationService) {}

  @Post('personalize')
  @ApiOperation({ summary: 'Personalize content for specific user' })
  @ApiBody({ type: PersonalizeContentRequestDto })
  @ApiResponse({ status: 200, description: 'Content personalization completed successfully' })
  async personalizeContent(@Body() request: PersonalizeContentRequestDto) {
    try {
      this.logger.log('Starting content personalization', {
        userId: request.userId,
        contentLength: request.content.length,
        contentType: request.contentType,
        targetPlatform: request.targetPlatform,
        personalizationLevel: request.personalizationLevel,
      });

      const personalizedContent = await this.personalizationService.personalizeContent(
        request.content,
        request.userId,
        request.contentType,
        request.targetPlatform,
        request.personalizationLevel,
      );

      this.logger.log('Content personalization completed', {
        userId: request.userId,
        personalizedLength: personalizedContent.content?.length,
        personalizationScore: personalizedContent.personalizationScore,
        appliedStrategies: personalizedContent.appliedStrategies?.length || 0,
      });

      return personalizedContent;
    } catch (error) {
      this.logger.error('Content personalization failed', {
        error: error.message,
        userId: request.userId,
        contentType: request.contentType,
      });
      throw error;
    }
  }

  @Post('personalize-batch')
  @ApiOperation({ summary: 'Personalize multiple content items' })
  @ApiBody({ type: PersonalizationBatchRequestDto })
  @ApiResponse({ status: 200, description: 'Batch content personalization completed successfully' })
  async personalizeContentBatch(@Body() request: PersonalizationBatchRequestDto) {
    try {
      this.logger.log('Starting batch content personalization', {
        itemCount: request.items.length,
        personalizationLevel: request.personalizationLevel,
        uniqueUsers: new Set(request.items.map(i => i.userId)).size,
      });

      const results = await this.personalizationService.personalizeContentBatch(
        request.items,
        request.personalizationLevel,
      );

      this.logger.log('Batch content personalization completed', {
        processedCount: results.length,
        averageScore: results.reduce((sum, r) => sum + (r.personalizedContent.personalizationScore || 0), 0) / results.length,
      });

      return results;
    } catch (error) {
      this.logger.error('Batch content personalization failed', {
        error: error.message,
        itemCount: request.items?.length,
      });
      throw error;
    }
  }

  @Get('profile/:userId')
  @ApiOperation({ summary: 'Get user personalization profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getUserProfile(@Param('userId') userId: string) {
    try {
      this.logger.log('Fetching user profile', { userId });

      const profile = await this.personalizationService.getUserProfile(userId);

      this.logger.log('User profile retrieved', {
        userId,
        profileCompleteness: profile.completeness,
        lastUpdated: profile.lastUpdated,
      });

      return profile;
    } catch (error) {
      this.logger.error('Failed to get user profile', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  @Put('profile/:userId')
  @ApiOperation({ summary: 'Update user personalization profile' })
  @ApiBody({ type: UserProfileUpdateDto })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  async updateUserProfile(@Param('userId') userId: string, @Body() request: UserProfileUpdateDto) {
    try {
      this.logger.log('Updating user profile', {
        userId,
        updateFields: Object.keys(request.profileData),
      });

      const updatedProfile = await this.personalizationService.updateUserProfile(
        userId,
        request.profileData,
      );

      this.logger.log('User profile updated successfully', {
        userId,
        newCompleteness: updatedProfile.completeness,
      });

      return updatedProfile;
    } catch (error) {
      this.logger.error('Failed to update user profile', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  @Post('recommendations')
  @ApiOperation({ summary: 'Get personalized content recommendations' })
  @ApiBody({ type: ContentRecommendationRequestDto })
  @ApiResponse({ status: 200, description: 'Content recommendations generated successfully' })
  async getContentRecommendations(@Body() request: ContentRecommendationRequestDto) {
    try {
      this.logger.log('Generating content recommendations', {
        userId: request.userId,
        contentTypes: request.contentTypes,
        limit: request.limit,
        excludeViewed: request.excludeViewed,
      });

      const recommendations = await this.personalizationService.getContentRecommendations(
        request.userId,
        request.contentTypes,
        request.limit,
        request.excludeViewed,
        request.includeRationale,
      );

      this.logger.log('Content recommendations generated', {
        userId: request.userId,
        recommendationCount: recommendations.items?.length || 0,
        averageScore: recommendations.averageRelevanceScore,
      });

      return recommendations;
    } catch (error) {
      this.logger.error('Failed to generate content recommendations', {
        error: error.message,
        userId: request.userId,
      });
      throw error;
    }
  }

  @Post('ab-test')
  @ApiOperation({ summary: 'Run A/B test for personalization strategies' })
  @ApiBody({ type: ABTestRequestDto })
  @ApiResponse({ status: 200, description: 'A/B test initiated successfully' })
  async runABTest(@Body() request: ABTestRequestDto) {
    try {
      this.logger.log('Starting A/B test', {
        testName: request.testName,
        variantCount: request.variants.length,
        userId: request.userId,
        duration: request.duration,
      });

      const testResult = await this.personalizationService.runABTest(
        request.testName,
        request.variants,
        request.userId,
        request.duration,
      );

      this.logger.log('A/B test initiated', {
        testId: testResult.testId,
        selectedVariant: testResult.selectedVariant,
        testName: request.testName,
      });

      return testResult;
    } catch (error) {
      this.logger.error('Failed to run A/B test', {
        error: error.message,
        testName: request.testName,
        userId: request.userId,
      });
      throw error;
    }
  }

  @Get('segments')
  @ApiOperation({ summary: 'Get available user segments' })
  @ApiResponse({ status: 200, description: 'User segments retrieved successfully' })
  async getUserSegments() {
    try {
      this.logger.log('Fetching user segments');

      const segments = await this.personalizationService.getUserSegments();

      this.logger.log('User segments retrieved', {
        segmentCount: segments.length,
      });

      return segments;
    } catch (error) {
      this.logger.error('Failed to get user segments', {
        error: error.message,
      });
      throw error;
    }
  }

  @Get('strategies')
  @ApiOperation({ summary: 'Get available personalization strategies' })
  @ApiQuery({ name: 'contentType', description: 'Filter by content type', required: false })
  @ApiResponse({ status: 200, description: 'Personalization strategies retrieved successfully' })
  async getPersonalizationStrategies(@Query('contentType') contentType?: string) {
    try {
      this.logger.log('Fetching personalization strategies', { contentType });

      const strategies = await this.personalizationService.getPersonalizationStrategies(contentType);

      this.logger.log('Personalization strategies retrieved', {
        strategyCount: strategies.length,
        contentType,
      });

      return strategies;
    } catch (error) {
      this.logger.error('Failed to get personalization strategies', {
        error: error.message,
        contentType,
      });
      throw error;
    }
  }

  @Get('analytics/:userId')
  @ApiOperation({ summary: 'Get personalization analytics for user' })
  @ApiQuery({ name: 'period', description: 'Analytics period', required: false })
  @ApiResponse({ status: 200, description: 'Personalization analytics retrieved successfully' })
  async getPersonalizationAnalytics(
    @Param('userId') userId: string,
    @Query('period') period: string = '30d',
  ) {
    try {
      this.logger.log('Fetching personalization analytics', { userId, period });

      const analytics = await this.personalizationService.getPersonalizationAnalytics(userId, period);

      this.logger.log('Personalization analytics retrieved', {
        userId,
        period,
        metricsCount: Object.keys(analytics).length,
      });

      return analytics;
    } catch (error) {
      this.logger.error('Failed to get personalization analytics', {
        error: error.message,
        userId,
        period,
      });
      throw error;
    }
  }

  @Post('engagement/track')
  @ApiOperation({ summary: 'Track user engagement with personalized content' })
  @ApiResponse({ status: 200, description: 'Engagement tracked successfully' })
  async trackEngagement(
    @Body() engagementData: {
      userId: string;
      contentId: string;
      engagementType: string;
      duration?: number;
      metadata?: Record<string, any>;
    },
  ) {
    try {
      this.logger.log('Tracking user engagement', {
        userId: engagementData.userId,
        contentId: engagementData.contentId,
        engagementType: engagementData.engagementType,
      });

      const result = await this.personalizationService.trackEngagement(
        engagementData.userId,
        engagementData.contentId,
        engagementData.engagementType,
        engagementData.duration,
        engagementData.metadata,
      );

      this.logger.log('Engagement tracked successfully', {
        userId: engagementData.userId,
        contentId: engagementData.contentId,
        engagementId: result.engagementId,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to track engagement', {
        error: error.message,
        userId: engagementData?.userId,
        contentId: engagementData?.contentId,
      });
      throw error;
    }
  }

  @Get('performance/summary')
  @ApiOperation({ summary: 'Get personalization performance summary' })
  @ApiQuery({ name: 'period', description: 'Analysis period', required: false })
  @ApiResponse({ status: 200, description: 'Performance summary retrieved successfully' })
  async getPerformanceSummary(@Query('period') period: string = '7d') {
    try {
      this.logger.log('Fetching personalization performance summary', { period });

      const summary = await this.personalizationService.getPerformanceSummary(period);

      this.logger.log('Performance summary retrieved', {
        period,
        totalPersonalizations: summary.totalPersonalizations,
        averageScore: summary.averagePersonalizationScore,
      });

      return summary;
    } catch (error) {
      this.logger.error('Failed to get performance summary', {
        error: error.message,
        period,
      });
      throw error;
    }
  }
}