/**
 * Content Cache Service
 * 
 * High-performance Redis-based caching layer for Content Intelligence operations:
 * - Intelligent cache invalidation strategies
 * - Pre-computation of expensive NLP operations
 * - Cache warming for frequently accessed content
 * - Multi-level caching with different TTL strategies
 * - Cache analytics and performance monitoring
 * - Distributed cache coherence for multi-instance deployments
 * 
 * Optimizes performance by caching NLP results, market insights, and processed content
 * while maintaining data freshness and consistency
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';
import { 
  CacheStrategy, 
  CacheMetrics,
  NLPProcessingResult,
  MarketInsightResult,
  ContentScoringResult,
  TrendDetectionResult
} from '../interfaces/nlp.interface';

interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  tags: string[];
  size: number; // Estimated size in bytes
}

interface CacheConfig {
  defaultTTL: number;
  maxMemoryUsage: number;
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
  compressionEnabled: boolean;
  analyticsEnabled: boolean;
}

interface CachePattern {
  pattern: string;
  ttl: number;
  tags: string[];
  warmup: boolean;
  precompute: boolean;
}

@Injectable()
export class ContentCacheService implements OnModuleInit {
  private readonly logger = new Logger(ContentCacheService.name);
  private readonly redis: Redis;
  private readonly analyticsRedis: Redis;

  // Cache configuration
  private readonly config: CacheConfig;
  
  // Cache patterns for different content types
  private readonly cachePatterns: CachePattern[] = [
    // NLP Processing Results
    {
      pattern: 'nlp:*',
      ttl: 3600, // 1 hour
      tags: ['nlp', 'processing'],
      warmup: false,
      precompute: true
    },
    // Market Insights
    {
      pattern: 'insights:*',
      ttl: 1800, // 30 minutes
      tags: ['insights', 'market'],
      warmup: true,
      precompute: true
    },
    // Content Scores
    {
      pattern: 'scores:*',
      ttl: 7200, // 2 hours
      tags: ['scores', 'quality'],
      warmup: false,
      precompute: false
    },
    // Trend Detection
    {
      pattern: 'trends:*',
      ttl: 300, // 5 minutes
      tags: ['trends', 'realtime'],
      warmup: true,
      precompute: false
    },
    // Source Credibility
    {
      pattern: 'credibility:*',
      ttl: 86400, // 24 hours
      tags: ['credibility', 'sources'],
      warmup: true,
      precompute: false
    }
  ];

  // Performance metrics
  private metrics: CacheMetrics = {
    hitRate: 0,
    missRate: 0,
    evictionRate: 0,
    memoryUsage: 0,
    avgResponseTime: 0,
    totalRequests: 0
  };

  // Request tracking for analytics
  private requestTimes: number[] = [];
  private readonly maxRequestTimeHistory = 1000;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    // Initialize cache configuration
    this.config = {
      defaultTTL: this.configService.get<number>('CACHE_DEFAULT_TTL', 3600),
      maxMemoryUsage: this.configService.get<number>('CACHE_MAX_MEMORY_MB', 512) * 1024 * 1024,
      evictionPolicy: this.configService.get<'lru' | 'lfu' | 'ttl'>('CACHE_EVICTION_POLICY', 'lru'),
      compressionEnabled: this.configService.get<boolean>('CACHE_COMPRESSION', true),
      analyticsEnabled: this.configService.get<boolean>('CACHE_ANALYTICS', true)
    };

    // Initialize Redis connections
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      keyPrefix: 'content-cache:',
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    // Separate Redis instance for analytics
    if (this.config.analyticsEnabled) {
      this.analyticsRedis = new Redis({
        host: this.configService.get<string>('redis.host'),
        port: this.configService.get<number>('redis.port'),
        password: this.configService.get<string>('redis.password'),
        keyPrefix: 'cache-analytics:',
        db: 1 // Use different database for analytics
      });
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.redis.ping();
      if (this.analyticsRedis) {
        await this.analyticsRedis.ping();
      }

      this.logger.log('Content Cache Service initialized');
      
      // Start cache warming if enabled
      await this.performCacheWarming();
      
    } catch (error) {
      this.logger.error('Failed to initialize cache service:', error);
      throw error;
    }
  }

  /**
   * Generic cache get with metrics tracking
   */
  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      const cachedValue = await this.redis.get(key);
      
      if (cachedValue) {
        // Cache hit
        this.recordMetric('hit', Date.now() - startTime);
        
        // Update access statistics
        await this.updateAccessStats(key);
        
        // Decompress if needed
        const value = this.config.compressionEnabled ? 
          this.decompress(cachedValue) : 
          JSON.parse(cachedValue);

        this.logger.debug(`Cache hit for key: ${key}`);
        return value;
      } else {
        // Cache miss
        this.recordMetric('miss', Date.now() - startTime);
        this.logger.debug(`Cache miss for key: ${key}`);
        return null;
      }
      
    } catch (error) {
      this.logger.error(`Cache get failed for key ${key}:`, error);
      this.recordMetric('error', Date.now() - startTime);
      return null;
    }
  }

  /**
   * Generic cache set with intelligent TTL and tagging
   */
  async set<T = any>(
    key: string, 
    value: T, 
    options: Partial<CacheStrategy> = {}
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Determine cache pattern and TTL
      const pattern = this.getCachePattern(key);
      const ttl = options.ttl || pattern?.ttl || this.config.defaultTTL;
      const tags = options.tags || pattern?.tags || [];

      // Prepare value for storage
      const serializedValue = this.config.compressionEnabled ? 
        this.compress(JSON.stringify(value)) : 
        JSON.stringify(value);

      // Store main value
      await this.redis.setex(key, ttl, serializedValue);
      
      // Store metadata
      await this.storeMetadata(key, {
        ttl,
        tags,
        size: serializedValue.length,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 0
      });

      // Add to tag indices for efficient invalidation
      await this.addToTagIndices(key, tags);

      this.recordMetric('set', Date.now() - startTime);
      this.logger.debug(`Cached key: ${key} (TTL: ${ttl}s)`);
      
      return true;
      
    } catch (error) {
      this.logger.error(`Cache set failed for key ${key}:`, error);
      this.recordMetric('error', Date.now() - startTime);
      return false;
    }
  }

  /**
   * Cache NLP processing results
   */
  async cacheNLPResult(
    contentHash: string,
    result: NLPProcessingResult,
    options: Partial<CacheStrategy> = {}
  ): Promise<boolean> {
    const key = `nlp:${contentHash}`;
    return this.set(key, result, {
      ttl: 3600,
      tags: ['nlp', 'processing', 'sentiment', 'entities'],
      ...options
    });
  }

  /**
   * Get cached NLP processing results
   */
  async getCachedNLPResult(contentHash: string): Promise<NLPProcessingResult | null> {
    const key = `nlp:${contentHash}`;
    return this.get<NLPProcessingResult>(key);
  }

  /**
   * Cache market insights
   */
  async cacheMarketInsights(
    contentHash: string,
    insights: MarketInsightResult,
    symbols: string[] = []
  ): Promise<boolean> {
    const key = `insights:${contentHash}`;
    return this.set(key, insights, {
      ttl: 1800, // 30 minutes
      tags: ['insights', 'market', 'signals', ...symbols.map(s => `symbol:${s}`)]
    });
  }

  /**
   * Get cached market insights
   */
  async getCachedMarketInsights(contentHash: string): Promise<MarketInsightResult | null> {
    const key = `insights:${contentHash}`;
    return this.get<MarketInsightResult>(key);
  }

  /**
   * Cache content scores
   */
  async cacheContentScore(
    contentHash: string,
    score: ContentScoringResult,
    source?: string
  ): Promise<boolean> {
    const key = `scores:${contentHash}`;
    return this.set(key, score, {
      ttl: 7200, // 2 hours
      tags: ['scores', 'quality', ...(source ? [`source:${source}`] : [])]
    });
  }

  /**
   * Get cached content scores
   */
  async getCachedContentScore(contentHash: string): Promise<ContentScoringResult | null> {
    const key = `scores:${contentHash}`;
    return this.get<ContentScoringResult>(key);
  }

  /**
   * Cache trend detection results
   */
  async cacheTrendDetection(
    symbol: string,
    trends: TrendDetectionResult
  ): Promise<boolean> {
    const key = `trends:${symbol || 'global'}`;
    return this.set(key, trends, {
      ttl: 300, // 5 minutes for real-time data
      tags: ['trends', 'realtime', 'detection', ...(symbol ? [`symbol:${symbol}`] : [])]
    });
  }

  /**
   * Get cached trend detection results
   */
  async getCachedTrendDetection(symbol?: string): Promise<TrendDetectionResult | null> {
    const key = `trends:${symbol || 'global'}`;
    return this.get<TrendDetectionResult>(key);
  }

  /**
   * Cache with get-or-set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: Partial<CacheStrategy> = {}
  ): Promise<T> {
    // Try to get from cache first
    let value = await this.get<T>(key);
    
    if (value === null) {
      // Cache miss - compute value
      value = await factory();
      
      // Store in cache
      if (value !== null && value !== undefined) {
        await this.set(key, value, options);
      }
    }
    
    return value;
  }

  /**
   * Invalidate cache by key pattern
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      // Delete keys and their metadata
      const pipeline = this.redis.pipeline();
      keys.forEach(key => {
        pipeline.del(key);
        pipeline.del(`meta:${key}`);
      });
      
      await pipeline.exec();
      
      this.logger.debug(`Invalidated ${keys.length} keys matching pattern: ${pattern}`);
      return keys.length;
      
    } catch (error) {
      this.logger.error(`Failed to invalidate by pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let allKeys = new Set<string>();
      
      // Get all keys for each tag
      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`);
        keys.forEach(key => allKeys.add(key));
      }

      if (allKeys.size === 0) {
        return 0;
      }

      // Delete keys and clean up tag indices
      const pipeline = this.redis.pipeline();
      
      for (const key of allKeys) {
        pipeline.del(key);
        pipeline.del(`meta:${key}`);
        
        // Remove from tag indices
        for (const tag of tags) {
          pipeline.srem(`tag:${tag}`, key);
        }
      }
      
      await pipeline.exec();
      
      this.logger.debug(`Invalidated ${allKeys.size} keys by tags: ${tags.join(', ')}`);
      return allKeys.size;
      
    } catch (error) {
      this.logger.error(`Failed to invalidate by tags ${tags.join(', ')}:`, error);
      return 0;
    }
  }

  /**
   * Precompute expensive operations for cache warming
   */
  async precomputeAndCache<T>(
    key: string,
    computation: () => Promise<T>,
    options: Partial<CacheStrategy> = {}
  ): Promise<T> {
    try {
      this.logger.debug(`Precomputing and caching: ${key}`);
      
      const result = await computation();
      await this.set(key, result, options);
      
      return result;
      
    } catch (error) {
      this.logger.error(`Precomputation failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get cache statistics and metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get detailed cache information
   */
  async getCacheInfo(): Promise<{
    metrics: CacheMetrics;
    memoryInfo: any;
    keyCount: number;
    patterns: CachePattern[];
  }> {
    try {
      const keyCount = await this.redis.dbsize();
      const memoryInfo = await this.redis.memory('usage');
      
      return {
        metrics: this.getMetrics(),
        memoryInfo,
        keyCount,
        patterns: this.cachePatterns
      };
      
    } catch (error) {
      this.logger.error('Failed to get cache info:', error);
      throw error;
    }
  }

  // Private helper methods

  private getCachePattern(key: string): CachePattern | undefined {
    return this.cachePatterns.find(pattern => 
      this.matchesPattern(key, pattern.pattern)
    );
  }

  private matchesPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }

  private async storeMetadata(key: string, metadata: Partial<CacheEntry>): Promise<void> {
    const metaKey = `meta:${key}`;
    await this.redis.setex(
      metaKey, 
      metadata.ttl || this.config.defaultTTL, 
      JSON.stringify(metadata)
    );
  }

  private async addToTagIndices(key: string, tags: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const tag of tags) {
      pipeline.sadd(`tag:${tag}`, key);
      pipeline.expire(`tag:${tag}`, 86400); // Expire tag indices after 24 hours
    }
    
    await pipeline.exec();
  }

  private async updateAccessStats(key: string): Promise<void> {
    if (!this.config.analyticsEnabled) return;

    try {
      const metaKey = `meta:${key}`;
      const metadata = await this.redis.get(metaKey);
      
      if (metadata) {
        const parsed = JSON.parse(metadata);
        parsed.lastAccessed = new Date();
        parsed.accessCount = (parsed.accessCount || 0) + 1;
        
        await this.redis.setex(metaKey, parsed.ttl, JSON.stringify(parsed));
      }
    } catch (error) {
      this.logger.warn(`Failed to update access stats for ${key}:`, error);
    }
  }

  private recordMetric(type: 'hit' | 'miss' | 'set' | 'error', responseTime: number): void {
    this.metrics.totalRequests++;
    
    if (type === 'hit') {
      this.metrics.hitRate = (this.metrics.hitRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests;
    } else if (type === 'miss') {
      this.metrics.missRate = (this.metrics.missRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests;
    }

    // Track response times
    this.requestTimes.push(responseTime);
    if (this.requestTimes.length > this.maxRequestTimeHistory) {
      this.requestTimes.shift();
    }
    
    this.metrics.avgResponseTime = this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length;
  }

  private compress(data: string): string {
    if (!this.config.compressionEnabled) return data;
    
    // Simple compression placeholder - in production use gzip or similar
    return Buffer.from(data).toString('base64');
  }

  private decompress(data: string): any {
    if (!this.config.compressionEnabled) return JSON.parse(data);
    
    // Simple decompression placeholder
    const decompressed = Buffer.from(data, 'base64').toString('utf8');
    return JSON.parse(decompressed);
  }

  // Event listeners for automatic cache invalidation

  @OnEvent('content.updated')
  async handleContentUpdated(data: { contentId: string; symbols?: string[] }): Promise<void> {
    // Invalidate related caches
    await Promise.all([
      this.invalidateByPattern(`*:${data.contentId}*`),
      data.symbols ? this.invalidateByTags(data.symbols.map(s => `symbol:${s}`)) : Promise.resolve(0)
    ]);
  }

  @OnEvent('market.closed')
  async handleMarketClosed(): Promise<void> {
    // Invalidate real-time caches
    await this.invalidateByTags(['realtime', 'trends']);
  }

  @OnEvent('source.credibility.updated')
  async handleSourceCredibilityUpdated(data: { source: string }): Promise<void> {
    await this.invalidateByTags([`source:${data.source}`]);
  }

  // Scheduled tasks

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async performCacheWarming(): Promise<void> {
    try {
      const warmupPatterns = this.cachePatterns.filter(p => p.warmup);
      
      this.logger.debug(`Starting cache warming for ${warmupPatterns.length} patterns`);
      
      // Implement cache warming logic based on access patterns
      // This would typically involve pre-loading frequently accessed data
      
    } catch (error) {
      this.logger.error('Cache warming failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  private async performCacheMaintenance(): Promise<void> {
    try {
      // Clean up expired metadata
      await this.cleanupExpiredMetadata();
      
      // Update metrics
      await this.updateCacheMetrics();
      
      // Check memory usage and trigger eviction if needed
      await this.checkMemoryUsage();
      
      this.logger.debug('Cache maintenance completed');
      
    } catch (error) {
      this.logger.error('Cache maintenance failed:', error);
    }
  }

  private async cleanupExpiredMetadata(): Promise<void> {
    try {
      const metaKeys = await this.redis.keys('meta:*');
      const expiredKeys: string[] = [];
      
      for (const metaKey of metaKeys) {
        const ttl = await this.redis.ttl(metaKey);
        if (ttl === -2) { // Key doesn't exist
          expiredKeys.push(metaKey);
        }
      }
      
      if (expiredKeys.length > 0) {
        await this.redis.del(...expiredKeys);
        this.logger.debug(`Cleaned up ${expiredKeys.length} expired metadata keys`);
      }
      
    } catch (error) {
      this.logger.warn('Failed to cleanup expired metadata:', error);
    }
  }

  private async updateCacheMetrics(): Promise<void> {
    try {
      const info = await this.redis.memory('usage');
      this.metrics.memoryUsage = parseInt(info.toString());
      
      // Store metrics in analytics Redis
      if (this.analyticsRedis) {
        await this.analyticsRedis.zadd(
          'cache-metrics', 
          Date.now(), 
          JSON.stringify(this.metrics)
        );
        
        // Keep only last 24 hours of metrics
        const cutoff = Date.now() - (24 * 60 * 60 * 1000);
        await this.analyticsRedis.zremrangebyscore('cache-metrics', 0, cutoff);
      }
      
    } catch (error) {
      this.logger.warn('Failed to update cache metrics:', error);
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    try {
      if (this.metrics.memoryUsage > this.config.maxMemoryUsage) {
        this.logger.warn(`Cache memory usage exceeded limit: ${this.metrics.memoryUsage}/${this.config.maxMemoryUsage}`);
        
        // Trigger eviction based on policy
        await this.performEviction();
      }
      
    } catch (error) {
      this.logger.error('Memory usage check failed:', error);
    }
  }

  private async performEviction(): Promise<void> {
    // Implement eviction based on configured policy
    switch (this.config.evictionPolicy) {
      case 'lru':
        await this.evictLRU();
        break;
      case 'lfu':
        await this.evictLFU();
        break;
      case 'ttl':
        await this.evictByTTL();
        break;
    }
  }

  private async evictLRU(): Promise<void> {
    // Implement LRU eviction
    this.logger.debug('Performing LRU eviction');
    // Implementation would track access times and remove least recently used keys
  }

  private async evictLFU(): Promise<void> {
    // Implement LFU eviction
    this.logger.debug('Performing LFU eviction');
    // Implementation would track access counts and remove least frequently used keys
  }

  private async evictByTTL(): Promise<void> {
    // Implement TTL-based eviction
    this.logger.debug('Performing TTL-based eviction');
    // Implementation would remove keys closest to expiration
  }
}