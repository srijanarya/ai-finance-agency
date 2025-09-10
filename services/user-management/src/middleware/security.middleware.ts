import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { DeviceTrackingService } from '../services/device-tracking.service';
import { AuditService } from '../services/audit.service';
import { AuditAction } from '../entities/audit-log.entity';
import { rateLimit } from 'express-rate-limit';
import slowDown from 'express-slow-down';

interface SecurityRequest extends Request {
  deviceFingerprint?: any;
  riskScore?: number;
  isBlocked?: boolean;
  securityFlags?: string[];
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly rateLimiters = new Map<string, any>();

  constructor(
    private configService: ConfigService,
    private deviceTracking: DeviceTrackingService,
    private auditService: AuditService,
  ) {
    this.initializeRateLimiters();
  }

  private initializeRateLimiters() {
    // Authentication endpoints - stricter limits
    this.rateLimiters.set('auth', rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: {
        error: 'Too many authentication attempts',
        retryAfter: '15 minutes',
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        return `auth_${req.ip}_${req.get('User-Agent')}`;
      },
      handler: (req: SecurityRequest, res: Response) => {
        this.handleRateLimitExceeded(req, res, 'authentication');
      },
    }));

    // Password reset - very strict
    this.rateLimiters.set('password-reset', rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts per hour
      message: {
        error: 'Too many password reset attempts',
        retryAfter: '1 hour',
      },
      keyGenerator: (req: Request) => {
        const email = req.body?.email || 'unknown';
        return `pwd_reset_${req.ip}_${email}`;
      },
      handler: (req: SecurityRequest, res: Response) => {
        this.handleRateLimitExceeded(req, res, 'password-reset');
      },
    }));

    // MFA attempts
    this.rateLimiters.set('mfa', rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 10, // 10 attempts per window
      message: {
        error: 'Too many MFA attempts',
        retryAfter: '10 minutes',
      },
      keyGenerator: (req: Request) => {
        return `mfa_${req.ip}_${req.get('User-Agent')}`;
      },
      handler: (req: SecurityRequest, res: Response) => {
        this.handleRateLimitExceeded(req, res, 'mfa');
      },
    }));

    // General API endpoints
    this.rateLimiters.set('api', rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: {
        error: 'Too many API requests',
        retryAfter: '15 minutes',
      },
      keyGenerator: (req: Request) => {
        return `api_${req.ip}`;
      },
    }));

    // Slow down middleware for authentication
    this.rateLimiters.set('slowdown', slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 2, // allow 2 requests per window at full speed
      delayMs: 500, // slow down by 500ms per request after delayAfter
      maxDelayMs: 20000, // maximum delay of 20 seconds
      keyGenerator: (req: Request) => {
        return `slowdown_${req.ip}_${req.get('User-Agent')}`;
      },
    }));
  }

  async use(req: SecurityRequest, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    try {
      // Skip security checks for health checks
      if (req.path.includes('/health') || req.path.includes('/metrics')) {
        return next();
      }

      // Apply appropriate rate limiting based on endpoint
      await this.applyRateLimit(req, res);
      
      if (res.headersSent) {
        return; // Rate limit was exceeded
      }

      // Generate device fingerprint
      const fingerprint = await this.deviceTracking.analyzeDeviceFingerprint(
        req.get('User-Agent') || 'Unknown',
        req.ip || 'Unknown',
        {
          timezone: req.get('X-Timezone'),
          language: req.get('Accept-Language'),
          screenResolution: req.get('X-Screen-Resolution'),
        },
      );

      req.deviceFingerprint = fingerprint;
      req.riskScore = fingerprint.riskScore;
      req.securityFlags = [];

      // Check for high-risk requests
      if (fingerprint.riskScore >= 80) {
        req.securityFlags.push('HIGH_RISK');
        await this.handleHighRiskRequest(req, res);
        if (res.headersSent) return;
      }

      // Check for suspicious patterns
      await this.detectSuspiciousPatterns(req);

      // Add security headers
      this.addSecurityHeaders(res);

      // Log the request
      this.logSecurityEvent(req, fingerprint);

      next();
    } catch (error) {
      this.logger.error(`Security middleware error: ${error.message}`, error.stack);
      next(); // Continue processing even if security check fails
    } finally {
      const processingTime = Date.now() - startTime;
      if (processingTime > 1000) {
        this.logger.warn(`Slow security processing: ${processingTime}ms for ${req.path}`);
      }
    }
  }

  private async applyRateLimit(req: SecurityRequest, res: Response): Promise<void> {
    return new Promise((resolve) => {
      let limiterType = 'api';
      
      if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
        limiterType = 'auth';
      } else if (req.path.includes('/auth/forgot-password') || req.path.includes('/auth/reset-password')) {
        limiterType = 'password-reset';
      } else if (req.path.includes('/auth/mfa')) {
        limiterType = 'mfa';
      }

      const limiter = this.rateLimiters.get(limiterType);
      if (limiter) {
        limiter(req, res, resolve);
      } else {
        resolve();
      }
    });
  }

  private async handleRateLimitExceeded(
    req: SecurityRequest,
    res: Response,
    type: string,
  ): Promise<void> {
    const ipAddress = req.ip || 'Unknown';
    const userAgent = req.get('User-Agent') || 'Unknown';

    await this.auditService.log({
      action: AuditAction.API_RATE_LIMITED,
      resource: 'security',
      level: 'medium',
      description: `Rate limit exceeded for ${type}`,
      details: {
        endpoint: req.path,
        method: req.method,
        type,
        userAgent,
      },
      ipAddress,
    });

    res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded for ${type}`,
      retryAfter: this.getRateLimitWindow(type),
    });
  }

  private getRateLimitWindow(type: string): string {
    const windows = {
      'auth': '15 minutes',
      'password-reset': '1 hour',
      'mfa': '10 minutes',
      'api': '15 minutes',
    };
    return windows[type] || '15 minutes';
  }

  private async handleHighRiskRequest(
    req: SecurityRequest,
    res: Response,
  ): Promise<void> {
    const fingerprint = req.deviceFingerprint;
    
    // Block extremely high-risk requests (score >= 90)
    if (fingerprint.riskScore >= 90) {
      req.isBlocked = true;
      
      await this.auditService.log({
        action: AuditAction.SECURITY_ALERT,
        resource: 'security',
        level: 'critical',
        description: `High-risk request blocked (score: ${fingerprint.riskScore})`,
        details: {
          riskScore: fingerprint.riskScore,
          fingerprint,
          endpoint: req.path,
        },
        ipAddress: req.ip,
      });

      res.status(403).json({
        error: 'Access denied',
        message: 'Request blocked due to security concerns',
        requestId: this.generateRequestId(),
      });
      return;
    }

    // Add additional verification for high-risk requests
    if (fingerprint.riskScore >= 80) {
      req.securityFlags.push('REQUIRES_ADDITIONAL_VERIFICATION');
      
      // For authentication endpoints, we might require additional verification
      if (req.path.includes('/auth/')) {
        res.setHeader('X-Security-Challenge', 'required');
      }
    }
  }

  private async detectSuspiciousPatterns(req: SecurityRequest): Promise<void> {
    const userAgent = req.get('User-Agent') || '';
    const referer = req.get('Referer') || '';
    
    // Check for bot-like behavior
    const botIndicators = ['bot', 'crawler', 'spider', 'scraper', 'headless'];
    if (botIndicators.some(indicator => userAgent.toLowerCase().includes(indicator))) {
      req.securityFlags.push('BOT_LIKE_BEHAVIOR');
    }

    // Check for missing common headers
    if (!req.get('Accept') || !req.get('Accept-Language')) {
      req.securityFlags.push('MISSING_HEADERS');
    }

    // Check for suspicious referers
    const suspiciousReferers = ['bit.ly', 't.co', 'tinyurl.com'];
    if (suspiciousReferers.some(domain => referer.includes(domain))) {
      req.securityFlags.push('SUSPICIOUS_REFERER');
    }

    // Check for unusual request patterns
    if (req.method === 'POST' && !req.get('Content-Type')) {
      req.securityFlags.push('UNUSUAL_REQUEST_PATTERN');
    }
  }

  private addSecurityHeaders(res: Response): void {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // HSTS header for HTTPS
    if (this.configService.get('NODE_ENV') === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  }

  private async logSecurityEvent(req: SecurityRequest, fingerprint: any): Promise<void> {
    // Only log high-risk or flagged requests to avoid spam
    if (fingerprint.riskScore >= 50 || req.securityFlags.length > 0) {
      await this.auditService.log({
        action: AuditAction.API_REQUEST,
        resource: 'security',
        level: fingerprint.riskScore >= 70 ? 'high' : 'medium',
        description: 'Security-flagged request processed',
        details: {
          riskScore: fingerprint.riskScore,
          flags: req.securityFlags,
          endpoint: req.path,
          method: req.method,
          fingerprint: {
            browser: fingerprint.browserInfo?.name,
            os: fingerprint.osInfo?.name,
            location: fingerprint.location,
          },
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}