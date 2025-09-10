import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicator } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const start = Date.now();
      
      // Simulate Redis health check
      await this.simulateHealthCheck();
      
      const responseTime = Date.now() - start;
      
      if (responseTime > 3000) {
        throw new Error('Redis response time too high');
      }

      const result = this.getStatus(key, true, {
        responseTime: `${responseTime}ms`,
        message: 'Redis is healthy',
      });

      return result;
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: error.message,
      });
      return result;
    }
  }

  private async simulateHealthCheck(): Promise<void> {
    // In a real implementation, this would be:
    // await this.redisClient.ping();
    return new Promise((resolve) => {
      setTimeout(resolve, Math.random() * 50);
    });
  }
}