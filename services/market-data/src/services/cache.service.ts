import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  refresh?: boolean; // Whether to refresh the cache on read
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL: number;
  private readonly cacheStats = new Map<string, {
    hits: number;
    misses: number;
    lastAccess: Date;
  }>();

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.defaultTTL = this.configService.get('CACHE_TTL', 60); // Default 60 seconds
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const cachedData = await this.cacheManager.get<T>(key);
      
      // Update cache statistics
      this.updateStats(key, !!cachedData);
      
      if (cachedData && options?.refresh) {
        // Reset TTL on read if refresh is enabled
        await this.set(key, cachedData, options.ttl);
      }
      
      return cachedData;
    } catch (error) {
      this.logger.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const cacheTTL = ttl || this.defaultTTL;
      await this.cacheManager.set(key, value, cacheTTL * 1000); // Convert to milliseconds
      this.logger.debug(`Cached ${key} with TTL ${cacheTTL}s`);
    } catch (error) {
      this.logger.error(`Error setting cache for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Deleted cache key ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache for key ${key}:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      // This requires Redis store to work properly
      const keys = await this.cacheManager.store.keys(pattern);
      if (keys && keys.length > 0) {
        await Promise.all(keys.map(key => this.delete(key)));
        this.logger.debug(`Deleted ${keys.length} cache keys matching pattern ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.cacheStats.clear();
      this.logger.log('Cache reset successfully');
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
      
      // If not in cache, execute factory function
      const value = await factory();
      
      // Store in cache
      await this.set(key, value, ttl);
      
      return value;
    } catch (error) {
      this.logger.error(`Error in getOrSet for key ${key}:`, error);
      throw error;
    }
  }

  async warmUp(keys: string[], factory: (key: string) => Promise<any>): Promise<void> {
    try {
      this.logger.log(`Warming up cache with ${keys.length} keys`);
      
      await Promise.all(
        keys.map(async (key) => {
          try {
            const value = await factory(key);
            await this.set(key, value);
          } catch (error) {
            this.logger.error(`Error warming up cache for key ${key}:`, error);
          }
        })
      );
      
      this.logger.log('Cache warm-up completed');
    } catch (error) {
      this.logger.error('Error during cache warm-up:', error);
    }
  }

  private updateStats(key: string, hit: boolean): void {
    const stats = this.cacheStats.get(key) || { hits: 0, misses: 0, lastAccess: new Date() };
    
    if (hit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
    stats.lastAccess = new Date();
    
    this.cacheStats.set(key, stats);
  }

  getStats(key?: string): any {
    if (key) {
      return this.cacheStats.get(key) || { hits: 0, misses: 0, lastAccess: null };
    }
    
    // Return overall statistics
    const stats = {
      totalKeys: this.cacheStats.size,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      keys: [] as any[]
    };
    
    this.cacheStats.forEach((value, k) => {
      stats.totalHits += value.hits;
      stats.totalMisses += value.misses;
      stats.keys.push({
        key: k,
        ...value,
        hitRate: value.hits / (value.hits + value.misses) || 0
      });
    });
    
    stats.hitRate = stats.totalHits / (stats.totalHits + stats.totalMisses) || 0;
    
    // Sort keys by most accessed
    stats.keys.sort((a, b) => (b.hits + b.misses) - (a.hits + a.misses));
    
    return stats;
  }

  // Batch operations for improved performance
  async mget<T>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    
    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        if (value !== null) {
          results.set(key, value);
        }
      })
    );
    
    return results;
  }

  async mset<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
    await Promise.all(
      Array.from(entries.entries()).map(([key, value]) =>
        this.set(key, value, ttl)
      )
    );
  }

  // TTL management
  async getTTL(key: string): Promise<number> {
    try {
      const ttl = await this.cacheManager.store.ttl(key);
      return ttl;
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  async extendTTL(key: string, additionalSeconds: number): Promise<void> {
    try {
      const value = await this.get(key);
      if (value !== null) {
        const currentTTL = await this.getTTL(key);
        const newTTL = Math.max(0, currentTTL) + additionalSeconds;
        await this.set(key, value, newTTL);
      }
    } catch (error) {
      this.logger.error(`Error extending TTL for key ${key}:`, error);
    }
  }
}