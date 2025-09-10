import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    // Add request ID for tracing
    const requestId = req.headers['x-request-id'] || this.generateRequestId();
    req.headers['x-request-id'] = requestId as string;
    res.setHeader('X-Request-Id', requestId);

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Rate limiting headers (will be set by throttler)
    if (req.headers['x-ratelimit-limit']) {
      res.setHeader('X-RateLimit-Limit', req.headers['x-ratelimit-limit']);
    }
    if (req.headers['x-ratelimit-remaining']) {
      res.setHeader('X-RateLimit-Remaining', req.headers['x-ratelimit-remaining']);
    }

    // Log request
    this.logger.debug(
      `${req.method} ${req.originalUrl} - ${req.ip} - ${requestId}`,
    );

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}