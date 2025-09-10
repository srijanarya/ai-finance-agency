import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicator } from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@Injectable()
export class ExternalServiceHealthIndicator extends HealthIndicator {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  async isHealthy(key: string, url: string, timeoutMs: number = 5000): Promise<HealthIndicatorResult> {
    try {
      const start = Date.now();
      
      await firstValueFrom(
        this.httpService.get(url).pipe(
          timeout(timeoutMs),
          catchError((error) => {
            throw new Error(`Service ${key} is unhealthy: ${error.message}`);
          })
        )
      );
      
      const responseTime = Date.now() - start;

      const result = this.getStatus(key, true, {
        url,
        responseTime: `${responseTime}ms`,
        message: `Service ${key} is healthy`,
      });

      return result;
    } catch (error) {
      const result = this.getStatus(key, false, {
        url,
        message: error.message,
      });
      return result;
    }
  }
}