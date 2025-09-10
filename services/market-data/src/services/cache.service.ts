import { Injectable, Logger, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ConfigService } from "@nestjs/config";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  refresh?: boolean; // Whether to refresh the cache on read
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL: number;
  private readonly cacheStats = new Map<
    string,
    {
      hits: number;
      misses: number;
      lastAccess: Date;
    }
  >();

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.defaultTTL = this.configService.get("CACHE_TTL", 60); // Default 60 seconds
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
        await Promise.all(keys.map((key) => this.delete(key)));
        this.logger.debug(
          `Deleted ${keys.length} cache keys matching pattern ${pattern}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.cacheStats.clear();
      this.logger.log("Cache reset successfully");
    } catch (error) {
      this.logger.error("Error resetting cache:", error);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
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

  async warmUp(
    keys: string[],
    factory: (key: string) => Promise<any>,
  ): Promise<void> {
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
        }),
      );

      this.logger.log("Cache warm-up completed");
    } catch (error) {
      this.logger.error("Error during cache warm-up:", error);
    }
  }

  private updateStats(key: string, hit: boolean): void {
    const stats = this.cacheStats.get(key) || {
      hits: 0,
      misses: 0,
      lastAccess: new Date(),
    };

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
      return (
        this.cacheStats.get(key) || { hits: 0, misses: 0, lastAccess: null }
      );
    }

    // Return overall statistics
    const stats = {
      totalKeys: this.cacheStats.size,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      keys: [] as any[],
    };

    this.cacheStats.forEach((value, k) => {
      stats.totalHits += value.hits;
      stats.totalMisses += value.misses;
      stats.keys.push({
        key: k,
        ...value,
        hitRate: value.hits / (value.hits + value.misses) || 0,
      });
    });

    stats.hitRate =
      stats.totalHits / (stats.totalHits + stats.totalMisses) || 0;

    // Sort keys by most accessed
    stats.keys.sort((a, b) => b.hits + b.misses - (a.hits + a.misses));

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
      }),
    );

    return results;
  }

  async mset<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
    await Promise.all(
      Array.from(entries.entries()).map(([key, value]) =>
        this.set(key, value, ttl),
      ),
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

  // Tiered caching with different TTL strategies
  async setRealtimeData<T>(key: string, value: T): Promise<void> {
    // Real-time market data: 5-second TTL
    await this.set(key, value, 5);
  }

  async setAggregatedData<T>(key: string, value: T): Promise<void> {
    // Aggregated data (OHLC): 60-second TTL
    await this.set(key, value, 60);
  }

  async setTechnicalIndicators<T>(key: string, value: T): Promise<void> {
    // Technical indicators: 5-minute TTL
    await this.set(key, value, 300);
  }

  async setMarketStatistics<T>(key: string, value: T): Promise<void> {
    // Market statistics: 15-minute TTL
    await this.set(key, value, 900);
  }

  async setHistoricalData<T>(key: string, value: T): Promise<void> {
    // Historical data: 1-hour TTL
    await this.set(key, value, 3600);
  }

  async setMarketSession<T>(key: string, value: T): Promise<void> {
    // Market session data: 30-minute TTL
    await this.set(key, value, 1800);
  }

  async setUserWatchlist<T>(key: string, value: T): Promise<void> {
    // User watchlist data: 10-minute TTL
    await this.set(key, value, 600);
  }

  async setSystemConfig<T>(key: string, value: T): Promise<void> {
    // System configuration: 24-hour TTL
    await this.set(key, value, 86400);
  }

  // Cache warming methods
  async warmCache(
    keys: string[],
    fetchFn: (key: string) => Promise<any>,
  ): Promise<void> {
    try {
      const warmingTasks = keys.map(async (key) => {
        try {
          const cached = await this.get(key);
          if (cached === null) {
            // Cache miss - fetch and store
            const data = await fetchFn(key);
            if (data) {
              await this.set(key, data, 60); // Default 1-minute TTL for warmed data
            }
          }
        } catch (error) {
          this.logger.error(`Error warming cache for key ${key}:`, error);
        }
      });

      await Promise.allSettled(warmingTasks);
      this.logger.log(`Cache warming completed for ${keys.length} keys`);
    } catch (error) {
      this.logger.error("Error during cache warming:", error);
    }
  }

  // Intelligent cache management
  async getWithTieredFallback<T>(
    primaryKey: string,
    fallbackKeys: string[],
    fetchFn?: () => Promise<T>,
    ttl?: number,
  ): Promise<T | null> {
    try {
      // Try primary cache first
      let result = await this.get<T>(primaryKey);
      if (result !== null) {
        return result;
      }

      // Try fallback caches
      for (const fallbackKey of fallbackKeys) {
        result = await this.get<T>(fallbackKey);
        if (result !== null) {
          // Store in primary cache for faster future access
          await this.set(primaryKey, result, ttl || 60);
          return result;
        }
      }

      // If all caches miss and fetch function provided, fetch fresh data
      if (fetchFn) {
        result = await fetchFn();
        if (result !== null) {
          // Store in primary cache
          await this.set(primaryKey, result, ttl || 60);
          return result;
        }
      }

      return null;
    } catch (error) {
      this.logger.error("Error in tiered cache fallback:", error);
      return null;
    }
  }

  // Performance optimization: prefetch commonly accessed data
  async prefetchMarketData(symbols: string[]): Promise<void> {
    const prefetchTasks = symbols.map(async (symbol) => {
      const keys = [
        `market_data_${symbol}`,
        `aggregated_${symbol}_1m`,
        `aggregated_${symbol}_5m`,
        `stats_${symbol}_86400000`, // 24h stats
        `trend_${symbol}`,
      ];

      // Check which keys are missing from cache
      const missingKeys = [];
      for (const key of keys) {
        const exists = await this.get(key);
        if (exists === null) {
          missingKeys.push(key);
        }
      }

      if (missingKeys.length > 0) {
        this.logger.debug(
          `Prefetch needed for ${symbol}: ${missingKeys.length} keys missing`,
        );
        // In a real implementation, you'd trigger the appropriate service methods
        // to fetch and cache this data
      }
    });

    await Promise.allSettled(prefetchTasks);
  }
}
