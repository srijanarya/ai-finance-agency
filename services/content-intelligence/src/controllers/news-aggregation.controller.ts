import { Controller, Get, Post, Body, Query, UseGuards, Logger, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NewsAggregationService } from '../services/news-aggregation.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export class NewsAnalysisRequestDto {
  symbols?: string[];
  topics?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  timeframe?: string;
  limit?: number;
}

export class SentimentAnalysisRequestDto {
  content: string;
  context?: string;
  includeEmotions?: boolean;
  includeEntities?: boolean;
}

export class NewsBulkAnalysisRequestDto {
  articles: Array<{
    id: string;
    title: string;
    content: string;
    source?: string;
    publishedAt?: string;
  }>;
  includeDetailedAnalysis?: boolean;
}

@ApiTags('news-aggregation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('news-aggregation')
export class NewsAggregationController {
  private readonly logger = new Logger(NewsAggregationController.name);

  constructor(private readonly newsAggregationService: NewsAggregationService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get latest financial news' })
  @ApiQuery({ name: 'symbols', description: 'Comma-separated stock symbols', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of articles to return', required: false })
  @ApiQuery({ name: 'category', description: 'News category filter', required: false })
  @ApiResponse({ status: 200, description: 'Latest news retrieved successfully' })
  async getLatestNews(
    @Query('symbols') symbols?: string,
    @Query('limit') limit: number = 50,
    @Query('category') category?: string,
  ) {
    try {
      this.logger.log('Fetching latest news', { symbols, limit, category });

      const symbolsArray = symbols ? symbols.split(',').map(s => s.trim().toUpperCase()) : undefined;
      const news = await this.newsAggregationService.getLatestNews(symbolsArray, limit, category);

      this.logger.log('Latest news retrieved successfully', {
        articleCount: news.articles?.length || 0,
        symbols: symbolsArray,
      });

      return news;
    } catch (error) {
      this.logger.error('Failed to get latest news', {
        error: error.message,
        symbols,
        limit,
        category,
      });
      throw error;
    }
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze news for specific criteria' })
  @ApiBody({ type: NewsAnalysisRequestDto })
  @ApiResponse({ status: 200, description: 'News analysis completed successfully' })
  async analyzeNews(@Body() request: NewsAnalysisRequestDto) {
    try {
      this.logger.log('Starting news analysis', {
        symbols: request.symbols?.length,
        topics: request.topics?.length,
        sentiment: request.sentiment,
        timeframe: request.timeframe,
      });

      const analysis = await this.newsAggregationService.analyzeNews(
        request.symbols,
        request.topics,
        request.sentiment,
        request.timeframe,
        request.limit,
      );

      this.logger.log('News analysis completed', {
        analysisCount: analysis.articles?.length || 0,
        overallSentiment: analysis.overallSentiment,
      });

      return analysis;
    } catch (error) {
      this.logger.error('News analysis failed', {
        error: error.message,
        request,
      });
      throw error;
    }
  }

  @Post('sentiment/analyze')
  @ApiOperation({ summary: 'Analyze sentiment of specific content' })
  @ApiBody({ type: SentimentAnalysisRequestDto })
  @ApiResponse({ status: 200, description: 'Sentiment analysis completed successfully' })
  async analyzeSentiment(@Body() request: SentimentAnalysisRequestDto) {
    try {
      this.logger.log('Starting sentiment analysis', {
        contentLength: request.content.length,
        includeEmotions: request.includeEmotions,
        includeEntities: request.includeEntities,
      });

      const sentiment = await this.newsAggregationService.analyzeSentiment(
        request.content,
        request.context,
        request.includeEmotions,
        request.includeEntities,
      );

      this.logger.log('Sentiment analysis completed', {
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence,
        emotionCount: sentiment.emotions?.length || 0,
        entityCount: sentiment.entities?.length || 0,
      });

      return sentiment;
    } catch (error) {
      this.logger.error('Sentiment analysis failed', {
        error: error.message,
        contentLength: request.content?.length,
      });
      throw error;
    }
  }

  @Post('sentiment/batch')
  @ApiOperation({ summary: 'Analyze sentiment for multiple articles' })
  @ApiBody({ type: NewsBulkAnalysisRequestDto })
  @ApiResponse({ status: 200, description: 'Bulk sentiment analysis completed successfully' })
  async analyzeSentimentBatch(@Body() request: NewsBulkAnalysisRequestDto) {
    try {
      this.logger.log('Starting bulk sentiment analysis', {
        articleCount: request.articles.length,
        includeDetailedAnalysis: request.includeDetailedAnalysis,
      });

      const results = await this.newsAggregationService.analyzeSentimentBatch(
        request.articles,
        request.includeDetailedAnalysis,
      );

      this.logger.log('Bulk sentiment analysis completed', {
        processedCount: results.length,
        averageSentiment: results.reduce((sum, r) => sum + (r.sentiment?.confidence || 0), 0) / results.length,
      });

      return results;
    } catch (error) {
      this.logger.error('Bulk sentiment analysis failed', {
        error: error.message,
        articleCount: request.articles?.length,
      });
      throw error;
    }
  }

  @Get('trending/:symbol')
  @ApiOperation({ summary: 'Get trending topics for a specific symbol' })
  @ApiResponse({ status: 200, description: 'Trending topics retrieved successfully' })
  async getTrendingTopics(
    @Param('symbol') symbol: string,
    @Query('timeframe') timeframe: string = '24h',
    @Query('limit') limit: number = 10,
  ) {
    try {
      this.logger.log('Fetching trending topics', { symbol, timeframe, limit });

      const trends = await this.newsAggregationService.getTrendingTopics(
        symbol.toUpperCase(),
        timeframe,
        limit,
      );

      this.logger.log('Trending topics retrieved', {
        symbol,
        topicCount: trends.topics?.length || 0,
      });

      return trends;
    } catch (error) {
      this.logger.error('Failed to get trending topics', {
        error: error.message,
        symbol,
        timeframe,
      });
      throw error;
    }
  }

  @Get('sentiment/summary')
  @ApiOperation({ summary: 'Get overall market sentiment summary' })
  @ApiQuery({ name: 'timeframe', description: 'Time period for analysis', required: false })
  @ApiResponse({ status: 200, description: 'Market sentiment summary retrieved successfully' })
  async getMarketSentimentSummary(@Query('timeframe') timeframe: string = '24h') {
    try {
      this.logger.log('Fetching market sentiment summary', { timeframe });

      const summary = await this.newsAggregationService.getMarketSentimentSummary(timeframe);

      this.logger.log('Market sentiment summary retrieved', {
        overallSentiment: summary.overallSentiment,
        articleCount: summary.totalArticles,
      });

      return summary;
    } catch (error) {
      this.logger.error('Failed to get market sentiment summary', {
        error: error.message,
        timeframe,
      });
      throw error;
    }
  }

  @Get('sources')
  @ApiOperation({ summary: 'Get available news sources and their status' })
  @ApiResponse({ status: 200, description: 'News sources retrieved successfully' })
  getNewsSources() {
    try {
      return this.newsAggregationService.getAvailableSources();
    } catch (error) {
      this.logger.error('Failed to get news sources', {
        error: error.message,
      });
      throw error;
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get news and sentiment analytics' })
  @ApiQuery({ name: 'period', description: 'Analytics period', required: false })
  @ApiResponse({ status: 200, description: 'News analytics retrieved successfully' })
  async getNewsAnalytics(@Query('period') period: string = '7d') {
    try {
      this.logger.log('Fetching news analytics', { period });

      const analytics = await this.newsAggregationService.getNewsAnalytics(period);

      this.logger.log('News analytics retrieved', {
        period,
        metricsCount: Object.keys(analytics).length,
      });

      return analytics;
    } catch (error) {
      this.logger.error('Failed to get news analytics', {
        error: error.message,
        period,
      });
      throw error;
    }
  }
}