/**
 * Content Intelligence Orchestrator Service
 * 
 * High-level orchestration service that coordinates all NLP operations
 * and provides intelligent workflow management for content processing:
 * 
 * - Intelligent workflow orchestration
 * - Batch processing optimization
 * - Performance monitoring and alerting
 * - Dynamic resource allocation
 * - Quality gate enforcement
 * - Workflow analytics and reporting
 * 
 * This service acts as the main entry point for complex content intelligence
 * workflows that require coordination between multiple NLP services.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';

// Services
import { NlpProcessingService } from './nlp-processing.service';
import { MarketInsightService } from './market-insight.service';
import { TrendDetectionService } from './trend-detection.service';
import { ContentScoringService } from './content-scoring.service';
import { ContentCacheService } from './content-cache.service';

// Interfaces
import {
  NLPProcessingResult,
  MarketInsightResult,
  ContentScoringResult,
  TrendDetectionResult,
  NLPProcessingOptions
} from '../interfaces/nlp.interface';

interface WorkflowConfig {
  enableParallelProcessing: boolean;
  maxConcurrency: number;
  timeoutMs: number;
  retryAttempts: number;
  qualityGateThreshold: number;
  cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
}

interface ContentItem {
  id: string;
  content: string;
  source: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ProcessingResult {
  contentId: string;
  nlp?: NLPProcessingResult;
  insights?: MarketInsightResult;
  score?: ContentScoringResult;
  trends?: TrendDetectionResult;
  processingTime: number;
  cached: boolean;
  qualityGatePassed: boolean;
  errors?: string[];
}

interface WorkflowMetrics {
  totalProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  qualityGateFailures: number;
  resourceUtilization: number;
  throughput: number; // items per minute
}

interface ResourceMonitor {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  queueSize: number;
  lastUpdated: Date;
}

@Injectable()
export class ContentIntelligenceOrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(ContentIntelligenceOrchestratorService.name);
  private readonly redis: Redis;

  // Configuration
  private readonly workflowConfig: WorkflowConfig;

  // Processing queues by priority
  private readonly queues = {
    critical: [] as ContentItem[],
    high: [] as ContentItem[],
    medium: [] as ContentItem[],
    low: [] as ContentItem[]
  };

  // Active processing tracking
  private activeProcessing = new Map<string, Date>();
  private readonly maxActiveJobs: number;

  // Metrics and monitoring
  private metrics: WorkflowMetrics = {
    totalProcessed: 0,
    successRate: 0,
    averageProcessingTime: 0,
    cacheHitRate: 0,
    qualityGateFailures: 0,
    resourceUtilization: 0,
    throughput: 0
  };

  private resourceMonitor: ResourceMonitor = {
    cpuUsage: 0,
    memoryUsage: 0,
    activeConnections: 0,
    queueSize: 0,
    lastUpdated: new Date()
  };

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private nlpProcessingService: NlpProcessingService,
    private marketInsightService: MarketInsightService,
    private trendDetectionService: TrendDetectionService,
    private contentScoringService: ContentScoringService,
    private contentCacheService: ContentCacheService,
  ) {
    // Initialize workflow configuration
    this.workflowConfig = {
      enableParallelProcessing: this.configService.get<boolean>('WORKFLOW_PARALLEL_PROCESSING', true),
      maxConcurrency: this.configService.get<number>('WORKFLOW_MAX_CONCURRENCY', 10),
      timeoutMs: this.configService.get<number>('WORKFLOW_TIMEOUT_MS', 30000),
      retryAttempts: this.configService.get<number>('WORKFLOW_RETRY_ATTEMPTS', 3),
      qualityGateThreshold: this.configService.get<number>('WORKFLOW_QUALITY_THRESHOLD', 70),
      cacheStrategy: this.configService.get<'aggressive' | 'balanced' | 'minimal'>('WORKFLOW_CACHE_STRATEGY', 'balanced')
    };

    this.maxActiveJobs = this.workflowConfig.maxConcurrency;

    // Initialize Redis connection
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      keyPrefix: 'orchestrator:',
      retryDelayOnFailure: 100,
      maxRetriesPerRequest: 3
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.redis.ping();
      this.logger.log('Content Intelligence Orchestrator initialized');
      
      // Load persisted queue state
      await this.loadPersistedQueues();
      
      // Start queue processing
      this.startQueueProcessing();
      
    } catch (error) {
      this.logger.error('Failed to initialize orchestrator:', error);
      throw error;
    }
  }

  /**
   * Main orchestration method for comprehensive content processing
   */
  async orchestrateContentProcessing(
    items: ContentItem[],
    options: {
      includeNLP?: boolean;
      includeInsights?: boolean;
      includeScoring?: boolean;
      includeTrends?: boolean;
      enforceQualityGate?: boolean;
      priority?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): Promise<{
    results: ProcessingResult[];
    summary: {
      totalItems: number;
      successful: number;
      failed: number;
      cached: number;
      qualityGateFailures: number;
      totalProcessingTime: number;
      averageProcessingTime: number;
    };
  }> {
    const startTime = Date.now();
    const results: ProcessingResult[] = [];
    
    try {
      this.logger.log(`Orchestrating processing for ${items.length} content items`);

      // Set default priority if not specified per item
      const processedItems = items.map(item => ({
        ...item,
        priority: item.priority || options.priority || 'medium'
      }));

      // Process items based on configuration
      if (this.workflowConfig.enableParallelProcessing && items.length > 1) {
        const batchResults = await this.processInParallel(processedItems, options);
        results.push(...batchResults);
      } else {
        for (const item of processedItems) {
          const result = await this.processItem(item, options);
          results.push(result);
        }
      }

      // Generate summary
      const successful = results.filter(r => !r.errors || r.errors.length === 0);
      const failed = results.filter(r => r.errors && r.errors.length > 0);
      const cached = results.filter(r => r.cached);
      const qualityGateFailures = results.filter(r => !r.qualityGatePassed);
      const totalProcessingTime = Date.now() - startTime;

      const summary = {
        totalItems: items.length,
        successful: successful.length,
        failed: failed.length,
        cached: cached.length,
        qualityGateFailures: qualityGateFailures.length,
        totalProcessingTime,
        averageProcessingTime: results.length > 0 ? 
          results.reduce((sum, r) => sum + r.processingTime, 0) / results.length : 0
      };

      // Update metrics
      this.updateMetrics(summary);

      // Emit completion event
      this.eventEmitter.emit('workflow.completed', {
        items: items.length,
        results: results.length,
        summary
      });

      return { results, summary };

    } catch (error) {
      this.logger.error('Orchestration failed:', error);
      throw error;
    }
  }

  /**
   * Queue-based processing for high-volume scenarios
   */
  async queueContentForProcessing(
    items: ContentItem[],
    options: {
      priority?: 'low' | 'medium' | 'high' | 'critical';
      batchSize?: number;
    } = {}
  ): Promise<{ queued: number; queueSizes: Record<string, number> }> {
    try {
      let queuedCount = 0;

      for (const item of items) {
        const priority = options.priority || item.priority || 'medium';
        item.priority = priority;
        
        this.queues[priority].push(item);
        queuedCount++;
      }

      // Persist queue state
      await this.persistQueues();

      // Update resource monitor
      this.resourceMonitor.queueSize = this.getTotalQueueSize();

      this.logger.log(`Queued ${queuedCount} items for processing`);

      return {
        queued: queuedCount,
        queueSizes: {
          critical: this.queues.critical.length,
          high: this.queues.high.length,
          medium: this.queues.medium.length,
          low: this.queues.low.length
        }
      };

    } catch (error) {
      this.logger.error('Failed to queue content:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive workflow analytics
   */
  async getWorkflowAnalytics(): Promise<{
    metrics: WorkflowMetrics;
    resourceMonitor: ResourceMonitor;
    queueStatus: Record<string, number>;
    activeJobs: number;
    configuration: WorkflowConfig;
  }> {
    return {
      metrics: { ...this.metrics },
      resourceMonitor: { ...this.resourceMonitor },
      queueStatus: {
        critical: this.queues.critical.length,
        high: this.queues.high.length,
        medium: this.queues.medium.length,
        low: this.queues.low.length,
        total: this.getTotalQueueSize()
      },
      activeJobs: this.activeProcessing.size,
      configuration: { ...this.workflowConfig }
    };
  }

  /**
   * Intelligent content workflow that adapts based on content characteristics
   */
  async intelligentWorkflow(
    content: string,
    source: string,
    metadata: Record<string, any> = {}
  ): Promise<{
    recommendation: 'full_processing' | 'basic_processing' | 'cache_only' | 'skip';
    processingPlan: string[];
    estimatedTime: number;
    cacheAvailable: boolean;
  }> {
    try {
      const contentHash = this.generateContentHash(content);
      
      // Check cache availability
      const [cachedNLP, cachedInsights, cachedScore] = await Promise.all([
        this.contentCacheService.getCachedNLPResult(contentHash),
        this.contentCacheService.getCachedMarketInsights(contentHash),
        this.contentCacheService.getCachedContentScore(contentHash)
      ]);

      const cacheAvailable = !!(cachedNLP || cachedInsights || cachedScore);

      // Analyze content characteristics
      const contentLength = content.length;
      const urgency = this.detectUrgency(content, metadata);
      const financialRelevance = this.assessFinancialRelevance(content);
      
      // Make intelligent recommendation
      let recommendation: 'full_processing' | 'basic_processing' | 'cache_only' | 'skip';
      let processingPlan: string[] = [];
      let estimatedTime = 0;

      if (cacheAvailable && this.workflowConfig.cacheStrategy === 'aggressive') {
        recommendation = 'cache_only';
        processingPlan = ['cache_retrieval'];
        estimatedTime = 50; // ms
      } else if (financialRelevance > 0.8 || urgency === 'critical') {
        recommendation = 'full_processing';
        processingPlan = ['nlp', 'insights', 'scoring', 'trends'];
        estimatedTime = this.estimateProcessingTime(contentLength, processingPlan.length);
      } else if (financialRelevance > 0.5 || contentLength > 1000) {
        recommendation = 'basic_processing';
        processingPlan = ['nlp', 'scoring'];
        estimatedTime = this.estimateProcessingTime(contentLength, processingPlan.length);
      } else if (financialRelevance < 0.2) {
        recommendation = 'skip';
        processingPlan = [];
        estimatedTime = 0;
      } else {
        recommendation = 'basic_processing';
        processingPlan = ['nlp'];
        estimatedTime = this.estimateProcessingTime(contentLength, 1);
      }

      return {
        recommendation,
        processingPlan,
        estimatedTime,
        cacheAvailable
      };

    } catch (error) {
      this.logger.error('Intelligent workflow analysis failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private async processInParallel(
    items: ContentItem[],
    options: any
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    const concurrency = Math.min(this.workflowConfig.maxConcurrency, items.length);
    
    // Sort by priority for processing order
    const sortedItems = [...items].sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const chunks = this.chunkArray(sortedItems, concurrency);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(item => this.processItem(item, options));
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            contentId: chunk[index].id,
            processingTime: 0,
            cached: false,
            qualityGatePassed: false,
            errors: [result.reason?.message || 'Processing failed']
          });
        }
      });
    }

    return results;
  }

  private async processItem(
    item: ContentItem,
    options: any
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const result: ProcessingResult = {
      contentId: item.id,
      processingTime: 0,
      cached: false,
      qualityGatePassed: true,
      errors: []
    };

    try {
      // Track active processing
      this.activeProcessing.set(item.id, new Date());

      const contentHash = this.generateContentHash(item.content);

      // Check cache based on strategy
      const shouldUseCache = this.shouldUseCache(item, options);
      
      if (shouldUseCache) {
        const cached = await this.getCachedResults(contentHash);
        if (cached.nlp || cached.insights || cached.score) {
          result.nlp = cached.nlp || undefined;
          result.insights = cached.insights || undefined;
          result.score = cached.score || undefined;
          result.cached = true;
        }
      }

      // Process what's not cached
      const processingTasks: Promise<any>[] = [];

      if (options.includeNLP !== false && !result.nlp) {
        processingTasks.push(
          this.nlpProcessingService.processText(item.content, this.getNLPOptions(item))
            .then(nlp => {
              result.nlp = nlp;
              return this.contentCacheService.cacheNLPResult(contentHash, nlp);
            })
        );
      }

      if (options.includeInsights && !result.insights) {
        processingTasks.push(
          this.marketInsightService.extractInsights(item.content)
            .then(insights => {
              result.insights = insights;
              return this.contentCacheService.cacheMarketInsights(contentHash, insights);
            })
        );
      }

      if (options.includeScoring !== false && !result.score) {
        processingTasks.push(
          this.contentScoringService.scoreContent(item.content, item.source)
            .then(score => {
              result.score = score;
              return this.contentCacheService.cacheContentScore(contentHash, score, item.source);
            })
        );
      }

      if (options.includeTrends && item.metadata?.symbols) {
        processingTasks.push(
          this.trendDetectionService.processContentForTrends(
            item.content, 
            item.source, 
            item.metadata
          )
        );
      }

      // Execute processing tasks
      if (processingTasks.length > 0) {
        await Promise.allSettled(processingTasks);
      }

      // Quality gate check
      if (options.enforceQualityGate && result.score) {
        result.qualityGatePassed = result.score.overallScore >= this.workflowConfig.qualityGateThreshold;
        if (!result.qualityGatePassed) {
          result.errors?.push(`Quality gate failed: ${result.score.overallScore} < ${this.workflowConfig.qualityGateThreshold}`);
        }
      }

      result.processingTime = Date.now() - startTime;

    } catch (error) {
      result.errors = [error.message];
      this.logger.error(`Processing failed for item ${item.id}:`, error);
    } finally {
      this.activeProcessing.delete(item.id);
    }

    return result;
  }

  private async getCachedResults(contentHash: string) {
    const [nlp, insights, score] = await Promise.all([
      this.contentCacheService.getCachedNLPResult(contentHash),
      this.contentCacheService.getCachedMarketInsights(contentHash),
      this.contentCacheService.getCachedContentScore(contentHash)
    ]);

    return { nlp, insights, score };
  }

  private shouldUseCache(item: ContentItem, options: any): boolean {
    switch (this.workflowConfig.cacheStrategy) {
      case 'aggressive':
        return true;
      case 'balanced':
        return item.priority !== 'critical';
      case 'minimal':
        return item.priority === 'low';
      default:
        return true;
    }
  }

  private getNLPOptions(item: ContentItem): NLPProcessingOptions {
    // Adaptive NLP options based on content characteristics
    const baseOptions: NLPProcessingOptions = {
      enableSentimentAnalysis: true,
      enableEntityExtraction: true,
      enableKeyPhraseExtraction: true,
      enableLanguageDetection: false, // Skip for performance
      confidenceThreshold: 0.6
    };

    // High priority items get full processing
    if (item.priority === 'critical' || item.priority === 'high') {
      baseOptions.enableTextSummarization = true;
      baseOptions.enableTopicModeling = true;
      baseOptions.useAdvancedNLP = true;
    }

    // Long content gets summarization
    if (item.content.length > 2000) {
      baseOptions.enableTextSummarization = true;
    }

    return baseOptions;
  }

  private detectUrgency(content: string, metadata: Record<string, any>): string {
    const urgentKeywords = ['breaking', 'urgent', 'immediate', 'alert', 'critical'];
    const hasUrgentKeywords = urgentKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (metadata.urgency) return metadata.urgency;
    if (hasUrgentKeywords) return 'high';
    return 'medium';
  }

  private assessFinancialRelevance(content: string): number {
    const financialKeywords = [
      'stock', 'share', 'market', 'trading', 'investment', 'earnings',
      'revenue', 'profit', 'dividend', 'NYSE', 'NASDAQ', 'SEC'
    ];

    const keywordCount = financialKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    ).length;

    return Math.min(1.0, keywordCount / 5); // Normalize to 0-1
  }

  private estimateProcessingTime(contentLength: number, stepCount: number): number {
    // Base time per processing step
    const baseTimePerStep = 200; // ms
    const lengthMultiplier = Math.max(1, contentLength / 1000);
    
    return Math.round(baseTimePerStep * stepCount * lengthMultiplier);
  }

  private updateMetrics(summary: any): void {
    this.metrics.totalProcessed += summary.totalItems;
    this.metrics.successRate = (this.metrics.successRate + (summary.successful / summary.totalItems)) / 2;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime + summary.averageProcessingTime) / 2;
    this.metrics.cacheHitRate = (this.metrics.cacheHitRate + (summary.cached / summary.totalItems)) / 2;
    this.metrics.qualityGateFailures += summary.qualityGateFailures;
    
    // Calculate throughput (items per minute)
    const processingTimeMinutes = summary.totalProcessingTime / (1000 * 60);
    this.metrics.throughput = summary.totalItems / Math.max(processingTimeMinutes, 1);
  }

  private startQueueProcessing(): void {
    // Start queue processing loop
    setInterval(async () => {
      if (this.activeProcessing.size < this.maxActiveJobs) {
        await this.processNextQueueItem();
      }
    }, 1000); // Check every second
  }

  private async processNextQueueItem(): Promise<void> {
    try {
      // Process in priority order
      const priorities: Array<keyof typeof this.queues> = ['critical', 'high', 'medium', 'low'];
      
      for (const priority of priorities) {
        if (this.queues[priority].length > 0) {
          const item = this.queues[priority].shift()!;
          
          // Process item asynchronously
          this.processItem(item, { 
            includeNLP: true, 
            includeScoring: true,
            includeInsights: priority === 'critical' || priority === 'high'
          }).catch(error => {
            this.logger.error(`Queue processing failed for item ${item.id}:`, error);
          });
          
          break;
        }
      }
    } catch (error) {
      this.logger.error('Queue processing error:', error);
    }
  }

  private getTotalQueueSize(): number {
    return Object.values(this.queues).reduce((total, queue) => total + queue.length, 0);
  }

  private async persistQueues(): Promise<void> {
    try {
      const queueData = {
        critical: this.queues.critical,
        high: this.queues.high,
        medium: this.queues.medium,
        low: this.queues.low,
        timestamp: new Date().toISOString()
      };
      
      await this.redis.set('queues', JSON.stringify(queueData), 'EX', 3600); // 1 hour
    } catch (error) {
      this.logger.warn('Failed to persist queues:', error);
    }
  }

  private async loadPersistedQueues(): Promise<void> {
    try {
      const queueData = await this.redis.get('queues');
      if (queueData) {
        const parsed = JSON.parse(queueData);
        this.queues.critical = parsed.critical || [];
        this.queues.high = parsed.high || [];
        this.queues.medium = parsed.medium || [];
        this.queues.low = parsed.low || [];
        
        this.logger.log(`Loaded ${this.getTotalQueueSize()} items from persisted queues`);
      }
    } catch (error) {
      this.logger.warn('Failed to load persisted queues:', error);
    }
  }

  private generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Scheduled monitoring and maintenance

  @Cron(CronExpression.EVERY_MINUTE)
  private async updateResourceMonitor(): Promise<void> {
    try {
      // Update resource monitoring metrics
      this.resourceMonitor = {
        cpuUsage: 0, // Would integrate with system monitoring
        memoryUsage: process.memoryUsage().heapUsed,
        activeConnections: this.activeProcessing.size,
        queueSize: this.getTotalQueueSize(),
        lastUpdated: new Date()
      };

      // Check for alerts
      if (this.resourceMonitor.queueSize > 1000) {
        this.eventEmitter.emit('alert.high_queue_size', this.resourceMonitor);
      }

      if (this.metrics.successRate < 0.9) {
        this.eventEmitter.emit('alert.low_success_rate', this.metrics);
      }

    } catch (error) {
      this.logger.error('Resource monitor update failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async persistMetrics(): Promise<void> {
    try {
      await this.redis.zadd(
        'workflow-metrics',
        Date.now(),
        JSON.stringify({
          metrics: this.metrics,
          resourceMonitor: this.resourceMonitor,
          timestamp: new Date()
        })
      );

      // Keep only last 24 hours of metrics
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      await this.redis.zremrangebyscore('workflow-metrics', 0, cutoff);

    } catch (error) {
      this.logger.warn('Failed to persist metrics:', error);
    }
  }
}