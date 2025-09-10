import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";

import { MarketData } from "../entities/market-data.entity";
import { CacheService } from "./cache.service";

export interface SystemMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  connections: {
    websocket: number;
    http: number;
    database: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  timestamp: Date;
}

export interface DataQualityMetrics {
  symbol: string;
  lastUpdate: Date;
  updateFrequency: number; // Updates per minute
  dataCompleteness: number; // Percentage
  anomalies: number;
  latency: number; // Milliseconds
}

export interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  category: "system" | "data" | "performance" | "security";
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private metrics: Map<string, any> = new Map();
  private alerts: Alert[] = [];
  private requestMetrics = {
    total: 0,
    successful: 0,
    failed: 0,
    responseTimes: [] as number[],
  };

  constructor(
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
    private cacheService: CacheService,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    this.logger.log("Initializing monitoring service...");

    // Set up event listeners
    this.setupEventListeners();

    // Initialize metrics collection
    this.collectSystemMetrics();
  }

  private setupEventListeners() {
    // Listen for market data updates
    this.eventEmitter.on("market.data.updated", (data) => {
      this.recordDataUpdate(data.symbol);
    });

    // Listen for errors
    this.eventEmitter.on("error", (error) => {
      this.createAlert({
        type: "error",
        category: "system",
        title: "System Error",
        message: error.message,
        metadata: { stack: error.stack },
      });
    });

    // Listen for WebSocket connections
    this.eventEmitter.on("websocket.connected", () => {
      this.incrementMetric("connections.websocket");
    });

    this.eventEmitter.on("websocket.disconnected", () => {
      this.decrementMetric("connections.websocket");
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async collectSystemMetrics(): Promise<void> {
    try {
      const metrics = await this.getSystemMetrics();

      // Store metrics
      await this.cacheService.set("system_metrics_latest", metrics, 300);

      // Check for anomalies
      this.checkSystemHealth(metrics);

      // Emit metrics event
      this.eventEmitter.emit("monitoring.metrics.collected", metrics);
    } catch (error) {
      this.logger.error("Error collecting system metrics:", error);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async performDataQualityCheck(): Promise<void> {
    try {
      this.logger.log("Performing data quality check...");

      const symbols = await this.getActiveSymbols();
      const qualityMetrics: DataQualityMetrics[] = [];

      for (const symbol of symbols) {
        const metrics = await this.checkDataQuality(symbol);
        qualityMetrics.push(metrics);

        // Alert if data quality is poor
        if (metrics.dataCompleteness < 80) {
          this.createAlert({
            type: "warning",
            category: "data",
            title: "Low Data Quality",
            message: `Data completeness for ${symbol} is ${metrics.dataCompleteness}%`,
            metadata: metrics,
          });
        }

        if (metrics.latency > 5000) {
          this.createAlert({
            type: "warning",
            category: "performance",
            title: "High Data Latency",
            message: `Data latency for ${symbol} is ${metrics.latency}ms`,
            metadata: metrics,
          });
        }
      }

      // Store quality metrics
      await this.cacheService.set("data_quality_metrics", qualityMetrics, 600);

      this.logger.log("Data quality check completed");
    } catch (error) {
      this.logger.error("Error in data quality check:", error);
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const os = await import("os");
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();

    return {
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        loadAverage: os.loadavg(),
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      },
      connections: {
        websocket: this.getMetric("connections.websocket") || 0,
        http: this.getMetric("connections.http") || 0,
        database: this.getMetric("connections.database") || 0,
      },
      requests: {
        total: this.requestMetrics.total,
        successful: this.requestMetrics.successful,
        failed: this.requestMetrics.failed,
        averageResponseTime: this.calculateAverageResponseTime(),
      },
      timestamp: new Date(),
    };
  }

  async checkDataQuality(symbol: string): Promise<DataQualityMetrics> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get recent data points
      const recentData = await this.marketDataRepository.find({
        where: {
          symbol,
          timestamp: Between(oneHourAgo, now),
        },
        order: { timestamp: "DESC" },
      });

      if (recentData.length === 0) {
        return {
          symbol,
          lastUpdate: new Date(0),
          updateFrequency: 0,
          dataCompleteness: 0,
          anomalies: 0,
          latency: Infinity,
        };
      }

      const lastUpdate = recentData[0].timestamp;
      const updateFrequency = recentData.length / 60; // Updates per minute

      // Check data completeness
      const requiredFields = ["price", "volume", "bid", "ask"];
      let completeCount = 0;

      for (const data of recentData) {
        const isComplete = requiredFields.every((field) => data[field] != null);
        if (isComplete) completeCount++;
      }

      const dataCompleteness = (completeCount / recentData.length) * 100;

      // Detect anomalies
      const anomalies = this.detectAnomalies(recentData);

      // Calculate latency
      const latency = now.getTime() - lastUpdate.getTime();

      return {
        symbol,
        lastUpdate,
        updateFrequency,
        dataCompleteness,
        anomalies,
        latency,
      };
    } catch (error) {
      this.logger.error(`Error checking data quality for ${symbol}:`, error);
      throw error;
    }
  }

  private detectAnomalies(data: MarketData[]): number {
    let anomalies = 0;

    if (data.length < 2) return 0;

    for (let i = 1; i < data.length; i++) {
      const current = Number(data[i].price);
      const previous = Number(data[i - 1].price);

      // Check for price spikes (>10% change)
      const changePercent = Math.abs((current - previous) / previous) * 100;
      if (changePercent > 10) {
        anomalies++;
      }

      // Check for zero or negative prices
      if (current <= 0) {
        anomalies++;
      }

      // Check for volume anomalies
      if (data[i].volume && Number(data[i].volume) < 0) {
        anomalies++;
      }
    }

    return anomalies;
  }

  private checkSystemHealth(metrics: SystemMetrics): void {
    // Check CPU usage
    if (metrics.cpu.loadAverage[0] > 0.8) {
      this.createAlert({
        type: "warning",
        category: "performance",
        title: "High CPU Usage",
        message: `CPU load average is ${metrics.cpu.loadAverage[0].toFixed(2)}`,
        metadata: metrics.cpu,
      });
    }

    // Check memory usage
    if (metrics.memory.percentage > 85) {
      this.createAlert({
        type: "warning",
        category: "performance",
        title: "High Memory Usage",
        message: `Memory usage is ${metrics.memory.percentage.toFixed(1)}%`,
        metadata: metrics.memory,
      });
    }

    // Check request failure rate
    const failureRate = metrics.requests.failed / metrics.requests.total;
    if (failureRate > 0.05 && metrics.requests.total > 100) {
      this.createAlert({
        type: "error",
        category: "system",
        title: "High Failure Rate",
        message: `Request failure rate is ${(failureRate * 100).toFixed(1)}%`,
        metadata: metrics.requests,
      });
    }

    // Check response time
    if (metrics.requests.averageResponseTime > 1000) {
      this.createAlert({
        type: "warning",
        category: "performance",
        title: "Slow Response Time",
        message: `Average response time is ${metrics.requests.averageResponseTime.toFixed(0)}ms`,
        metadata: metrics.requests,
      });
    }
  }

  createAlert(params: Omit<Alert, "id" | "timestamp" | "resolved">): Alert {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...params,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Emit alert event
    this.eventEmitter.emit("monitoring.alert.created", alert);

    this.logger.warn(`Alert created: ${alert.title} - ${alert.message}`);

    // Store in cache for persistence
    this.cacheService.set(`alert_${alert.id}`, alert, 3600);

    return alert;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();

      // Emit resolution event
      this.eventEmitter.emit("monitoring.alert.resolved", alert);

      this.logger.log(`Alert resolved: ${alert.title}`);
      return true;
    }
    return false;
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  getAllAlerts(limit: number = 100): Alert[] {
    return this.alerts.slice(-limit);
  }

  recordRequest(responseTime: number, success: boolean): void {
    this.requestMetrics.total++;

    if (success) {
      this.requestMetrics.successful++;
    } else {
      this.requestMetrics.failed++;
    }

    // Keep only last 1000 response times
    if (this.requestMetrics.responseTimes.length >= 1000) {
      this.requestMetrics.responseTimes.shift();
    }
    this.requestMetrics.responseTimes.push(responseTime);
  }

  private calculateAverageResponseTime(): number {
    if (this.requestMetrics.responseTimes.length === 0) return 0;

    const sum = this.requestMetrics.responseTimes.reduce((a, b) => a + b, 0);
    return sum / this.requestMetrics.responseTimes.length;
  }

  private recordDataUpdate(symbol: string): void {
    const key = `data_update_${symbol}`;
    const current = this.getMetric(key) || { count: 0, lastUpdate: null };

    current.count++;
    current.lastUpdate = new Date();

    this.setMetric(key, current);
  }

  private incrementMetric(key: string): void {
    const current = this.getMetric(key) || 0;
    this.setMetric(key, current + 1);
  }

  private decrementMetric(key: string): void {
    const current = this.getMetric(key) || 0;
    this.setMetric(key, Math.max(0, current - 1));
  }

  private getMetric(key: string): any {
    return this.metrics.get(key);
  }

  private setMetric(key: string, value: any): void {
    this.metrics.set(key, value);
  }

  private async getActiveSymbols(): Promise<string[]> {
    const recentData = await this.marketDataRepository
      .createQueryBuilder("market_data")
      .select("DISTINCT symbol")
      .where("timestamp > :date", {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      })
      .getRawMany();

    return recentData.map((d) => d.symbol);
  }

  // Health check endpoint data
  async getHealthStatus(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    checks: Record<string, { status: string; message?: string }>;
    metrics: SystemMetrics;
    activeAlerts: number;
  }> {
    const metrics = await this.getSystemMetrics();
    const activeAlerts = this.getActiveAlerts();

    const checks: Record<string, { status: string; message?: string }> = {
      database: { status: "healthy" },
      cache: { status: "healthy" },
      websocket: { status: "healthy" },
      dataFeed: { status: "healthy" },
    };

    // Check database connectivity
    try {
      await this.marketDataRepository.count();
    } catch {
      checks.database = {
        status: "unhealthy",
        message: "Database connection failed",
      };
    }

    // Check cache
    try {
      await this.cacheService.get("health_check");
    } catch {
      checks.cache = { status: "degraded", message: "Cache not responding" };
    }

    // Check WebSocket connections
    if (metrics.connections.websocket === 0) {
      checks.websocket = {
        status: "degraded",
        message: "No WebSocket connections",
      };
    }

    // Determine overall status
    let status: "healthy" | "degraded" | "unhealthy" = "healthy";

    if (Object.values(checks).some((c) => c.status === "unhealthy")) {
      status = "unhealthy";
    } else if (
      Object.values(checks).some((c) => c.status === "degraded") ||
      activeAlerts.length > 5
    ) {
      status = "degraded";
    }

    return {
      status,
      checks,
      metrics,
      activeAlerts: activeAlerts.length,
    };
  }

  // Dashboard data
  async getDashboardData(): Promise<{
    systemMetrics: SystemMetrics;
    dataQuality: DataQualityMetrics[];
    activeAlerts: Alert[];
    recentActivity: any[];
  }> {
    const [systemMetrics, dataQuality, activeAlerts] = await Promise.all([
      this.getSystemMetrics(),
      this.cacheService.get<DataQualityMetrics[]>("data_quality_metrics") || [],
      Promise.resolve(this.getActiveAlerts()),
    ]);

    const recentActivity = await this.getRecentActivity();

    return {
      systemMetrics,
      dataQuality,
      activeAlerts,
      recentActivity,
    };
  }

  private async getRecentActivity(): Promise<any[]> {
    // Get recent market data updates
    const recentUpdates = await this.marketDataRepository.find({
      order: { updatedAt: "DESC" },
      take: 10,
      select: ["symbol", "price", "updatedAt"],
    });

    return recentUpdates.map((update) => ({
      type: "market_update",
      symbol: update.symbol,
      price: update.price,
      timestamp: update.updatedAt,
    }));
  }
}
