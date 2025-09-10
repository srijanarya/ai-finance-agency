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
import { MonitoringService } from "../services/monitoring.service";
import { MarketDataGateway } from "../gateways/market-data.gateway";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private monitoringService: MonitoringService,
    private marketDataGateway: MarketDataGateway,
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

      // WebSocket connections from the gateway
      websocket: this.marketDataGateway.getConnectionStats(),

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

  @Get("monitoring")
  @ApiOperation({ summary: "Get comprehensive monitoring dashboard data" })
  @ApiResponse({ status: 200, description: "Monitoring dashboard data" })
  async getMonitoringDashboard() {
    try {
      const [systemMetrics, healthStatus, dashboardData] = await Promise.all([
        this.monitoringService.getSystemMetrics(),
        this.monitoringService.getHealthStatus(),
        this.monitoringService.getDashboardData(),
      ]);

      const websocketStats = this.marketDataGateway.getConnectionStats();

      return {
        status: "success",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: {
          name: "market-data-service",
          version: "1.0.0",
          environment: process.env.NODE_ENV || "development",
        },
        health: healthStatus,
        metrics: {
          system: systemMetrics,
          websocket: websocketStats,
          database: {
            connected: this.connection.isConnected,
            driver: this.connection.driver.options.type,
          },
        },
        dashboard: dashboardData,
        alerts: {
          active: dashboardData.activeAlerts.length,
          recent: dashboardData.activeAlerts.slice(0, 5),
        },
      };
    } catch (error) {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get system metrics for Prometheus/Grafana" })
  @ApiResponse({ status: 200, description: "System metrics in JSON format" })
  async getMetrics() {
    try {
      const systemMetrics = await this.monitoringService.getSystemMetrics();
      const websocketStats = this.marketDataGateway.getConnectionStats();

      // Format metrics in a structure suitable for time-series databases
      return {
        timestamp: new Date().toISOString(),
        metrics: {
          // System metrics
          cpu_usage: systemMetrics.cpu.usage,
          cpu_load_1m: systemMetrics.cpu.loadAverage[0],
          cpu_load_5m: systemMetrics.cpu.loadAverage[1],
          cpu_load_15m: systemMetrics.cpu.loadAverage[2],

          // Memory metrics
          memory_used_bytes: systemMetrics.memory.used,
          memory_total_bytes: systemMetrics.memory.total,
          memory_usage_percent: systemMetrics.memory.percentage,

          // Connection metrics
          websocket_connections_total: websocketStats.totalConnections,
          websocket_authenticated_connections:
            websocketStats.authenticatedConnections,
          websocket_symbol_subscriptions:
            websocketStats.totalSymbolSubscriptions,

          // Request metrics
          http_requests_total: systemMetrics.requests.total,
          http_requests_successful: systemMetrics.requests.successful,
          http_requests_failed: systemMetrics.requests.failed,
          http_response_time_avg_ms: systemMetrics.requests.averageResponseTime,

          // Database metrics
          database_connected: this.connection.isConnected ? 1 : 0,

          // Process metrics
          process_uptime_seconds: process.uptime(),
          process_heap_used_bytes: process.memoryUsage().heapUsed,
          process_heap_total_bytes: process.memoryUsage().heapTotal,
        },
      };
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        error: error.message,
        metrics: {},
      };
    }
  }

  @Get("alerts")
  @ApiOperation({ summary: "Get active monitoring alerts" })
  @ApiResponse({ status: 200, description: "Active alerts" })
  async getAlerts() {
    try {
      const activeAlerts = this.monitoringService.getActiveAlerts();

      return {
        status: "success",
        timestamp: new Date().toISOString(),
        total: activeAlerts.length,
        alerts: activeAlerts.map((alert) => ({
          id: alert.id,
          type: alert.type,
          category: alert.category,
          title: alert.title,
          message: alert.message,
          timestamp: alert.timestamp,
          metadata: alert.metadata,
        })),
      };
    } catch (error) {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
        alerts: [],
      };
    }
  }
}
