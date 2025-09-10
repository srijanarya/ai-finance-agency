import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import Redis from 'ioredis';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number;      // Maximum requests per window
  keyGenerator?: (req: Request) => string;
  skipIf?: (req: Request) => boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  totalRequests: number;
}

@Injectable()
export class RateLimitingService implements OnModuleInit {
  private readonly logger = new Logger(RateLimitingService.name);
  private redis: Redis;
  private defaultConfig: RateLimitConfig;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('redis.url');
    this.redis = new Redis(redisUrl);

    this.defaultConfig = {
      windowMs: this.configService.get('rateLimit.ttl', 60000), // 1 minute
      max: this.configService.get('rateLimit.limit', 100),
      keyGenerator: (req: Request) => req.ip,
    };
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.redis.ping();
      this.logger.log('Rate limiting service connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis for rate limiting:', error.message);
    }
  }

  async checkRateLimit(
    req: Request,
    res: Response,
    config?: Partial<RateLimitConfig>
  ): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Skip if condition is met
    if (finalConfig.skipIf && finalConfig.skipIf(req)) {
      return {
        allowed: true,
        info: {
          limit: finalConfig.max,
          remaining: finalConfig.max,
          resetTime: new Date(Date.now() + finalConfig.windowMs),
          totalRequests: 0,
        },
      };
    }

    const key = finalConfig.keyGenerator(req);
    const now = Date.now();
    const window = Math.floor(now / finalConfig.windowMs);
    const redisKey = `rate_limit:${key}:${window}`;

    try {
      const multi = this.redis.multi();
      multi.incr(redisKey);
      multi.expire(redisKey, Math.ceil(finalConfig.windowMs / 1000));
      
      const results = await multi.exec();
      const count = results[0][1] as number;

      const resetTime = new Date((window + 1) * finalConfig.windowMs);
      const remaining = Math.max(0, finalConfig.max - count);
      const allowed = count <= finalConfig.max;

      const info: RateLimitInfo = {
        limit: finalConfig.max,
        remaining,
        resetTime,
        totalRequests: count,
      };

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', finalConfig.max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime.toISOString());
      res.setHeader('X-RateLimit-Window', finalConfig.windowMs);

      if (!allowed) {
        res.setHeader('Retry-After', Math.ceil(finalConfig.windowMs / 1000));
        
        if (finalConfig.onLimitReached) {
          finalConfig.onLimitReached(req, res);
        }
        
        this.logger.warn(`Rate limit exceeded for ${key}: ${count}/${finalConfig.max}`);
      }

      return { allowed, info };
    } catch (error) {
      this.logger.error('Rate limiting check failed:', error.message);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        info: {
          limit: finalConfig.max,
          remaining: finalConfig.max,
          resetTime: new Date(Date.now() + finalConfig.windowMs),
          totalRequests: 0,
        },
      };
    }
  }

  // Global rate limiting for all requests
  async checkGlobalRateLimit(req: Request, res: Response): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const globalConfig: RateLimitConfig = {
      windowMs: this.configService.get('rateLimit.globalTtl', 60000),
      max: this.configService.get('rateLimit.globalLimit', 1000),
      keyGenerator: () => 'global',
    };

    return this.checkRateLimit(req, res, globalConfig);
  }

  // Per-user rate limiting
  async checkUserRateLimit(req: Request, res: Response, userId: string): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const userConfig: RateLimitConfig = {
      windowMs: 60000, // 1 minute
      max: 60, // 60 requests per minute per user
      keyGenerator: () => `user:${userId}`,
    };

    return this.checkRateLimit(req, res, userConfig);
  }

  // Per-service rate limiting
  async checkServiceRateLimit(req: Request, res: Response, serviceName: string): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const serviceConfig: RateLimitConfig = {
      windowMs: 60000, // 1 minute
      max: 200, // 200 requests per minute per service
      keyGenerator: (req: Request) => `service:${serviceName}:${req.ip}`,
    };

    return this.checkRateLimit(req, res, serviceConfig);
  }

  // Premium user rate limiting (higher limits)
  async checkPremiumUserRateLimit(req: Request, res: Response, userId: string): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const premiumConfig: RateLimitConfig = {
      windowMs: 60000, // 1 minute
      max: 300, // 300 requests per minute for premium users
      keyGenerator: () => `premium_user:${userId}`,
    };

    return this.checkRateLimit(req, res, premiumConfig);
  }

  // API key rate limiting
  async checkApiKeyRateLimit(req: Request, res: Response, apiKey: string): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const apiKeyConfig: RateLimitConfig = {
      windowMs: 60000, // 1 minute
      max: 1000, // 1000 requests per minute for API keys
      keyGenerator: () => `api_key:${apiKey}`,
    };

    return this.checkRateLimit(req, res, apiKeyConfig);
  }

  // Get current rate limit status for a key
  async getRateLimitStatus(key: string, windowMs: number = 60000): Promise<RateLimitInfo | null> {
    try {
      const now = Date.now();
      const window = Math.floor(now / windowMs);
      const redisKey = `rate_limit:${key}:${window}`;
      
      const count = await this.redis.get(redisKey);
      const totalRequests = count ? parseInt(count, 10) : 0;
      
      const limit = this.defaultConfig.max;
      const resetTime = new Date((window + 1) * windowMs);
      const remaining = Math.max(0, limit - totalRequests);

      return {
        limit,
        remaining,
        resetTime,
        totalRequests,
      };
    } catch (error) {
      this.logger.error('Failed to get rate limit status:', error.message);
      return null;
    }
  }

  // Reset rate limit for a key
  async resetRateLimit(key: string, windowMs: number = 60000): Promise<boolean> {
    try {
      const now = Date.now();
      const window = Math.floor(now / windowMs);
      const redisKey = `rate_limit:${key}:${window}`;
      
      await this.redis.del(redisKey);
      this.logger.log(`Rate limit reset for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to reset rate limit:', error.message);
      return false;
    }
  }

  // Get all active rate limits (for monitoring)
  async getActiveRateLimits(): Promise<{ [key: string]: RateLimitInfo }> {
    try {
      const pattern = 'rate_limit:*';
      const keys = await this.redis.keys(pattern);
      const result: { [key: string]: RateLimitInfo } = {};

      for (const redisKey of keys) {
        const count = await this.redis.get(redisKey);
        const ttl = await this.redis.ttl(redisKey);
        
        if (count && ttl > 0) {
          const keyParts = redisKey.split(':');
          const originalKey = keyParts.slice(1, -1).join(':');
          
          result[originalKey] = {
            limit: this.defaultConfig.max,
            remaining: Math.max(0, this.defaultConfig.max - parseInt(count, 10)),
            resetTime: new Date(Date.now() + ttl * 1000),
            totalRequests: parseInt(count, 10),
          };
        }
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to get active rate limits:', error.message);
      return {};
    }
  }
}