import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  blockDuration?: number;  // Block duration in ms for exceeded limits
  skipSuccessfulRequests?: boolean;  // Only count failed requests
  skipFailedRequests?: boolean;  // Only count successful requests
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;  // Milliseconds until retry is allowed
  blocked?: boolean;
  blockExpiry?: Date;
}

export interface ThrottleConfig {
  delayMs: number;  // Minimum delay between requests
  maxConcurrent?: number;  // Maximum concurrent requests
  queueSize?: number;  // Maximum queue size
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly defaultConfig: RateLimitConfig;
  private readonly requestQueues = new Map<string, Promise<any>[]>();
  private readonly processingCounts = new Map<string, number>();

  constructor(
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {
    this.defaultConfig = {
      windowMs: this.configService.get('RATE_LIMIT_WINDOW_MS', 60000), // 1 minute
      maxRequests: this.configService.get('RATE_LIMIT_MAX_REQUESTS', 100),
      blockDuration: this.configService.get('RATE_LIMIT_BLOCK_DURATION', 300000), // 5 minutes
    };
  }

  async checkRateLimit(
    identifier: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const limitConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    
    try {
      // Check if user is blocked
      const blockKey = `rate_limit_block_${identifier}`;
      const blockExpiry = await this.cacheService.get<number>(blockKey);
      
      if (blockExpiry && blockExpiry > now) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(blockExpiry),
          retryAfter: blockExpiry - now,
          blocked: true,
          blockExpiry: new Date(blockExpiry),
        };
      }
      
      // Get current window data
      const windowKey = `rate_limit_${identifier}`;
      const windowData = await this.cacheService.get<{
        count: number;
        windowStart: number;
      }>(windowKey);
      
      let count = 0;
      let windowStart = now;
      
      if (windowData) {
        // Check if we're still in the same window
        if (now - windowData.windowStart < limitConfig.windowMs) {
          count = windowData.count;
          windowStart = windowData.windowStart;
        }
      }
      
      // Calculate remaining requests
      const remaining = Math.max(0, limitConfig.maxRequests - count);
      const resetTime = new Date(windowStart + limitConfig.windowMs);
      
      if (count >= limitConfig.maxRequests) {
        // Rate limit exceeded
        if (limitConfig.blockDuration) {
          // Block the user
          const blockUntil = now + limitConfig.blockDuration;
          await this.cacheService.set(blockKey, blockUntil, Math.ceil(limitConfig.blockDuration / 1000));
          
          this.logger.warn(`Rate limit exceeded for ${identifier}. Blocked until ${new Date(blockUntil)}`);
          
          return {
            allowed: false,
            remaining: 0,
            resetTime,
            retryAfter: resetTime.getTime() - now,
            blocked: true,
            blockExpiry: new Date(blockUntil),
          };
        }
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: resetTime.getTime() - now,
        };
      }
      
      // Increment counter
      await this.cacheService.set(
        windowKey,
        { count: count + 1, windowStart },
        Math.ceil(limitConfig.windowMs / 1000)
      );
      
      return {
        allowed: true,
        remaining: remaining - 1,
        resetTime,
      };
    } catch (error) {
      this.logger.error(`Error checking rate limit for ${identifier}:`, error);
      // On error, allow the request but log it
      return {
        allowed: true,
        remaining: -1,
        resetTime: new Date(now + this.defaultConfig.windowMs),
      };
    }
  }

  async throttle<T>(
    identifier: string,
    fn: () => Promise<T>,
    config?: ThrottleConfig
  ): Promise<T> {
    const throttleConfig: ThrottleConfig = {
      delayMs: config?.delayMs || 100,
      maxConcurrent: config?.maxConcurrent || 10,
      queueSize: config?.queueSize || 100,
    };
    
    try {
      // Check queue size
      const queue = this.requestQueues.get(identifier) || [];
      if (queue.length >= throttleConfig.queueSize!) {
        throw new Error(`Queue size exceeded for ${identifier}`);
      }
      
      // Check concurrent requests
      const processing = this.processingCounts.get(identifier) || 0;
      if (processing >= throttleConfig.maxConcurrent!) {
        // Add to queue
        return await this.queueRequest(identifier, fn, throttleConfig);
      }
      
      // Process immediately
      return await this.processRequest(identifier, fn, throttleConfig);
    } catch (error) {
      this.logger.error(`Error in throttle for ${identifier}:`, error);
      throw error;
    }
  }

  private async queueRequest<T>(
    identifier: string,
    fn: () => Promise<T>,
    config: ThrottleConfig
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queue = this.requestQueues.get(identifier) || [];
      
      const request = async () => {
        try {
          const result = await this.processRequest(identifier, fn, config);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      queue.push(request());
      this.requestQueues.set(identifier, queue);
    });
  }

  private async processRequest<T>(
    identifier: string,
    fn: () => Promise<T>,
    config: ThrottleConfig
  ): Promise<T> {
    // Increment processing count
    const current = this.processingCounts.get(identifier) || 0;
    this.processingCounts.set(identifier, current + 1);
    
    try {
      // Apply delay
      const lastRequestKey = `throttle_last_${identifier}`;
      const lastRequest = await this.cacheService.get<number>(lastRequestKey);
      
      if (lastRequest) {
        const elapsed = Date.now() - lastRequest;
        if (elapsed < config.delayMs) {
          await this.delay(config.delayMs - elapsed);
        }
      }
      
      // Update last request time
      await this.cacheService.set(lastRequestKey, Date.now(), 60);
      
      // Execute function
      const result = await fn();
      
      // Process next in queue if any
      this.processQueue(identifier, config);
      
      return result;
    } finally {
      // Decrement processing count
      const count = this.processingCounts.get(identifier) || 1;
      if (count <= 1) {
        this.processingCounts.delete(identifier);
      } else {
        this.processingCounts.set(identifier, count - 1);
      }
    }
  }

  private async processQueue(identifier: string, config: ThrottleConfig): Promise<void> {
    const queue = this.requestQueues.get(identifier) || [];
    if (queue.length === 0) return;
    
    const processing = this.processingCounts.get(identifier) || 0;
    if (processing >= config.maxConcurrent!) return;
    
    const next = queue.shift();
    if (next) {
      this.requestQueues.set(identifier, queue);
      // Process next request after delay
      setTimeout(() => next, config.delayMs);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // API-specific rate limits
  async checkApiLimit(
    apiKey: string,
    endpoint: string,
    tier: 'free' | 'basic' | 'premium' | 'enterprise' = 'free'
  ): Promise<RateLimitResult> {
    const configs: Record<string, RateLimitConfig> = {
      free: { windowMs: 60000, maxRequests: 10, blockDuration: 300000 },
      basic: { windowMs: 60000, maxRequests: 60, blockDuration: 60000 },
      premium: { windowMs: 60000, maxRequests: 300, blockDuration: 30000 },
      enterprise: { windowMs: 60000, maxRequests: 1000, blockDuration: 10000 },
    };
    
    const identifier = `api_${apiKey}_${endpoint}`;
    return await this.checkRateLimit(identifier, configs[tier]);
  }

  // WebSocket-specific rate limits
  async checkWebSocketLimit(
    clientId: string,
    messageType: string
  ): Promise<RateLimitResult> {
    const configs: Record<string, RateLimitConfig> = {
      subscribe: { windowMs: 10000, maxRequests: 10 },  // 10 subscriptions per 10 seconds
      unsubscribe: { windowMs: 10000, maxRequests: 10 },
      get_market_data: { windowMs: 1000, maxRequests: 20 },  // 20 requests per second
      ping: { windowMs: 1000, maxRequests: 5 },  // 5 pings per second
    };
    
    const config = configs[messageType] || { windowMs: 1000, maxRequests: 10 };
    const identifier = `ws_${clientId}_${messageType}`;
    
    return await this.checkRateLimit(identifier, config);
  }

  // IP-based rate limiting
  async checkIpLimit(
    ipAddress: string,
    endpoint?: string
  ): Promise<RateLimitResult> {
    const identifier = endpoint ? `ip_${ipAddress}_${endpoint}` : `ip_${ipAddress}`;
    return await this.checkRateLimit(identifier, {
      windowMs: 60000,  // 1 minute
      maxRequests: 100,  // 100 requests per minute per IP
      blockDuration: 600000,  // Block for 10 minutes if exceeded
    });
  }

  // User-based rate limiting
  async checkUserLimit(
    userId: string,
    action: string,
    tier: 'free' | 'premium' = 'free'
  ): Promise<RateLimitResult> {
    const configs = {
      free: { windowMs: 3600000, maxRequests: 100 },  // 100 per hour
      premium: { windowMs: 3600000, maxRequests: 1000 },  // 1000 per hour
    };
    
    const identifier = `user_${userId}_${action}`;
    return await this.checkRateLimit(identifier, configs[tier]);
  }

  // Get rate limit statistics
  async getRateLimitStats(identifier: string): Promise<{
    currentCount: number;
    windowStart: Date;
    isBlocked: boolean;
    blockExpiry?: Date;
  }> {
    const windowKey = `rate_limit_${identifier}`;
    const blockKey = `rate_limit_block_${identifier}`;
    
    const windowData = await this.cacheService.get<{
      count: number;
      windowStart: number;
    }>(windowKey);
    
    const blockExpiry = await this.cacheService.get<number>(blockKey);
    const now = Date.now();
    
    return {
      currentCount: windowData?.count || 0,
      windowStart: new Date(windowData?.windowStart || now),
      isBlocked: !!blockExpiry && blockExpiry > now,
      blockExpiry: blockExpiry && blockExpiry > now ? new Date(blockExpiry) : undefined,
    };
  }

  // Reset rate limit for an identifier
  async resetRateLimit(identifier: string): Promise<void> {
    const windowKey = `rate_limit_${identifier}`;
    const blockKey = `rate_limit_block_${identifier}`;
    
    await this.cacheService.delete(windowKey);
    await this.cacheService.delete(blockKey);
    
    this.logger.log(`Rate limit reset for ${identifier}`);
  }

  // Batch rate limit check for multiple identifiers
  async checkBatchRateLimit(
    identifiers: string[],
    config?: Partial<RateLimitConfig>
  ): Promise<Map<string, RateLimitResult>> {
    const results = new Map<string, RateLimitResult>();
    
    await Promise.all(
      identifiers.map(async (identifier) => {
        const result = await this.checkRateLimit(identifier, config);
        results.set(identifier, result);
      })
    );
    
    return results;
  }

  // Dynamic rate limiting based on system load
  async checkDynamicRateLimit(
    identifier: string,
    systemLoad: number  // 0-1, where 1 is maximum load
  ): Promise<RateLimitResult> {
    // Adjust rate limit based on system load
    const baseRequests = this.defaultConfig.maxRequests;
    const adjustedRequests = Math.floor(baseRequests * (1 - systemLoad * 0.5));
    
    return await this.checkRateLimit(identifier, {
      ...this.defaultConfig,
      maxRequests: Math.max(10, adjustedRequests),  // Minimum 10 requests
    });
  }

  // Distributed rate limiting (for multiple instances)
  async checkDistributedRateLimit(
    identifier: string,
    instanceId: string,
    totalInstances: number,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const limitConfig = { ...this.defaultConfig, ...config };
    
    // Divide rate limit by number of instances
    const instanceLimit = Math.ceil(limitConfig.maxRequests / totalInstances);
    
    const instanceIdentifier = `${identifier}_instance_${instanceId}`;
    return await this.checkRateLimit(instanceIdentifier, {
      ...limitConfig,
      maxRequests: instanceLimit,
    });
  }
}