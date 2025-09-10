import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check service health' })
  @ApiResponse({
    status: 200,
    description: 'Health check passed',
  })
  @ApiResponse({
    status: 503,
    description: 'Health check failed',
  })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check if service is ready to accept requests' })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
  })
  readiness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'risk-management',
      version: '1.0.0',
      ready: true,
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Check if service is alive' })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'risk-management',
      version: '1.0.0',
      uptime: process.uptime(),
    };
  }
}