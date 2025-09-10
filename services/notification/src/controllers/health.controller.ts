import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationHealthIndicator } from '../health/notification.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private notificationHealth: NotificationHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check service health' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
  })
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),
      
      // Memory health - fail if using more than 512MB heap
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
      
      // Memory health - fail if RSS memory is over 512MB
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
      
      // Disk health - fail if less than 1GB available
      () => this.disk.checkStorage('storage', {
        path: '/',
        thresholdPercent: 0.9, // 90% threshold
      }),

      // Custom notification service health
      () => this.notificationHealth.isHealthy('notification_service'),
    ]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check if service is ready to accept requests' })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
  })
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.notificationHealth.isHealthy('notification_service'),
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Check if service is alive' })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  alive() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'notification-service',
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}