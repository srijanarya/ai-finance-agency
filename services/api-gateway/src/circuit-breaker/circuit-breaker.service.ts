import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CircuitBreaker from 'opossum';

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  rollingCountTimeout?: number;
  rollingCountBuckets?: number;
  name?: string;
}

export interface RequestStats {
  successCount: number;
  errorCount: number;
  timeoutCount: number;
  failureRate: number;
  averageResponseTime: number;
  lastError?: Error;
  lastSuccess?: Date;
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

@Injectable()
export class CircuitBreakerService implements OnModuleInit {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private breakers = new Map<string, CircuitBreaker>();
  private stats = new Map<string, RequestStats>();
  private defaultOptions: CircuitBreaker.Options;

  constructor(private configService: ConfigService) {
    this.defaultOptions = {
      timeout: this.configService.get('circuitBreaker.timeout', 3000),
      errorThresholdPercentage: this.configService.get('circuitBreaker.errorThresholdPercentage', 50),
      resetTimeout: this.configService.get('circuitBreaker.resetTimeout', 30000),
      rollingCountTimeout: this.configService.get('circuitBreaker.rollingCountTimeout', 10000),
      rollingCountBuckets: this.configService.get('circuitBreaker.rollingCountBuckets', 10),
    };
  }

  onModuleInit() {
    this.logger.log('Circuit Breaker Service initialized');
  }

  createBreaker<T>(
    action: (...args: any[]) => Promise<T>,
    name: string,
    options?: CircuitBreakerOptions
  ): CircuitBreaker<any[], T> {
    if (this.breakers.has(name)) {
      return this.breakers.get(name);
    }

    const breakerOptions = { ...this.defaultOptions, ...options };
    const breaker = new CircuitBreaker(action, breakerOptions);

    // Initialize stats
    this.stats.set(name, {
      successCount: 0,
      errorCount: 0,
      timeoutCount: 0,
      failureRate: 0,
      averageResponseTime: 0,
      circuitState: 'CLOSED',
    });

    // Event listeners for monitoring
    breaker.on('open', () => {
      this.logger.warn(`Circuit breaker OPENED for ${name}`);
      this.updateCircuitState(name, 'OPEN');
    });

    breaker.on('halfOpen', () => {
      this.logger.log(`Circuit breaker HALF-OPEN for ${name}`);
      this.updateCircuitState(name, 'HALF_OPEN');
    });

    breaker.on('close', () => {
      this.logger.log(`Circuit breaker CLOSED for ${name}`);
      this.updateCircuitState(name, 'CLOSED');
    });

    breaker.on('success', (result, latency) => {
      this.updateSuccessStats(name, latency);
    });

    breaker.on('failure', (error) => {
      this.updateFailureStats(name, error);
    });

    breaker.on('timeout', () => {
      this.updateTimeoutStats(name);
    });

    breaker.on('reject', () => {
      this.logger.warn(`Request rejected by circuit breaker: ${name}`);
    });

    // Fallback function for when circuit is open
    breaker.fallback((error) => {
      this.logger.error(`Circuit breaker fallback triggered for ${name}:`, error.message);
      throw new Error(`Service ${name} is currently unavailable. Please try again later.`);
    });

    this.breakers.set(name, breaker);
    return breaker;
  }

  async executeWithBreaker<T>(
    name: string,
    action: (...args: any[]) => Promise<T>,
    options?: CircuitBreakerOptions,
    ...args: any[]
  ): Promise<T> {
    let breaker = this.breakers.get(name);
    
    if (!breaker) {
      breaker = this.createBreaker(action, name, options);
    }

    return breaker.fire(...args);
  }

  private updateCircuitState(name: string, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN') {
    const stats = this.stats.get(name);
    if (stats) {
      stats.circuitState = state;
      this.stats.set(name, stats);
    }
  }

  private updateSuccessStats(name: string, latency: number) {
    const stats = this.stats.get(name);
    if (stats) {
      stats.successCount++;
      stats.lastSuccess = new Date();
      
      // Update average response time
      const totalRequests = stats.successCount + stats.errorCount;
      stats.averageResponseTime = 
        ((stats.averageResponseTime * (totalRequests - 1)) + latency) / totalRequests;
      
      this.updateFailureRate(name);
      this.stats.set(name, stats);
    }
  }

  private updateFailureStats(name: string, error: Error) {
    const stats = this.stats.get(name);
    if (stats) {
      stats.errorCount++;
      stats.lastError = error;
      this.updateFailureRate(name);
      this.stats.set(name, stats);
    }
  }

  private updateTimeoutStats(name: string) {
    const stats = this.stats.get(name);
    if (stats) {
      stats.timeoutCount++;
      stats.errorCount++; // Timeouts count as errors
      this.updateFailureRate(name);
      this.stats.set(name, stats);
    }
  }

  private updateFailureRate(name: string) {
    const stats = this.stats.get(name);
    if (stats) {
      const totalRequests = stats.successCount + stats.errorCount;
      stats.failureRate = totalRequests > 0 ? (stats.errorCount / totalRequests) * 100 : 0;
    }
  }

  getStats(name: string): RequestStats | null {
    return this.stats.get(name) || null;
  }

  getAllStats(): Map<string, RequestStats> {
    return new Map(this.stats);
  }

  getBreakerState(name: string): 'CLOSED' | 'OPEN' | 'HALF_OPEN' | 'NOT_FOUND' {
    const breaker = this.breakers.get(name);
    if (!breaker) return 'NOT_FOUND';
    
    if (breaker.opened) return 'OPEN';
    if (breaker.halfOpen) return 'HALF_OPEN';
    return 'CLOSED';
  }

  resetBreaker(name: string): boolean {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.close();
      
      // Reset stats
      const stats = this.stats.get(name);
      if (stats) {
        stats.successCount = 0;
        stats.errorCount = 0;
        stats.timeoutCount = 0;
        stats.failureRate = 0;
        stats.averageResponseTime = 0;
        stats.circuitState = 'CLOSED';
        this.stats.set(name, stats);
      }
      
      this.logger.log(`Circuit breaker reset for ${name}`);
      return true;
    }
    return false;
  }

  // Health check method to verify circuit breaker functionality
  async healthCheck(): Promise<{ status: string; breakers: any[] }> {
    const breakerStatus = Array.from(this.breakers.keys()).map(name => ({
      name,
      state: this.getBreakerState(name),
      stats: this.getStats(name),
    }));

    return {
      status: 'healthy',
      breakers: breakerStatus,
    };
  }
}