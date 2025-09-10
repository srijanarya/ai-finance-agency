import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { firstValueFrom } from 'rxjs';
import * as sentiment from 'sentiment';

export interface SentimentAnalysisRequest {
  sources: NewsSource[];
  keywords?: string[];
  timeRange?: { start: Date; end: Date };
  includeAnalysis?: boolean;
}

export interface SentimentAnalysisResponse {
  id: string;
  overallSentiment: SentimentScore;
  sourceAnalysis: SourceSentimentAnalysis[];
  trendingTopics: TrendingTopic[];
  keyInsights: KeyInsight[];
  marketImpact: MarketImpactAnalysis;
  analyzedAt: Date;
  processingTime: number;
}

export interface NewsSource {
  name: string;
  url: string;
  category: NewsCategory;
  weight: number; // 0-1, importance weight
  lastUpdated?: Date;
}

export interface SentimentScore {
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  classification: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  confidence: number; // 0 to 1
}

export interface SourceSentimentAnalysis {
  source: NewsSource;
  articles: ArticleSentimentAnalysis[];
  averageSentiment: SentimentScore;
  articleCount: number;
  topKeywords: string[];
}

export interface ArticleSentimentAnalysis {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: Date;
  sentiment: SentimentScore;
  entities: NamedEntity[];
  keywords: string[];
  relevanceScore: number;
  marketImpact: number; // 0-1
}

export interface TrendingTopic {
  topic: string;
  sentiment: SentimentScore;
  frequency: number;
  sources: string[];
  relatedKeywords: string[];
  marketRelevance: number;
}

export interface KeyInsight {
  type: InsightType;
  description: string;
  confidence: number;
  supportingData: any;
  marketImplication: string;
}

export interface MarketImpactAnalysis {
  overallImpact: number; // -1 to 1
  sectorImpacts: SectorImpact[];
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  timeHorizon: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  confidenceLevel: number;
}

export interface SectorImpact {
  sector: string;
  impact: number; // -1 to 1
  reasoning: string;
  affectedSymbols: string[];
}

export interface NamedEntity {
  text: string;
  type: EntityType;
  confidence: number;
  sentiment?: SentimentScore;
}

export enum NewsCategory {
  FINANCIAL = 'financial',
  ECONOMIC = 'economic',
  CORPORATE = 'corporate',
  REGULATORY = 'regulatory',
  TECHNOLOGY = 'technology',
  GEOPOLITICAL = 'geopolitical',
  GENERAL = 'general'
}

export enum EntityType {
  COMPANY = 'company',
  PERSON = 'person',
  LOCATION = 'location',
  FINANCIAL_INSTRUMENT = 'financial_instrument',
  ECONOMIC_INDICATOR = 'economic_indicator',
  EVENT = 'event'
}

export enum InsightType {
  SENTIMENT_SHIFT = 'sentiment_shift',
  TRENDING_TOPIC = 'trending_topic',
  RISK_ALERT = 'risk_alert',
  OPPORTUNITY = 'opportunity',
  ANOMALY = 'anomaly'
}

@Injectable()
export class SentimentAnalysisService {
  private readonly logger = new Logger(SentimentAnalysisService.name);
  private readonly sentimentAnalyzer = new sentiment();
  private readonly defaultSources: NewsSource[] = [
    {
      name: 'Reuters Business',
      url: 'https://www.reuters.com/business/',
      category: NewsCategory.FINANCIAL,
      weight: 0.9,
    },
    {
      name: 'Bloomberg',
      url: 'https://www.bloomberg.com/',
      category: NewsCategory.FINANCIAL,
      weight: 0.95,
    },
    {
      name: 'Financial Times',
      url: 'https://www.ft.com/',
      category: NewsCategory.FINANCIAL,
      weight: 0.9,
    },
    {
      name: 'Wall Street Journal',
      url: 'https://www.wsj.com/',
      category: NewsCategory.FINANCIAL,
      weight: 0.9,
    },
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async analyzeSentiment(request: SentimentAnalysisRequest, userId?: string): Promise<SentimentAnalysisResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(`Analyzing sentiment for ${request.sources.length} sources`);

      // Use default sources if none provided
      const sources = request.sources.length > 0 ? request.sources : this.defaultSources;

      // Aggregate news from all sources
      const allArticles = await this.aggregateNews(sources, request.keywords, request.timeRange);

      // Perform sentiment analysis on aggregated content
      const sourceAnalysis = await this.analyzeSourceSentiment(sources, allArticles);

      // Calculate overall sentiment
      const overallSentiment = this.calculateOverallSentiment(sourceAnalysis);

      // Identify trending topics
      const trendingTopics = this.identifyTrendingTopics(allArticles, request.keywords);

      // Generate key insights
      const keyInsights = this.generateKeyInsights(sourceAnalysis, trendingTopics, overallSentiment);

      // Analyze market impact
      const marketImpact = this.analyzeMarketImpact(overallSentiment, trendingTopics, allArticles);

      const processingTime = Date.now() - startTime;

      const response: SentimentAnalysisResponse = {
        id: this.generateAnalysisId(),
        overallSentiment,
        sourceAnalysis,
        trendingTopics,
        keyInsights,
        marketImpact,
        analyzedAt: new Date(),
        processingTime,
      };

      // Emit sentiment analysis completed event
      this.eventEmitter.emit('sentiment.analysis.completed', {
        analysisId: response.id,
        userId,
        overallSentiment: overallSentiment.classification,
        articleCount: allArticles.length,
        processingTime,
      });

      return response;
    } catch (error) {
      this.logger.error(`Sentiment analysis failed: ${error.message}`);
      throw error;
    }
  }

  private async aggregateNews(
    sources: NewsSource[],
    keywords?: string[],
    timeRange?: { start: Date; end: Date }
  ): Promise<ArticleSentimentAnalysis[]> {
    const allArticles: ArticleSentimentAnalysis[] = [];

    // Since we're using mock data, simulate news aggregation
    for (const source of sources) {
      const mockArticles = this.generateMockArticles(source, keywords, timeRange);
      allArticles.push(...mockArticles);
    }

    return allArticles;
  }

  private generateMockArticles(
    source: NewsSource,
    keywords?: string[],
    timeRange?: { start: Date; end: Date }
  ): ArticleSentimentAnalysis[] {
    const articles: ArticleSentimentAnalysis[] = [];
    const articleCount = Math.floor(Math.random() * 10) + 5; // 5-15 articles per source

    const mockTitles = [
      'Market volatility continues amid economic uncertainty',
      'Federal Reserve considers interest rate adjustments',
      'Technology stocks show resilience in current market',
      'Oil prices fluctuate on geopolitical tensions',
      'Consumer spending patterns shift in post-pandemic economy',
      'Banking sector faces new regulatory challenges',
      'Renewable energy investments surge globally',
      'Inflation concerns impact monetary policy decisions',
      'Supply chain disruptions affect multiple industries',
      'Digital transformation accelerates across sectors',
    ];

    const mockSummaries = [
      'Economic indicators suggest mixed signals for market direction.',
      'Policy makers weigh options for economic stimulus measures.',
      'Analysts remain cautiously optimistic about growth prospects.',
      'Market participants monitor developments closely.',
      'Industry leaders express confidence in long-term outlook.',
      'Regulatory changes may impact market dynamics.',
      'Investment flows shift toward sustainable alternatives.',
      'Global factors influence domestic market conditions.',
      'Consumer behavior adapts to changing economic landscape.',
      'Innovation drives competitive advantages across markets.',
    ];

    for (let i = 0; i < articleCount; i++) {
      const title = mockTitles[Math.floor(Math.random() * mockTitles.length)];
      const summary = mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
      const content = `${title} ${summary}`;

      // Analyze sentiment of the content
      const sentimentResult = this.sentimentAnalyzer.analyze(content);
      const sentiment = this.normalizeSentimentScore(sentimentResult);

      // Extract entities and keywords
      const entities = this.extractEntities(content);
      const extractedKeywords = this.extractKeywords(content);

      articles.push({
        id: `article_${Date.now()}_${i}`,
        title,
        summary,
        url: `${source.url}/article/${i}`,
        publishedAt: this.generateRandomDate(timeRange),
        sentiment,
        entities,
        keywords: extractedKeywords,
        relevanceScore: this.calculateRelevanceScore(content, keywords),
        marketImpact: this.calculateMarketImpact(sentiment, entities),
      });
    }

    return articles;
  }

  private async analyzeSourceSentiment(
    sources: NewsSource[],
    allArticles: ArticleSentimentAnalysis[]
  ): Promise<SourceSentimentAnalysis[]> {
    const sourceAnalysis: SourceSentimentAnalysis[] = [];

    for (const source of sources) {
      const sourceArticles = allArticles.filter(article => 
        article.url.includes(source.url.replace('https://www.', '').replace('https://', '').split('/')[0])
      );

      const averageSentiment = this.calculateAverageSentiment(sourceArticles);
      const topKeywords = this.getTopKeywords(sourceArticles);

      sourceAnalysis.push({
        source,
        articles: sourceArticles,
        averageSentiment,
        articleCount: sourceArticles.length,
        topKeywords,
      });
    }

    return sourceAnalysis;
  }

  private calculateOverallSentiment(sourceAnalysis: SourceSentimentAnalysis[]): SentimentScore {
    let weightedScore = 0;
    let weightedMagnitude = 0;
    let totalWeight = 0;
    let totalConfidence = 0;

    sourceAnalysis.forEach(analysis => {
      const weight = analysis.source.weight;
      weightedScore += analysis.averageSentiment.score * weight;
      weightedMagnitude += analysis.averageSentiment.magnitude * weight;
      totalWeight += weight;
      totalConfidence += analysis.averageSentiment.confidence;
    });

    const normalizedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const normalizedMagnitude = totalWeight > 0 ? weightedMagnitude / totalWeight : 0;
    const averageConfidence = sourceAnalysis.length > 0 ? totalConfidence / sourceAnalysis.length : 0;

    return {
      score: normalizedScore,
      magnitude: normalizedMagnitude,
      classification: this.classifySentiment(normalizedScore),
      confidence: averageConfidence,
    };
  }

  private identifyTrendingTopics(
    articles: ArticleSentimentAnalysis[],
    targetKeywords?: string[]
  ): TrendingTopic[] {
    const topicMap = new Map<string, TrendingTopicData>();

    // Aggregate keywords across articles
    articles.forEach(article => {
      article.keywords.forEach(keyword => {
        if (!topicMap.has(keyword)) {
          topicMap.set(keyword, {
            frequency: 0,
            sentiments: [],
            sources: new Set(),
            relatedKeywords: new Set(),
          });
        }

        const topicData = topicMap.get(keyword)!;
        topicData.frequency++;
        topicData.sentiments.push(article.sentiment);
        topicData.sources.add(article.url.split('/')[2]); // Extract domain
        
        // Add related keywords from same article
        article.keywords.forEach(relatedKeyword => {
          if (relatedKeyword !== keyword) {
            topicData.relatedKeywords.add(relatedKeyword);
          }
        });
      });
    });

    // Convert to trending topics and sort by frequency
    const trendingTopics: TrendingTopic[] = Array.from(topicMap.entries())
      .filter(([topic, data]) => data.frequency >= 2) // Minimum frequency threshold
      .map(([topic, data]) => ({
        topic,
        sentiment: this.calculateAverageSentimentFromScores(data.sentiments),
        frequency: data.frequency,
        sources: Array.from(data.sources),
        relatedKeywords: Array.from(data.relatedKeywords).slice(0, 5),
        marketRelevance: this.calculateMarketRelevance(topic, data.frequency, articles.length),
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10); // Top 10 trending topics

    return trendingTopics;
  }

  private generateKeyInsights(
    sourceAnalysis: SourceSentimentAnalysis[],
    trendingTopics: TrendingTopic[],
    overallSentiment: SentimentScore
  ): KeyInsight[] {
    const insights: KeyInsight[] = [];

    // Sentiment shift insight
    if (overallSentiment.magnitude > 0.6) {
      insights.push({
        type: InsightType.SENTIMENT_SHIFT,
        description: `Significant ${overallSentiment.classification} sentiment detected across news sources`,
        confidence: overallSentiment.confidence,
        supportingData: { sentimentScore: overallSentiment.score, magnitude: overallSentiment.magnitude },
        marketImplication: this.getSentimentImplication(overallSentiment.classification),
      });
    }

    // Trending topic insights
    const highImpactTopics = trendingTopics.filter(topic => topic.marketRelevance > 0.7);
    if (highImpactTopics.length > 0) {
      insights.push({
        type: InsightType.TRENDING_TOPIC,
        description: `High-impact topics trending: ${highImpactTopics.slice(0, 3).map(t => t.topic).join(', ')}`,
        confidence: 0.8,
        supportingData: { topics: highImpactTopics.slice(0, 3) },
        marketImplication: 'These topics may influence market sentiment and trading activity',
      });
    }

    // Risk alert insight
    const negativeTopics = trendingTopics.filter(topic => 
      topic.sentiment.classification === 'negative' || topic.sentiment.classification === 'very_negative'
    );
    if (negativeTopics.length >= 3) {
      insights.push({
        type: InsightType.RISK_ALERT,
        description: `Multiple negative sentiment topics detected: ${negativeTopics.slice(0, 3).map(t => t.topic).join(', ')}`,
        confidence: 0.75,
        supportingData: { negativeTopics: negativeTopics.slice(0, 3) },
        marketImplication: 'Increased market risk and potential volatility',
      });
    }

    return insights.slice(0, 5); // Limit to top 5 insights
  }

  private analyzeMarketImpact(
    overallSentiment: SentimentScore,
    trendingTopics: TrendingTopic[],
    articles: ArticleSentimentAnalysis[]
  ): MarketImpactAnalysis {
    // Calculate overall impact based on sentiment and magnitude
    const overallImpact = overallSentiment.score * overallSentiment.magnitude;

    // Analyze sector impacts
    const sectorImpacts = this.analyzeSectorImpacts(articles, trendingTopics);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallSentiment, trendingTopics);

    // Determine time horizon
    const timeHorizon = this.determineTimeHorizon(trendingTopics);

    return {
      overallImpact,
      sectorImpacts,
      riskLevel,
      timeHorizon,
      confidenceLevel: overallSentiment.confidence,
    };
  }

  // Helper methods
  private normalizeSentimentScore(sentimentResult: any): SentimentScore {
    // Normalize the sentiment library output to our format
    const normalizedScore = Math.max(-1, Math.min(1, sentimentResult.score / 5)); // Normalize to -1 to 1
    const magnitude = Math.min(1, Math.abs(sentimentResult.score) / 5);
    
    return {
      score: normalizedScore,
      magnitude,
      classification: this.classifySentiment(normalizedScore),
      confidence: Math.min(1, magnitude * 0.8 + 0.2), // Base confidence calculation
    };
  }

  private classifySentiment(score: number): 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive' {
    if (score <= -0.6) return 'very_negative';
    if (score <= -0.2) return 'negative';
    if (score >= 0.6) return 'very_positive';
    if (score >= 0.2) return 'positive';
    return 'neutral';
  }

  private extractEntities(content: string): NamedEntity[] {
    // Simplified entity extraction - in production, would use NLP libraries
    const entities: NamedEntity[] = [];
    
    // Extract stock symbols
    const stockSymbols = content.match(/\b[A-Z]{2,5}\b/g) || [];
    stockSymbols.forEach(symbol => {
      if (symbol.length <= 5) {
        entities.push({
          text: symbol,
          type: EntityType.FINANCIAL_INSTRUMENT,
          confidence: 0.7,
        });
      }
    });

    // Extract company names (simplified)
    const companies = ['Apple', 'Microsoft', 'Google', 'Tesla', 'Amazon', 'Meta', 'Netflix'];
    companies.forEach(company => {
      if (content.includes(company)) {
        entities.push({
          text: company,
          type: EntityType.COMPANY,
          confidence: 0.8,
        });
      }
    });

    return entities;
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const financialKeywords = [
      'market', 'economy', 'inflation', 'interest', 'rates', 'fed', 'growth',
      'recession', 'volatility', 'trading', 'investment', 'stocks', 'bonds'
    ];

    return words.filter(word => financialKeywords.includes(word));
  }

  private calculateRelevanceScore(content: string, targetKeywords?: string[]): number {
    if (!targetKeywords || targetKeywords.length === 0) return 0.5;

    const contentLower = content.toLowerCase();
    const matchCount = targetKeywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    ).length;

    return Math.min(1, matchCount / targetKeywords.length);
  }

  private calculateMarketImpact(sentiment: SentimentScore, entities: NamedEntity[]): number {
    // Base impact from sentiment
    let impact = Math.abs(sentiment.score) * sentiment.magnitude;

    // Boost impact if financial entities are mentioned
    const financialEntities = entities.filter(e => 
      e.type === EntityType.FINANCIAL_INSTRUMENT || e.type === EntityType.COMPANY
    );
    
    impact *= (1 + financialEntities.length * 0.1);

    return Math.min(1, impact);
  }

  private calculateAverageSentiment(articles: ArticleSentimentAnalysis[]): SentimentScore {
    if (articles.length === 0) {
      return { score: 0, magnitude: 0, classification: 'neutral', confidence: 0 };
    }

    const totalScore = articles.reduce((sum, article) => sum + article.sentiment.score, 0);
    const totalMagnitude = articles.reduce((sum, article) => sum + article.sentiment.magnitude, 0);
    const totalConfidence = articles.reduce((sum, article) => sum + article.sentiment.confidence, 0);

    const avgScore = totalScore / articles.length;
    const avgMagnitude = totalMagnitude / articles.length;
    const avgConfidence = totalConfidence / articles.length;

    return {
      score: avgScore,
      magnitude: avgMagnitude,
      classification: this.classifySentiment(avgScore),
      confidence: avgConfidence,
    };
  }

  private calculateAverageSentimentFromScores(sentiments: SentimentScore[]): SentimentScore {
    if (sentiments.length === 0) {
      return { score: 0, magnitude: 0, classification: 'neutral', confidence: 0 };
    }

    const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    const avgMagnitude = sentiments.reduce((sum, s) => sum + s.magnitude, 0) / sentiments.length;
    const avgConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length;

    return {
      score: avgScore,
      magnitude: avgMagnitude,
      classification: this.classifySentiment(avgScore),
      confidence: avgConfidence,
    };
  }

  private getTopKeywords(articles: ArticleSentimentAnalysis[]): string[] {
    const keywordCounts = new Map<string, number>();

    articles.forEach(article => {
      article.keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    return Array.from(keywordCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  private calculateMarketRelevance(topic: string, frequency: number, totalArticles: number): number {
    const relativeFrequency = frequency / totalArticles;
    
    // Boost relevance for financial terms
    const financialTerms = ['market', 'economy', 'fed', 'rates', 'inflation', 'stocks', 'bonds'];
    const isFinancialTerm = financialTerms.some(term => topic.includes(term));
    
    return Math.min(1, relativeFrequency * 5 * (isFinancialTerm ? 1.5 : 1));
  }

  private getSentimentImplication(classification: string): string {
    const implications = {
      'very_positive': 'Strong bullish sentiment may drive market optimism and buying interest',
      'positive': 'Positive sentiment supports market confidence and moderate growth',
      'neutral': 'Balanced sentiment suggests stable market conditions',
      'negative': 'Negative sentiment may increase market caution and selling pressure',
      'very_negative': 'Severely negative sentiment could trigger significant market volatility',
    };

    return implications[classification] || 'Mixed sentiment requires careful market monitoring';
  }

  private analyzeSectorImpacts(
    articles: ArticleSentimentAnalysis[],
    trendingTopics: TrendingTopic[]
  ): SectorImpact[] {
    const sectors = [
      { name: 'Technology', keywords: ['tech', 'software', 'ai', 'digital'] },
      { name: 'Financial', keywords: ['bank', 'finance', 'credit', 'lending'] },
      { name: 'Energy', keywords: ['oil', 'gas', 'energy', 'renewable'] },
      { name: 'Healthcare', keywords: ['health', 'pharma', 'medical', 'drug'] },
    ];

    return sectors.map(sector => {
      const relevantArticles = articles.filter(article =>
        sector.keywords.some(keyword =>
          article.title.toLowerCase().includes(keyword) ||
          article.summary.toLowerCase().includes(keyword)
        )
      );

      const avgSentiment = this.calculateAverageSentiment(relevantArticles);
      const impact = avgSentiment.score * avgSentiment.magnitude;

      return {
        sector: sector.name,
        impact,
        reasoning: `Based on ${relevantArticles.length} relevant articles with ${avgSentiment.classification} sentiment`,
        affectedSymbols: [], // Would be populated with actual symbol analysis
      };
    }).filter(sector => Math.abs(sector.impact) > 0.1); // Only include sectors with meaningful impact
  }

  private determineRiskLevel(
    sentiment: SentimentScore,
    trendingTopics: TrendingTopic[]
  ): 'low' | 'medium' | 'high' | 'very_high' {
    const negativeTopics = trendingTopics.filter(t => t.sentiment.score < -0.3).length;
    const sentimentMagnitude = Math.abs(sentiment.score);

    if (sentimentMagnitude > 0.8 || negativeTopics >= 5) return 'very_high';
    if (sentimentMagnitude > 0.6 || negativeTopics >= 3) return 'high';
    if (sentimentMagnitude > 0.3 || negativeTopics >= 1) return 'medium';
    return 'low';
  }

  private determineTimeHorizon(trendingTopics: TrendingTopic[]): 'immediate' | 'short_term' | 'medium_term' | 'long_term' {
    // Simplified logic - in production would analyze topic urgency indicators
    const urgentKeywords = ['breaking', 'urgent', 'immediate', 'emergency'];
    const hasUrgentTopics = trendingTopics.some(topic =>
      urgentKeywords.some(keyword => topic.topic.includes(keyword))
    );

    if (hasUrgentTopics) return 'immediate';
    if (trendingTopics.length > 7) return 'short_term';
    if (trendingTopics.length > 4) return 'medium_term';
    return 'long_term';
  }

  private generateRandomDate(timeRange?: { start: Date; end: Date }): Date {
    const start = timeRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const end = timeRange?.end || new Date();
    
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private generateAnalysisId(): string {
    return `sa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Supporting interfaces
interface TrendingTopicData {
  frequency: number;
  sentiments: SentimentScore[];
  sources: Set<string>;
  relatedKeywords: Set<string>;
}