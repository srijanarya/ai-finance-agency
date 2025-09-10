import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  author?: string;
  publishedAt: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  categories: string[];
  tags: string[];
  relevanceScore: number;
  socialEngagement?: {
    shares: number;
    comments: number;
    reactions: number;
  };
}

export interface NewsAnalysis {
  topStories: NewsArticle[];
  sentimentOverview: {
    positive: number;
    negative: number;
    neutral: number;
    overallSentiment: 'positive' | 'negative' | 'neutral';
  };
  trendingTopics: Array<{
    topic: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  marketMovers: Array<{
    symbol: string;
    news: NewsArticle[];
    impact: 'high' | 'medium' | 'low';
  }>;
  lastUpdated: string;
}

@Injectable()
export class NewsAggregationService {
  private readonly logger = new Logger(NewsAggregationService.name);
  private cachedAnalysis: NewsAnalysis | null = null;
  private lastFetchTime = 0;
  private readonly cacheTimeoutMs = 10 * 60 * 1000; // 10 minutes

  // Financial news sources to aggregate from
  private readonly newsSources = [
    'bloomberg',
    'reuters',
    'financial-times',
    'wall-street-journal',
    'cnbc',
    'marketwatch',
    'yahoo-finance',
    'seeking-alpha',
    'benzinga',
    'the-motley-fool',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getLatestFinancialNews(): Promise<NewsAnalysis> {
    const now = Date.now();

    // Return cached analysis if still fresh
    if (this.cachedAnalysis && (now - this.lastFetchTime) < this.cacheTimeoutMs) {
      return this.cachedAnalysis;
    }

    try {
      const analysis = await this.aggregateAndAnalyzeNews();
      
      this.cachedAnalysis = analysis;
      this.lastFetchTime = now;

      this.logger.log('News analysis refreshed successfully', {
        totalStories: analysis.topStories.length,
        overallSentiment: analysis.sentimentOverview.overallSentiment,
      });

      return analysis;
    } catch (error) {
      this.logger.warn('Failed to fetch news analysis, returning cached or default data', {
        error: error.message,
      });

      return this.cachedAnalysis || this.getDefaultNewsAnalysis();
    }
  }

  private async aggregateAndAnalyzeNews(): Promise<NewsAnalysis> {
    try {
      // In production, you would integrate with news APIs like:
      // - News API (newsapi.org)
      // - Bloomberg API
      // - Reuters API
      // - Alpha Vantage News
      // - Finnhub News API
      // - Polygon.io News
      
      // For now, we'll use mock data with realistic structure
      const articles = await this.fetchNewsArticles();
      const processedArticles = await this.processArticles(articles);

      return {
        topStories: processedArticles.slice(0, 10),
        sentimentOverview: this.calculateSentimentOverview(processedArticles),
        trendingTopics: this.identifyTrendingTopics(processedArticles),
        marketMovers: this.identifyMarketMovers(processedArticles),
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to aggregate and analyze news', { error: error.message });
      throw error;
    }
  }

  private async fetchNewsArticles(): Promise<NewsArticle[]> {
    // Mock implementation - in production, fetch from real news APIs
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'Federal Reserve Signals Dovish Stance Amid Inflation Concerns',
        summary: 'The Fed indicated potential rate cuts in the coming quarters as inflation shows signs of cooling.',
        source: 'Bloomberg',
        author: 'Janet Smith',
        publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        url: 'https://example.com/fed-signals-dovish',
        sentiment: 'positive',
        sentimentScore: 0.7,
        categories: ['monetary-policy', 'federal-reserve', 'interest-rates'],
        tags: ['Fed', 'interest rates', 'inflation', 'dovish'],
        relevanceScore: 0.95,
        socialEngagement: {
          shares: 1250,
          comments: 340,
          reactions: 2100,
        },
      },
      {
        id: '2',
        title: 'Tech Giants Report Strong Q3 Earnings Despite Market Headwinds',
        summary: 'Major technology companies exceeded expectations with robust revenue growth and positive guidance.',
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        url: 'https://example.com/tech-earnings-q3',
        sentiment: 'positive',
        sentimentScore: 0.8,
        categories: ['earnings', 'technology', 'stocks'],
        tags: ['tech stocks', 'earnings', 'Q3', 'revenue'],
        relevanceScore: 0.88,
        socialEngagement: {
          shares: 890,
          comments: 210,
          reactions: 1560,
        },
      },
      {
        id: '3',
        title: 'Oil Prices Surge as OPEC+ Extends Production Cuts',
        summary: 'Crude oil futures jumped 3% following OPEC+ decision to maintain supply restrictions through Q2.',
        source: 'Wall Street Journal',
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        url: 'https://example.com/oil-opec-cuts',
        sentiment: 'neutral',
        sentimentScore: 0.1,
        categories: ['commodities', 'oil', 'opec'],
        tags: ['oil prices', 'OPEC', 'production cuts', 'crude'],
        relevanceScore: 0.82,
        socialEngagement: {
          shares: 670,
          comments: 180,
          reactions: 920,
        },
      },
      {
        id: '4',
        title: 'Cryptocurrency Market Volatility Continues Amid Regulatory Uncertainty',
        summary: 'Bitcoin and major altcoins experience significant price swings as regulators signal potential new rules.',
        source: 'CNBC',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        url: 'https://example.com/crypto-volatility',
        sentiment: 'negative',
        sentimentScore: -0.6,
        categories: ['cryptocurrency', 'regulation', 'bitcoin'],
        tags: ['Bitcoin', 'cryptocurrency', 'regulation', 'volatility'],
        relevanceScore: 0.75,
        socialEngagement: {
          shares: 2100,
          comments: 650,
          reactions: 3200,
        },
      },
      {
        id: '5',
        title: 'European Central Bank Maintains Steady Course on Interest Rates',
        summary: 'ECB keeps rates unchanged but hints at potential policy adjustments based on inflation data.',
        source: 'Financial Times',
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        url: 'https://example.com/ecb-rates',
        sentiment: 'neutral',
        sentimentScore: 0.05,
        categories: ['central-banking', 'europe', 'interest-rates'],
        tags: ['ECB', 'European Central Bank', 'interest rates', 'Europe'],
        relevanceScore: 0.78,
      },
    ];

    return mockArticles;
  }

  private async processArticles(articles: NewsArticle[]): Promise<NewsArticle[]> {
    // In production, this would:
    // 1. Perform sentiment analysis using NLP APIs
    // 2. Extract entities and topics
    // 3. Calculate relevance scores
    // 4. Enrich with additional metadata

    return articles.map(article => ({
      ...article,
      // Add any processing results
      categories: article.categories || this.categorizeArticle(article),
      tags: article.tags || this.extractTags(article),
      relevanceScore: article.relevanceScore || this.calculateRelevance(article),
    }));
  }

  private categorizeArticle(article: NewsArticle): string[] {
    const categories: string[] = [];
    const title = article.title.toLowerCase();
    const summary = article.summary?.toLowerCase() || '';

    if (title.includes('fed') || title.includes('federal reserve') || summary.includes('interest rate')) {
      categories.push('monetary-policy');
    }
    if (title.includes('earn') || summary.includes('revenue') || summary.includes('profit')) {
      categories.push('earnings');
    }
    if (title.includes('oil') || title.includes('gold') || title.includes('commodity')) {
      categories.push('commodities');
    }
    if (title.includes('crypto') || title.includes('bitcoin') || title.includes('ethereum')) {
      categories.push('cryptocurrency');
    }
    if (title.includes('tech') || title.includes('apple') || title.includes('google')) {
      categories.push('technology');
    }

    return categories.length > 0 ? categories : ['general'];
  }

  private extractTags(article: NewsArticle): string[] {
    const text = `${article.title} ${article.summary}`.toLowerCase();
    const commonTags = [
      'bitcoin', 'ethereum', 'crypto', 'fed', 'interest rates', 'inflation',
      'earnings', 'revenue', 'stocks', 'market', 'trading', 'investment',
      'oil', 'gold', 'commodities', 'forex', 'dollar', 'euro',
    ];

    return commonTags.filter(tag => text.includes(tag));
  }

  private calculateRelevance(article: NewsArticle): number {
    let score = 0.5; // Base score

    // Boost based on source credibility
    const highCredibilitySources = ['bloomberg', 'reuters', 'wall-street-journal', 'financial-times'];
    if (highCredibilitySources.includes(article.source.toLowerCase().replace(/\s+/g, '-'))) {
      score += 0.2;
    }

    // Boost based on recency
    const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 2) score += 0.2;
    else if (hoursOld < 6) score += 0.1;

    // Boost based on social engagement
    if (article.socialEngagement) {
      const totalEngagement = article.socialEngagement.shares + 
                            article.socialEngagement.comments + 
                            article.socialEngagement.reactions;
      if (totalEngagement > 1000) score += 0.1;
    }

    return Math.min(1.0, score);
  }

  private calculateSentimentOverview(articles: NewsArticle[]): NewsAnalysis['sentimentOverview'] {
    const sentimentCounts = articles.reduce(
      (acc, article) => {
        acc[article.sentiment]++;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );

    const total = articles.length;
    const positive = sentimentCounts.positive / total;
    const negative = sentimentCounts.negative / total;

    let overallSentiment: 'positive' | 'negative' | 'neutral';
    if (positive > negative + 0.1) {
      overallSentiment = 'positive';
    } else if (negative > positive + 0.1) {
      overallSentiment = 'negative';
    } else {
      overallSentiment = 'neutral';
    }

    return {
      positive: sentimentCounts.positive,
      negative: sentimentCounts.negative,
      neutral: sentimentCounts.neutral,
      overallSentiment,
    };
  }

  private identifyTrendingTopics(articles: NewsArticle[]): Array<{
    topic: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }> {
    const topicCount: Record<string, { count: number; sentiments: string[] }> = {};

    articles.forEach(article => {
      article.tags?.forEach(tag => {
        if (!topicCount[tag]) {
          topicCount[tag] = { count: 0, sentiments: [] };
        }
        topicCount[tag].count++;
        topicCount[tag].sentiments.push(article.sentiment);
      });
    });

    return Object.entries(topicCount)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([topic, data]) => {
        const sentimentCounts = data.sentiments.reduce(
          (acc, sentiment) => {
            acc[sentiment]++;
            return acc;
          },
          { positive: 0, negative: 0, neutral: 0 } as Record<string, number>
        );

        const dominantSentiment = Object.entries(sentimentCounts)
          .sort(([, a], [, b]) => b - a)[0][0] as 'positive' | 'negative' | 'neutral';

        return {
          topic,
          count: data.count,
          sentiment: dominantSentiment,
        };
      });
  }

  private identifyMarketMovers(articles: NewsArticle[]): Array<{
    symbol: string;
    news: NewsArticle[];
    impact: 'high' | 'medium' | 'low';
  }> {
    // Mock implementation - in production, this would:
    // 1. Extract stock symbols/tickers from articles
    // 2. Correlate with market data
    // 3. Calculate impact scores

    const marketMovers = [
      {
        symbol: 'AAPL',
        news: articles.filter(a => a.categories.includes('technology')),
        impact: 'high' as const,
      },
      {
        symbol: 'XLE', // Energy ETF
        news: articles.filter(a => a.categories.includes('commodities')),
        impact: 'medium' as const,
      },
      {
        symbol: 'BTC-USD',
        news: articles.filter(a => a.categories.includes('cryptocurrency')),
        impact: 'high' as const,
      },
    ];

    return marketMovers.filter(mover => mover.news.length > 0);
  }

  private getDefaultNewsAnalysis(): NewsAnalysis {
    return {
      topStories: [],
      sentimentOverview: {
        positive: 0,
        negative: 0,
        neutral: 0,
        overallSentiment: 'neutral',
      },
      trendingTopics: [],
      marketMovers: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  async getNewsByCategory(category: string, limit: number = 10): Promise<NewsArticle[]> {
    try {
      const analysis = await this.getLatestFinancialNews();
      return analysis.topStories
        .filter(article => article.categories.includes(category))
        .slice(0, limit);
    } catch (error) {
      this.logger.warn('Failed to get news by category', { category, error: error.message });
      return [];
    }
  }

  async searchNews(query: string, limit: number = 10): Promise<NewsArticle[]> {
    try {
      const analysis = await this.getLatestFinancialNews();
      const lowerQuery = query.toLowerCase();
      
      return analysis.topStories
        .filter(article => 
          article.title.toLowerCase().includes(lowerQuery) ||
          article.summary?.toLowerCase().includes(lowerQuery) ||
          article.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        )
        .slice(0, limit);
    } catch (error) {
      this.logger.warn('Failed to search news', { query, error: error.message });
      return [];
    }
  }
}