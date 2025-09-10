import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from '../../monitoring/monitoring.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  constructor(private monitoringService: MonitoringService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string;
    const userId = req.headers['x-user-id'] as string;

    // Log incoming request
    this.monitoringService.logRequest(
      requestId,
      req.method,
      req.originalUrl,
      req.ip,
      req.get('User-Agent'),
      userId
    );

    // Record request start metrics
    this.monitoringService.recordRequestStart(req.method, req.route?.path || req.path);

    // Hook into response finish event
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Log response
      this.monitoringService.logResponse(
        requestId,
        req.method,
        req.originalUrl,
        res.statusCode,
        duration,
        userId
      );

      // Record metrics
      this.monitoringService.recordHttpRequest(
        req.method,
        req.route?.path || req.path,
        res.statusCode,
        duration
      );

      this.monitoringService.recordRequestEnd(req.method, req.route?.path || req.path);

      // Log slow requests (over 5 seconds)
      if (duration > 5000) {
        this.logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms`, {
          requestId,
          duration,
          userId,
          statusCode: res.statusCode,
        });
      }
    });

    next();
  }
}