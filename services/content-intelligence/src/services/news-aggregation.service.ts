import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as sentiment from 'sentiment';
import * as natural from 'natural';

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
  sentimentAnalysis: {
    compound: number;
    positive: number;
    negative: number;
    neutral: number;
    confidence: number;
    emotions?: {
      joy: number;
      anger: number;
      fear: number;
      sadness: number;
      trust: number;
    };
  };
  categories: string[];
  tags: string[];
  relevanceScore: number;
  socialEngagement?: {
    shares: number;
    comments: number;
    reactions: number;
  };
  entities: {
    companies: string[];
    people: string[];
    locations: string[];
    tickers: string[];
    organizations: string[];
  };
  keyPhrases: string[];
  marketImpact: 'high' | 'medium' | 'low';
  credibilityScore: number;
  readabilityScore: number;
  bias: 'left' | 'center' | 'right' | 'unknown';
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
  private readonly sentimentAnalyzer: any;

  // Enhanced financial news sources with credibility scores
  private readonly newsSources = [
    { name: 'bloomberg', credibility: 0.95, bias: 'center' as const },
    { name: 'reuters', credibility: 0.93, bias: 'center' as const },
    { name: 'financial-times', credibility: 0.92, bias: 'center' as const },
    { name: 'wall-street-journal', credibility: 0.90, bias: 'center' as const },
    { name: 'cnbc', credibility: 0.85, bias: 'center' as const },
    { name: 'marketwatch', credibility: 0.82, bias: 'center' as const },
    { name: 'yahoo-finance', credibility: 0.78, bias: 'center' as const },
    { name: 'seeking-alpha', credibility: 0.75, bias: 'center' as const },
    { name: 'benzinga', credibility: 0.72, bias: 'center' as const },
    { name: 'the-motley-fool', credibility: 0.70, bias: 'center' as const },
  ];

  // News API providers with configurations
  private readonly newsProviders = {
    newsapi: {
      apiKey: null as string | null,
      baseUrl: 'https://newsapi.org/v2',
      enabled: false,
    },
    finnhub: {
      apiKey: null as string | null,
      baseUrl: 'https://finnhub.io/api/v1',
      enabled: false,
    },
    alphavantage: {
      apiKey: null as string | null,
      baseUrl: 'https://www.alphavantage.co/query',
      enabled: false,
    },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.sentimentAnalyzer = new sentiment();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize API keys from configuration
    this.newsProviders.newsapi.apiKey = this.configService.get<string>('NEWS_API_KEY');
    this.newsProviders.newsapi.enabled = !!this.newsProviders.newsapi.apiKey;

    this.newsProviders.finnhub.apiKey = this.configService.get<string>('FINNHUB_API_KEY');
    this.newsProviders.finnhub.enabled = !!this.newsProviders.finnhub.apiKey;

    this.newsProviders.alphavantage.apiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY');
    this.newsProviders.alphavantage.enabled = !!this.newsProviders.alphavantage.apiKey;

    this.logger.log('News providers initialized', {
      newsapi: this.newsProviders.newsapi.enabled,
      finnhub: this.newsProviders.finnhub.enabled,
      alphavantage: this.newsProviders.alphavantage.enabled,
    });
  }

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
      // Enhanced multi-source news aggregation
      const articles = await this.fetchNewsFromMultipleSources();
      const processedArticles = await this.performAdvancedProcessing(articles);

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

  /**
   * Enhanced multi-source news fetching with fallback strategy
   */
  private async fetchNewsFromMultipleSources(): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];
    const activeProviders = this.getActiveNewsProviders();

    if (activeProviders.length === 0) {
      this.logger.warn('No active news providers, using mock data');
      return this.generateMockNewsArticles();
    }

    // Fetch from each provider in parallel
    const fetchPromises = activeProviders.map(provider => 
      this.fetchFromNewsProvider(provider).catch(error => {
        this.logger.warn(`Failed to fetch from ${provider}`, { error: error.message });
        return [];
      })
    );

    const results = await Promise.allSettled(fetchPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
        this.logger.debug(`Fetched ${result.value.length} articles from ${activeProviders[index]}`);
      }
    });

    // If no articles were fetched, use mock data
    if (articles.length === 0) {
      this.logger.warn('All providers failed, using mock data');
      return this.generateMockNewsArticles();
    }

    // Remove duplicates and sort by relevance
    return this.deduplicateAndRankArticles(articles);
  }

  private getActiveNewsProviders(): string[] {
    const active: string[] = [];
    
    if (this.newsProviders.newsapi.enabled) active.push('newsapi');
    if (this.newsProviders.finnhub.enabled) active.push('finnhub');
    if (this.newsProviders.alphavantage.enabled) active.push('alphavantage');
    
    // Always include mock provider for demonstration
    active.push('mock');

    return active;
  }

  private async fetchFromNewsProvider(provider: string): Promise<NewsArticle[]> {
    switch (provider) {
      case 'newsapi':
        return this.fetchFromNewsAPI();
      case 'finnhub':
        return this.fetchFromFinnhub();
      case 'alphavantage':
        return this.fetchFromAlphaVantage();
      case 'mock':
        return this.generateMockNewsArticles();
      default:
        return [];
    }
  }

  private async fetchFromNewsAPI(): Promise<NewsArticle[]> {
    try {
      if (!this.newsProviders.newsapi.enabled) return [];

      const url = `${this.newsProviders.newsapi.baseUrl}/everything?q=finance+OR+stocks+OR+market&language=en&sortBy=publishedAt&apiKey=${this.newsProviders.newsapi.apiKey}`;
      
      const response = await firstValueFrom(this.httpService.get(url));
      const articles = response.data.articles || [];

      return articles.slice(0, 20).map((article: any, index: number) => this.transformNewsAPIArticle(article, index));
    } catch (error) {
      this.logger.error('NewsAPI fetch failed', { error: error.message });
      return [];
    }
  }

  private async fetchFromFinnhub(): Promise<NewsArticle[]> {
    try {
      if (!this.newsProviders.finnhub.enabled) return [];

      const url = `${this.newsProviders.finnhub.baseUrl}/news?category=general&token=${this.newsProviders.finnhub.apiKey}`;
      
      const response = await firstValueFrom(this.httpService.get(url));
      const articles = response.data || [];

      return articles.slice(0, 20).map((article: any, index: number) => this.transformFinnhubArticle(article, index));
    } catch (error) {
      this.logger.error('Finnhub fetch failed', { error: error.message });
      return [];
    }
  }

  private async fetchFromAlphaVantage(): Promise<NewsArticle[]> {
    try {
      if (!this.newsProviders.alphavantage.enabled) return [];

      const url = `${this.newsProviders.alphavantage.baseUrl}?function=NEWS_SENTIMENT&apikey=${this.newsProviders.alphavantage.apiKey}`;
      
      const response = await firstValueFrom(this.httpService.get(url));
      const articles = response.data.feed || [];

      return articles.slice(0, 20).map((article: any, index: number) => this.transformAlphaVantageArticle(article, index));
    } catch (error) {
      this.logger.error('Alpha Vantage fetch failed', { error: error.message });
      return [];
    }
  }

  private transformNewsAPIArticle(article: any, index: number): NewsArticle {
    return {
      id: `newsapi_${index}_${Date.now()}`,
      title: article.title || 'Untitled',
      summary: article.description || article.content?.substring(0, 200) + '...' || '',
      content: article.content,
      source: article.source?.name || 'Unknown',
      author: article.author,
      publishedAt: article.publishedAt,
      url: article.url,
      sentiment: 'neutral',
      sentimentScore: 0,
      sentimentAnalysis: {
        compound: 0,
        positive: 0,
        negative: 0,
        neutral: 1,
        confidence: 0.5,
      },
      categories: ['general'],
      tags: [],
      relevanceScore: 0.5,
      entities: {
        companies: [],
        people: [],
        locations: [],
        tickers: [],
        organizations: [],
      },
      keyPhrases: [],
      marketImpact: 'low',
      credibilityScore: 0.8,
      readabilityScore: 0.5,
      bias: 'unknown',
    };
  }

  private transformFinnhubArticle(article: any, index: number): NewsArticle {
    return {
      id: `finnhub_${index}_${Date.now()}`,
      title: article.headline || 'Untitled',
      summary: article.summary || '',
      source: article.source || 'Finnhub',
      publishedAt: new Date(article.datetime * 1000).toISOString(),
      url: article.url,
      sentiment: 'neutral',
      sentimentScore: 0,
      sentimentAnalysis: {
        compound: 0,
        positive: 0,
        negative: 0,
        neutral: 1,
        confidence: 0.5,
      },
      categories: ['finance'],
      tags: [],
      relevanceScore: 0.7,
      entities: {
        companies: [],
        people: [],
        locations: [],
        tickers: [],
        organizations: [],
      },
      keyPhrases: [],
      marketImpact: 'medium',
      credibilityScore: 0.85,
      readabilityScore: 0.6,
      bias: 'center',
    };
  }

  private transformAlphaVantageArticle(article: any, index: number): NewsArticle {
    return {
      id: `alphavantage_${index}_${Date.now()}`,
      title: article.title || 'Untitled',
      summary: article.summary || '',
      source: article.source || 'Alpha Vantage',
      publishedAt: article.time_published,
      url: article.url,
      sentiment: 'neutral',
      sentimentScore: 0,
      sentimentAnalysis: {
        compound: parseFloat(article.overall_sentiment_score || '0'),
        positive: 0,
        negative: 0,
        neutral: 1,
        confidence: 0.7,
      },
      categories: ['finance'],
      tags: article.topics || [],
      relevanceScore: 0.8,
      entities: {
        companies: [],
        people: [],
        locations: [],
        tickers: article.ticker_sentiment?.map((t: any) => t.ticker) || [],
        organizations: [],
      },
      keyPhrases: [],
      marketImpact: 'medium',
      credibilityScore: 0.9,
      readabilityScore: 0.7,
      bias: 'center',
    };
  }

  /**
   * Advanced sentiment processing with multiple analysis techniques
   */
  private async performAdvancedProcessing(articles: NewsArticle[]): Promise<NewsArticle[]> {
    const processedArticles: NewsArticle[] = [];

    for (const article of articles) {
      try {
        const processed = await this.enhanceArticleWithSentiment(article);
        processedArticles.push(processed);
      } catch (error) {
        this.logger.warn(`Failed to process article ${article.id}`, { error: error.message });
        // Add article without enhancement
        processedArticles.push(article);
      }
    }

    return processedArticles;
  }

  private async enhanceArticleWithSentiment(article: NewsArticle): Promise<NewsArticle> {
    const textToAnalyze = `${article.title} ${article.summary}`;

    // Rule-based sentiment analysis
    const ruleBasedResult = this.sentimentAnalyzer.analyze(textToAnalyze);

    // Enhanced sentiment analysis
    const enhancedSentiment = await this.performEnhancedSentimentAnalysis(textToAnalyze);

    // Entity extraction
    const entities = this.extractEntitiesFromText(textToAnalyze);

    // Key phrase extraction
    const keyPhrases = this.extractKeyPhrases(textToAnalyze);

    // Market impact assessment
    const marketImpact = this.assessMarketImpact(article, entities, enhancedSentiment);

    // Credibility score based on source
    const credibilityScore = this.calculateCredibilityScore(article.source);

    // Readability analysis
    const readabilityScore = this.calculateReadabilityScore(textToAnalyze);

    return {
      ...article,
      sentimentScore: ruleBasedResult.score,
      sentiment: this.mapSentimentToCategory(enhancedSentiment.compound),
      sentimentAnalysis: enhancedSentiment,
      entities,
      keyPhrases,
      marketImpact,
      credibilityScore,
      readabilityScore,
    };
  }

  private async performEnhancedSentimentAnalysis(text: string): Promise<NewsArticle['sentimentAnalysis']> {
    try {
      // Use multiple sentiment analysis approaches
      const ruleBasedResult = this.sentimentAnalyzer.analyze(text);
      
      // Normalize the sentiment scores
      const compound = Math.max(-1, Math.min(1, ruleBasedResult.score / 10));
      
      // Calculate individual sentiment components
      const positiveWords = ruleBasedResult.positive.length;
      const negativeWords = ruleBasedResult.negative.length;
      const totalWords = text.split(/\s+/).length;
      
      const positive = positiveWords / Math.max(totalWords, 1);
      const negative = negativeWords / Math.max(totalWords, 1);
      const neutral = Math.max(0, 1 - positive - negative);
      
      // Calculate confidence based on sentiment strength
      const confidence = Math.min(1, (Math.abs(compound) + (positiveWords + negativeWords) / totalWords) * 2);

      return {
        compound,
        positive,
        negative,
        neutral,
        confidence,
        emotions: this.analyzeEmotions(text),
      };
    } catch (error) {
      this.logger.warn('Enhanced sentiment analysis failed', { error: error.message });
      return {
        compound: 0,
        positive: 0,
        negative: 0,
        neutral: 1,
        confidence: 0.1,
      };
    }
  }

  private analyzeEmotions(text: string): NewsArticle['sentimentAnalysis']['emotions'] {
    // Simple emotion detection using keyword matching
    const emotionKeywords = {
      joy: ['success', 'growth', 'profit', 'gain', 'rise', 'boom', 'surge'],
      anger: ['scandal', 'fraud', 'manipulation', 'outrage', 'anger'],
      fear: ['crash', 'collapse', 'panic', 'crisis', 'recession', 'risk', 'danger'],
      sadness: ['loss', 'decline', 'fall', 'drop', 'bankruptcy'],
      trust: ['confident', 'stable', 'reliable', 'secure', 'trust'],
    };

    const emotions = {
      joy: 0,
      anger: 0,
      fear: 0,
      sadness: 0,
      trust: 0,
    };

    const lowerText = text.toLowerCase();
    const totalWords = text.split(/\s+/).length;

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
      emotions[emotion as keyof typeof emotions] = matches / Math.max(totalWords, 1);
    });

    return emotions;
  }

  private extractEntitiesFromText(text: string): NewsArticle['entities'] {
    const entities = {
      companies: [] as string[],
      people: [] as string[],
      locations: [] as string[],
      tickers: [] as string[],
      organizations: [] as string[],
    };

    // Extract stock tickers (simple pattern matching)
    const tickerPattern = /\$([A-Z]{1,5})\b/g;
    let match;
    while ((match = tickerPattern.exec(text)) !== null) {
      entities.tickers.push(match[1]);
    }

    // Extract company names (simplified approach)
    const companyPatterns = [
      /\b([A-Z][a-z]+ Inc\.?)/g,
      /\b([A-Z][a-z]+ Corp\.?)/g,
      /\b([A-Z][a-z]+ LLC)/g,
      /\b(Apple|Microsoft|Google|Amazon|Tesla|Facebook|Meta)\b/g,
    ];

    companyPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        entities.companies.push(match[1]);
      }
    });

    // Extract locations (simplified)
    const locationPattern = /\b(New York|London|Tokyo|Hong Kong|Singapore|Frankfurt|Shanghai)\b/g;
    while ((match = locationPattern.exec(text)) !== null) {
      entities.locations.push(match[1]);
    }

    return entities;
  }

  private extractKeyPhrases(text: string): string[] {
    try {
      // Use Natural.js for basic n-gram extraction
      const tokens = natural.WordTokenizer.prototype.tokenize(text.toLowerCase());
      
      if (!tokens) return [];

      // Filter out stop words and short words
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
      const filteredTokens = tokens.filter(token => 
        token.length > 3 && !stopWords.has(token) && /^[a-zA-Z]+$/.test(token)
      );

      // Get bigrams and trigrams
      const phrases: string[] = [];
      
      // Bigrams
      for (let i = 0; i < filteredTokens.length - 1; i++) {
        phrases.push(`${filteredTokens[i]} ${filteredTokens[i + 1]}`);
      }

      // Trigrams
      for (let i = 0; i < filteredTokens.length - 2; i++) {
        phrases.push(`${filteredTokens[i]} ${filteredTokens[i + 1]} ${filteredTokens[i + 2]}`);
      }

      // Return most frequent phrases
      const phraseCounts: Record<string, number> = {};
      phrases.forEach(phrase => {
        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
      });

      return Object.entries(phraseCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([phrase]) => phrase);
    } catch (error) {
      this.logger.warn('Key phrase extraction failed', { error: error.message });
      return [];
    }
  }

  private assessMarketImpact(
    article: NewsArticle,
    entities: NewsArticle['entities'],
    sentiment: NewsArticle['sentimentAnalysis'],
  ): 'high' | 'medium' | 'low' {
    let impactScore = 0;

    // High impact indicators
    if (entities.tickers.length > 0) impactScore += 2;
    if (entities.companies.length > 2) impactScore += 1;
    if (Math.abs(sentiment.compound) > 0.5) impactScore += 1;
    if (article.source === 'Bloomberg' || article.source === 'Reuters') impactScore += 1;

    // Check for high-impact keywords
    const highImpactKeywords = ['earnings', 'merger', 'acquisition', 'ipo', 'bankruptcy', 'fed', 'interest rates'];
    const titleLower = article.title.toLowerCase();
    if (highImpactKeywords.some(keyword => titleLower.includes(keyword))) {
      impactScore += 2;
    }

    if (impactScore >= 4) return 'high';
    if (impactScore >= 2) return 'medium';
    return 'low';
  }

  private calculateCredibilityScore(source: string): number {
    const sourceConfig = this.newsSources.find(s => s.name.toLowerCase().includes(source.toLowerCase()));
    return sourceConfig?.credibility || 0.6; // Default credibility
  }

  private calculateReadabilityScore(text: string): number {
    try {
      // Simple readability calculation (Flesch formula approximation)
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);

      if (sentences.length === 0 || words.length === 0) return 0.5;

      const avgWordsPerSentence = words.length / sentences.length;
      const avgSyllablesPerWord = syllables / words.length;

      // Simplified Flesch score
      const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
      
      // Normalize to 0-1 range
      return Math.max(0, Math.min(1, score / 100));
    } catch (error) {
      return 0.5; // Default readability
    }
  }

  private countSyllables(word: string): number {
    return word.toLowerCase().replace(/[^aeiou]/g, '').length || 1;
  }

  private mapSentimentToCategory(compound: number): 'positive' | 'negative' | 'neutral' {
    if (compound > 0.1) return 'positive';
    if (compound < -0.1) return 'negative';
    return 'neutral';
  }

  private deduplicateAndRankArticles(articles: NewsArticle[]): NewsArticle[] {
    // Remove duplicates based on title similarity
    const unique: NewsArticle[] = [];
    const seenTitles = new Set<string>();

    articles.forEach(article => {
      const normalizedTitle = article.title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        unique.push(article);
      }
    });

    // Sort by relevance score and recency
    return unique.sort((a, b) => {
      const scoreA = a.relevanceScore + (Date.now() - new Date(a.publishedAt).getTime()) / (24 * 60 * 60 * 1000);
      const scoreB = b.relevanceScore + (Date.now() - new Date(b.publishedAt).getTime()) / (24 * 60 * 60 * 1000);
      return scoreB - scoreA;
    });
  }

  /**
   * Real-time sentiment monitoring for trending topics
   */
  async monitorSentimentTrends(timeframe: '1h' | '6h' | '24h' = '6h'): Promise<{
    trends: Array<{
      topic: string;
      currentSentiment: number;
      previousSentiment: number;
      change: number;
      volatility: number;
    }>;
    overallMarketSentiment: number;
    sentimentVolatility: number;
  }> {
    try {
      const analysis = await this.getLatestFinancialNews();
      
      // Calculate sentiment trends (simplified implementation)
      const trends = analysis.trendingTopics.map(topic => {
        const currentSentiment = Math.random() * 2 - 1; // Mock current sentiment
        const previousSentiment = currentSentiment + (Math.random() - 0.5) * 0.2; // Mock previous
        
        return {
          topic: topic.topic,
          currentSentiment,
          previousSentiment,
          change: currentSentiment - previousSentiment,
          volatility: Math.abs(currentSentiment - previousSentiment) * 2,
        };
      });

      const overallMarketSentiment = analysis.topStories.reduce((sum, article) => 
        sum + article.sentimentAnalysis.compound, 0
      ) / analysis.topStories.length;

      const sentimentVolatility = this.calculateSentimentVolatility(analysis.topStories);

      return {
        trends,
        overallMarketSentiment,
        sentimentVolatility,
      };
    } catch (error) {
      this.logger.error('Sentiment trend monitoring failed', { error: error.message });
      throw error;
    }
  }

  private calculateSentimentVolatility(articles: NewsArticle[]): number {
    if (articles.length < 2) return 0;

    const sentiments = articles.map(a => a.sentimentAnalysis.compound);
    const mean = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sentiments.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get sentiment analysis for specific symbols or topics
   */
  async getSentimentForTopics(topics: string[]): Promise<Record<string, {
    sentiment: number;
    confidence: number;
    articleCount: number;
    recentNews: NewsArticle[];
  }>> {
    try {
      const analysis = await this.getLatestFinancialNews();
      const result: Record<string, any> = {};

      topics.forEach(topic => {
        const relatedArticles = analysis.topStories.filter(article =>
          article.title.toLowerCase().includes(topic.toLowerCase()) ||
          article.summary.toLowerCase().includes(topic.toLowerCase()) ||
          article.entities.tickers.includes(topic.toUpperCase()) ||
          article.keyPhrases.some(phrase => phrase.includes(topic.toLowerCase()))
        );

        if (relatedArticles.length > 0) {
          const avgSentiment = relatedArticles.reduce((sum, article) => 
            sum + article.sentimentAnalysis.compound, 0
          ) / relatedArticles.length;

          const avgConfidence = relatedArticles.reduce((sum, article) => 
            sum + article.sentimentAnalysis.confidence, 0
          ) / relatedArticles.length;

          result[topic] = {
            sentiment: avgSentiment,
            confidence: avgConfidence,
            articleCount: relatedArticles.length,
            recentNews: relatedArticles.slice(0, 5),
          };
        } else {
          result[topic] = {
            sentiment: 0,
            confidence: 0,
            articleCount: 0,
            recentNews: [],
          };
        }
      });

      return result;
    } catch (error) {
      this.logger.error('Topic sentiment analysis failed', { error: error.message });
      throw error;
    }
  }

  // Public methods for controller endpoints
  async getLatestNews(symbols?: string[], limit: number = 20, category?: string): Promise<NewsArticle[]> {
    try {
      const articles = await this.fetchNewsArticles();
      let filteredArticles = articles;

      if (symbols && symbols.length > 0) {
        filteredArticles = articles.filter(article => 
          symbols.some(symbol => 
            article.title.toUpperCase().includes(symbol.toUpperCase()) ||
            article.summary.toUpperCase().includes(symbol.toUpperCase())
          )
        );
      }

      if (category) {
        filteredArticles = filteredArticles.filter(article => 
          article.category === category
        );
      }

      return filteredArticles.slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to get latest news', { error: error.message });
      throw error;
    }
  }

  async analyzeNews(content: string, symbols?: string[]): Promise<{
    sentiment: any;
    entities: any[];
    topics: string[];
    riskFactors: string[];
    marketImpact: any;
  }> {
    try {
      const sentimentResult = await this.performEnhancedSentimentAnalysis(content);
      
      // Extract entities and topics
      const entities = this.extractEntitiesFromText(content);
      const topics = this.extractTopicsFromText(content);
      const riskFactors = this.identifyRiskFactors(content);
      
      // Assess market impact
      const marketImpact = {
        level: sentimentResult.compound > 0.5 ? 'high' : sentimentResult.compound < -0.5 ? 'high' : 'medium',
        direction: sentimentResult.compound > 0 ? 'positive' : sentimentResult.compound < 0 ? 'negative' : 'neutral',
        confidence: sentimentResult.confidence
      };

      return {
        sentiment: sentimentResult,
        entities,
        topics,
        riskFactors,
        marketImpact
      };
    } catch (error) {
      this.logger.error('News analysis failed', { error: error.message });
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<{
    sentiment: string;
    score: number;
    confidence: number;
    breakdown: any;
  }> {
    try {
      const analysis = await this.performEnhancedSentimentAnalysis(text);
      
      return {
        sentiment: analysis.compound > 0.1 ? 'positive' : analysis.compound < -0.1 ? 'negative' : 'neutral',
        score: analysis.compound,
        confidence: analysis.confidence,
        breakdown: {
          positive: analysis.positive,
          negative: analysis.negative,
          neutral: analysis.neutral
        }
      };
    } catch (error) {
      this.logger.error('Sentiment analysis failed', { error: error.message });
      throw error;
    }
  }

  async analyzeSentimentBatch(texts: string[]): Promise<Array<{
    text: string;
    sentiment: string;
    score: number;
    confidence: number;
  }>> {
    try {
      const results = await Promise.all(texts.map(async (text) => {
        const analysis = await this.analyzeSentiment(text);
        return {
          text,
          sentiment: analysis.sentiment,
          score: analysis.score,
          confidence: analysis.confidence
        };
      }));
      
      return results;
    } catch (error) {
      this.logger.error('Batch sentiment analysis failed', { error: error.message });
      throw error;
    }
  }

  async getTrendingTopics(limit: number = 10, timeframe: string = '24h'): Promise<Array<{
    topic: string;
    mentions: number;
    sentiment: number;
    articles: NewsArticle[];
  }>> {
    try {
      const articles = await this.fetchNewsArticles();
      const topicMap = new Map<string, { mentions: number; sentiment: number; articles: NewsArticle[] }>();
      
      articles.forEach(article => {
        const topics = this.extractTopicsFromText(article.title + ' ' + article.summary);
        topics.forEach(topic => {
          if (!topicMap.has(topic)) {
            topicMap.set(topic, { mentions: 0, sentiment: 0, articles: [] });
          }
          const data = topicMap.get(topic)!;
          data.mentions++;
          data.sentiment += article.sentimentScore;
          data.articles.push(article);
        });
      });

      const trending = Array.from(topicMap.entries())
        .map(([topic, data]) => ({
          topic,
          mentions: data.mentions,
          sentiment: data.sentiment / data.mentions,
          articles: data.articles.slice(0, 3)
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, limit);

      return trending;
    } catch (error) {
      this.logger.error('Failed to get trending topics', { error: error.message });
      throw error;
    }
  }

  async getMarketSentimentSummary(timeframe: string = '24h'): Promise<{
    overallSentiment: string;
    score: number;
    confidence: number;
    breakdown: any;
    trends: any[];
  }> {
    try {
      const trendData = await this.monitorSentimentTrends(timeframe as '1h' | '6h' | '24h');
      
      return {
        overallSentiment: trendData.currentSentiment,
        score: trendData.score,
        confidence: trendData.confidence,
        breakdown: trendData.breakdown,
        trends: trendData.trends
      };
    } catch (error) {
      this.logger.error('Failed to get market sentiment summary', { error: error.message });
      throw error;
    }
  }

  async getAvailableSources(): Promise<string[]> {
    return ['newsapi', 'finnhub', 'alphavantage', 'bloomberg', 'reuters', 'financial_times'];
  }

  async getNewsAnalytics(period: { startDate?: Date; endDate?: Date }): Promise<{
    totalArticles: number;
    sentimentDistribution: any;
    topSources: any[];
    categoryBreakdown: any;
  }> {
    try {
      const articles = await this.fetchNewsArticles();
      
      // Filter by date if provided
      let filteredArticles = articles;
      if (period.startDate || period.endDate) {
        filteredArticles = articles.filter(article => {
          const articleDate = new Date(article.publishedAt);
          if (period.startDate && articleDate < period.startDate) return false;
          if (period.endDate && articleDate > period.endDate) return false;
          return true;
        });
      }

      // Calculate analytics
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
      const sourceCounts = new Map<string, number>();
      const categoryCounts = new Map<string, number>();

      filteredArticles.forEach(article => {
        sentimentCounts[article.sentiment]++;
        sourceCounts.set(article.source, (sourceCounts.get(article.source) || 0) + 1);
        const category = (article as any).category || 'general';
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      });

      return {
        totalArticles: filteredArticles.length,
        sentimentDistribution: sentimentCounts,
        topSources: Array.from(sourceCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([source, count]) => ({ source, count })),
        categoryBreakdown: Object.fromEntries(categoryCounts)
      };
    } catch (error) {
      this.logger.error('Failed to get news analytics', { error: error.message });
      throw error;
    }
  }

  // Helper methods
  private extractEntitiesFromText(text: string): any[] {
    // Basic entity extraction - in production, use more sophisticated NLP
    const entities: any[] = [];
    const companyPattern = /\b[A-Z]{1,5}\b/g; // Stock symbols
    const matches = text.match(companyPattern);
    
    if (matches) {
      matches.forEach(match => {
        entities.push({
          text: match,
          type: 'ORGANIZATION',
          confidence: 0.8
        });
      });
    }
    
    return entities;
  }

  private extractTopicsFromText(text: string): string[] {
    const commonTopics = [
      'earnings', 'revenue', 'profit', 'loss', 'merger', 'acquisition',
      'ipo', 'dividend', 'stock', 'market', 'trading', 'investment',
      'finance', 'economy', 'inflation', 'interest rates', 'fed'
    ];
    
    const topics: string[] = [];
    const textLower = text.toLowerCase();
    
    commonTopics.forEach(topic => {
      if (textLower.includes(topic)) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  private identifyRiskFactors(text: string): string[] {
    const riskKeywords = [
      'volatility', 'risk', 'uncertainty', 'decline', 'loss', 'recession',
      'inflation', 'regulation', 'lawsuit', 'investigation', 'bankruptcy'
    ];
    
    const risks: string[] = [];
    const textLower = text.toLowerCase();
    
    riskKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        risks.push(keyword);
      }
    });
    
    return risks;
  }
}