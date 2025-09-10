import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private httpHealthIndicator: HttpHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      () => this.memoryHealthIndicator.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memoryHealthIndicator.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.diskHealthIndicator.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  @Get('live')
  @HealthCheck()
  liveness() {
    return this.healthCheckService.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.healthCheckService.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      () => this.memoryHealthIndicator.checkHeap('memory_heap', 200 * 1024 * 1024),
    ]);
  }
}