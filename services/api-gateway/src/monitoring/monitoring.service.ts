import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as promClient from 'prom-client';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringService.name);
  private winstonLogger: winston.Logger;
  private registry: promClient.Registry;

  // Metrics
  private httpRequestsTotal: promClient.Counter<string>;
  private httpRequestDuration: promClient.Histogram<string>;
  private httpRequestsInProgress: promClient.Gauge<string>;
  private circuitBreakerState: promClient.Gauge<string>;
  private rateLimitHits: promClient.Counter<string>;
  private serviceHealthStatus: promClient.Gauge<string>;
  private uptime: promClient.Gauge<string>;

  constructor(private configService: ConfigService) {
    this.initializeMetrics();
    this.initializeLogging();
  }

  onModuleInit() {
    this.logger.log('Monitoring service initialized');
    
    // Start collecting default metrics
    promClient.collectDefaultMetrics({ 
      register: this.registry,
      prefix: 'treum_api_gateway_',
    });

    // Update uptime metric periodically
    setInterval(() => {
      this.uptime.set(process.uptime());
    }, 10000);
  }

  private initializeMetrics() {
    this.registry = new promClient.Registry();

    // HTTP request metrics
    this.httpRequestsTotal = new promClient.Counter({
      name: 'treum_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'service'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: 'treum_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code', 'service'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.registry],
    });

    this.httpRequestsInProgress = new promClient.Gauge({
      name: 'treum_http_requests_in_progress',
      help: 'Number of HTTP requests currently being processed',
      labelNames: ['method', 'route'],
      registers: [this.registry],
    });

    // Circuit breaker metrics
    this.circuitBreakerState = new promClient.Gauge({
      name: 'treum_circuit_breaker_state',
      help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
      labelNames: ['service', 'circuit_name'],
      registers: [this.registry],
    });

    // Rate limiting metrics
    this.rateLimitHits = new promClient.Counter({
      name: 'treum_rate_limit_hits_total',
      help: 'Total number of rate limit hits',
      labelNames: ['key_type', 'service'],
      registers: [this.registry],
    });

    // Service health metrics
    this.serviceHealthStatus = new promClient.Gauge({
      name: 'treum_service_health_status',
      help: 'Health status of services (1=healthy, 0=unhealthy)',
      labelNames: ['service'],
      registers: [this.registry],
    });

    // Uptime metric
    this.uptime = new promClient.Gauge({
      name: 'treum_uptime_seconds',
      help: 'Uptime of the service in seconds',
      registers: [this.registry],
    });
  }

  private initializeLogging() {
    const logDir = this.configService.get('logging.dir', './logs');
    const logLevel = this.configService.get('logging.level', 'info');

    this.winstonLogger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        // File transport for all logs
        new DailyRotateFile({
          filename: `${logDir}/api-gateway-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.configService.get('logging.maxSize', '20m'),
          maxFiles: this.configService.get('logging.maxFiles', '14d'),
        }),
        // Separate file for errors
        new DailyRotateFile({
          filename: `${logDir}/api-gateway-error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: this.configService.get('logging.maxSize', '20m'),
          maxFiles: this.configService.get('logging.maxFiles', '14d'),
        }),
      ],
    });
  }

  // Metrics recording methods
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number, service?: string) {
    const labels = { method, route, status_code: statusCode.toString(), service: service || 'unknown' };
    
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, duration / 1000); // Convert to seconds
  }

  recordRequestStart(method: string, route: string) {
    this.httpRequestsInProgress.inc({ method, route });
  }

  recordRequestEnd(method: string, route: string) {
    this.httpRequestsInProgress.dec({ method, route });
  }

  recordCircuitBreakerState(service: string, circuitName: string, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN') {
    const stateValue = state === 'CLOSED' ? 0 : state === 'OPEN' ? 1 : 2;
    this.circuitBreakerState.set({ service, circuit_name: circuitName }, stateValue);
  }

  recordRateLimitHit(keyType: string, service?: string) {
    this.rateLimitHits.inc({ key_type: keyType, service: service || 'unknown' });
  }

  recordServiceHealth(service: string, healthy: boolean) {
    this.serviceHealthStatus.set({ service }, healthy ? 1 : 0);
  }

  // Logging methods
  logRequest(requestId: string, method: string, url: string, ip: string, userAgent?: string, userId?: string) {
    this.winstonLogger.info('HTTP Request', {
      requestId,
      method,
      url,
      ip,
      userAgent,
      userId,
      type: 'request',
    });
  }

  logResponse(requestId: string, method: string, url: string, statusCode: number, duration: number, userId?: string) {
    this.winstonLogger.info('HTTP Response', {
      requestId,
      method,
      url,
      statusCode,
      duration,
      userId,
      type: 'response',
    });
  }

  logError(error: Error, context?: any) {
    this.winstonLogger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
      type: 'error',
    });
  }

  logServiceCall(service: string, method: string, endpoint: string, duration: number, success: boolean, requestId?: string) {
    this.winstonLogger.info('Service Call', {
      service,
      method,
      endpoint,
      duration,
      success,
      requestId,
      type: 'service_call',
    });
  }

  logSecurityEvent(type: string, details: any, ip?: string, userId?: string) {
    this.winstonLogger.warn('Security Event', {
      type,
      details,
      ip,
      userId,
      timestamp: new Date().toISOString(),
      category: 'security',
    });
  }

  logRateLimitExceeded(key: string, limit: number, ip?: string, userId?: string) {
    this.winstonLogger.warn('Rate Limit Exceeded', {
      key,
      limit,
      ip,
      userId,
      timestamp: new Date().toISOString(),
      category: 'rate_limit',
    });
  }

  // Metrics export
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Health check
  getHealthStatus(): { status: string; uptime: number; timestamp: string } {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // Get registry for custom metrics
  getRegistry(): promClient.Registry {
    return this.registry;
  }

  // Get Winston logger instance
  getLogger(): winston.Logger {
    return this.winstonLogger;
  }
}