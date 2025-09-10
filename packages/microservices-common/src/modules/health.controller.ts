import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { 
  HealthCheck, 
  HealthCheckService, 
  HealthCheckResult,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.health';
import { ExternalServiceHealthIndicator } from './indicators/external-service.health';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthService: HealthService,
    private readonly db: DatabaseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly rabbitmq: RabbitMQHealthIndicator,
    private readonly externalService: ExternalServiceHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
      () => this.rabbitmq.isHealthy('rabbitmq'),
    ]);
  }

  @Get('live')
  @HealthCheck()
  liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.95 }),
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
    ]);
  }

  @Get('dependencies')
  @HealthCheck()
  dependencies(): Promise<HealthCheckResult> {
    const serviceName = process.env.SERVICE_NAME || 'unknown';
    const dependencies = this.healthService.getDependencies(serviceName);
    
    return this.health.check(
      dependencies.map(dep => () => this.externalService.isHealthy(dep.name, dep.url))
    );
  }

  @Get('detailed')
  async detailed() {
    const serviceName = process.env.SERVICE_NAME || 'unknown';
    const version = process.env.SERVICE_VERSION || '1.0.0';
    const environment = process.env.NODE_ENV || 'development';
    const uptime = process.uptime();
    
    try {
      const healthResult = await this.check();
      const readinessResult = await this.readiness();
      const dependenciesResult = await this.dependencies();

      return {
        service: serviceName,
        version,
        environment,
        uptime: Math.floor(uptime),
        timestamp: new Date().toISOString(),
        status: 'healthy',
        checks: {
          health: healthResult,
          readiness: readinessResult,
          dependencies: dependenciesResult,
        },
        metrics: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
        },
      };
    } catch (error) {
      return {
        service: serviceName,
        version,
        environment,
        uptime: Math.floor(uptime),
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: error.message,
        metrics: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
        },
      };
    }
  }
}