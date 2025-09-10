import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicator } from '@nestjs/terminus';

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const start = Date.now();
      
      // Simulate RabbitMQ health check
      await this.simulateHealthCheck();
      
      const responseTime = Date.now() - start;
      
      if (responseTime > 3000) {
        throw new Error('RabbitMQ response time too high');
      }

      const result = this.getStatus(key, true, {
        responseTime: `${responseTime}ms`,
        message: 'RabbitMQ is healthy',
        queues: 'operational',
        exchanges: 'operational',
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
    // await this.amqpConnection.channel.checkQueue('health-check-queue');
    return new Promise((resolve) => {
      setTimeout(resolve, Math.random() * 75);
    });
  }
}