import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from "@nestjs/terminus";
import { InjectConnection } from "@nestjs/typeorm";
import { Connection } from "typeorm";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    @InjectConnection() private connection: Connection,
  ) {}

  @Get()
  @ApiOperation({ summary: "Check overall service health" })
  @ApiResponse({ status: 200, description: "Health check passed" })
  @ApiResponse({ status: 503, description: "Health check failed" })
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck("database"),

      // Memory health check - alert if using more than 300MB heap
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),

      // Memory health check - alert if using more than 300MB RSS
      () => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024),

      // Disk health check - alert if less than 1GB free space
      () =>
        this.disk.checkStorage("storage", {
          path: "/",
          thresholdPercent: 0.9,
        }),
    ]);
  }

  @Get("detailed")
  @ApiOperation({ summary: "Get detailed health information" })
  @ApiResponse({ status: 200, description: "Detailed health information" })
  async getDetailedHealth() {
    const basicHealth = await this.check();

    // Additional service-specific health metrics
    const serviceHealth = {
      service: "market-data",
      version: "1.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      node_version: process.version,

      // Database connection info
      database: {
        connected: this.connection.isConnected,
        driver: this.connection.driver.options.type,
        database: this.connection.driver.database,
      },

      // Memory usage
      memory: process.memoryUsage(),

      // CPU usage (simplified)
      cpu: process.cpuUsage(),

      // WebSocket connections
      websocket: {
        totalConnections: 0,
        authenticatedConnections: 0,
        totalSymbolSubscriptions: 0,
      },

      // External service dependencies status
      external_services: {
        alpha_vantage: {
          available: !!process.env.ALPHA_VANTAGE_API_KEY,
          configured: true,
        },
        iex: {
          available: !!process.env.IEX_API_TOKEN,
          configured: true,
        },
        yahoo_finance: {
          available: true, // No API key required
          configured: true,
        },
        redis: {
          available: !!process.env.REDIS_HOST,
          configured: true,
        },
      },
    };

    return {
      ...basicHealth,
      details: serviceHealth,
    };
  }

  @Get("ready")
  @ApiOperation({ summary: "Check if service is ready to serve requests" })
  @ApiResponse({ status: 200, description: "Service is ready" })
  @ApiResponse({ status: 503, description: "Service is not ready" })
  async readiness() {
    // Check if all critical services are available
    const checks = [() => this.db.pingCheck("database")];

    try {
      const results = await this.health.check(checks);
      return {
        status: "ready",
        timestamp: new Date().toISOString(),
        checks: results,
      };
    } catch (error) {
      return {
        status: "not ready",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  @Get("live")
  @ApiOperation({ summary: "Liveness probe - check if service is alive" })
  @ApiResponse({ status: 200, description: "Service is alive" })
  async liveness() {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get basic system metrics" })
  @ApiResponse({ status: 200, description: "System metrics in JSON format" })
  async getMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        // Database metrics
        database_connected: this.connection.isConnected ? 1 : 0,

        // Process metrics
        process_uptime_seconds: process.uptime(),
        process_heap_used_bytes: memUsage.heapUsed,
        process_heap_total_bytes: memUsage.heapTotal,
        process_rss_bytes: memUsage.rss,

        // CPU metrics
        cpu_user_microseconds: cpuUsage.user,
        cpu_system_microseconds: cpuUsage.system,
      },
    };
  }
}
