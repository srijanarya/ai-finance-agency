import {
  Controller,
  All,
  Req,
  Res,
  Next,
  UseGuards,
  UseInterceptors,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { RateLimitingService } from '../rate-limiting/rate-limiting.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { Public, CurrentUser, RequirePermissions, Roles } from '../auth/decorators/auth.decorators';
import { User, UserRole, Permission } from '../auth/interfaces/user.interface';
import { ConfigService } from '@nestjs/config';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, ApiKeyGuard)
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);
  private readonly serviceRoutes: Map<string, string>;

  constructor(
    private proxyService: ProxyService,
    private rateLimitingService: RateLimitingService,
    private monitoringService: MonitoringService,
    private configService: ConfigService,
  ) {
    // Initialize service route mappings
    this.serviceRoutes = new Map([
      ['/auth', 'user-management'],
      ['/users', 'user-management'],
      ['/trading', 'trading'],
      ['/signals', 'signals'],
      ['/payments', 'payment'],
      ['/education', 'education'],
    ]);
  }

  // User Management Service Routes
  @All('auth/*')
  @Public()
  async handleAuthRoutes(@Req() req: Request, @Res() res: Response) {
    await this.handleServiceRoute(req, res, 'user-management');
  }

  @All('users/*')
  @RequirePermissions(Permission.READ_PROFILE)
  async handleUserRoutes(
    @Req() req: Request, 
    @Res() res: Response,
    @CurrentUser() user: User
  ) {
    // Add user context to headers for downstream services
    req.headers['x-user-id'] = user.id;
    req.headers['x-user-role'] = user.role;
    req.headers['x-user-permissions'] = JSON.stringify(user.permissions);
    
    await this.handleServiceRoute(req, res, 'user-management');
  }

  // Trading Service Routes
  @All('trading/*')
  @RequirePermissions(Permission.READ_TRADING)
  async handleTradingRoutes(
    @Req() req: Request, 
    @Res() res: Response,
    @CurrentUser() user: User
  ) {
    // Check for execute permissions on trade execution endpoints
    if (req.path.includes('/execute') || req.path.includes('/orders')) {
      if (!user.permissions.includes(Permission.EXECUTE_TRADES)) {
        throw new ForbiddenException('Insufficient permissions to execute trades');
      }
    }

    // Add user context
    req.headers['x-user-id'] = user.id;
    req.headers['x-user-role'] = user.role;
    req.headers['x-subscription-tier'] = user.subscriptionTier || 'basic';
    
    await this.handleServiceRoute(req, res, 'trading');
  }

  // Signals Service Routes
  @All('signals/*')
  @RequirePermissions(Permission.READ_SIGNALS)
  async handleSignalsRoutes(
    @Req() req: Request, 
    @Res() res: Response,
    @CurrentUser() user: User
  ) {
    // Check subscription tier for premium/VIP signals
    if (req.path.includes('/premium') && !user.permissions.includes(Permission.READ_PREMIUM_SIGNALS)) {
      throw new ForbiddenException('Premium subscription required for premium signals');
    }
    
    if (req.path.includes('/vip') && !user.permissions.includes(Permission.READ_VIP_SIGNALS)) {
      throw new ForbiddenException('VIP subscription required for VIP signals');
    }

    // Add user context
    req.headers['x-user-id'] = user.id;
    req.headers['x-subscription-tier'] = user.subscriptionTier || 'basic';
    
    await this.handleServiceRoute(req, res, 'signals');
  }

  // Payment Service Routes
  @All('payments/*')
  @RequirePermissions(Permission.MAKE_PAYMENTS)
  async handlePaymentRoutes(
    @Req() req: Request, 
    @Res() res: Response,
    @CurrentUser() user: User
  ) {
    // Add user context
    req.headers['x-user-id'] = user.id;
    req.headers['x-user-email'] = user.email;
    
    await this.handleServiceRoute(req, res, 'payment');
  }

  // Education Service Routes
  @All('education/*')
  @RequirePermissions(Permission.READ_EDUCATION)
  async handleEducationRoutes(
    @Req() req: Request, 
    @Res() res: Response,
    @CurrentUser() user: User
  ) {
    // Check subscription tier for premium education content
    if (req.path.includes('/premium') && !user.permissions.includes(Permission.READ_PREMIUM_EDUCATION)) {
      throw new ForbiddenException('Premium subscription required for premium education content');
    }

    // Add user context
    req.headers['x-user-id'] = user.id;
    req.headers['x-subscription-tier'] = user.subscriptionTier || 'basic';
    
    await this.handleServiceRoute(req, res, 'education');
  }

  // Admin Routes (Super Admin Only)
  @All('admin/*')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @RequirePermissions(Permission.SYSTEM_ADMIN)
  async handleAdminRoutes(
    @Req() req: Request, 
    @Res() res: Response,
    @CurrentUser() user: User
  ) {
    // Route admin requests to appropriate services based on path
    const adminPath = req.path.replace('/admin', '');
    let targetService = 'user-management'; // Default

    if (adminPath.startsWith('/trading')) {
      targetService = 'trading';
    } else if (adminPath.startsWith('/signals')) {
      targetService = 'signals';
    } else if (adminPath.startsWith('/payments')) {
      targetService = 'payment';
    } else if (adminPath.startsWith('/education')) {
      targetService = 'education';
    }

    // Add admin context
    req.headers['x-user-id'] = user.id;
    req.headers['x-user-role'] = user.role;
    req.headers['x-admin-access'] = 'true';
    
    await this.handleServiceRoute(req, res, targetService, adminPath);
  }

  private async handleServiceRoute(
    req: Request,
    res: Response,
    serviceName: string,
    customPath?: string
  ): Promise<void> {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string;
    const userId = req.headers['x-user-id'] as string;

    try {
      // Record request start
      this.monitoringService.recordRequestStart(req.method, req.route?.path || req.path);

      // Log incoming request
      this.monitoringService.logRequest(
        requestId,
        req.method,
        req.originalUrl,
        req.ip,
        req.get('User-Agent'),
        userId
      );

      // Apply rate limiting
      await this.applyRateLimit(req, res, serviceName, userId);

      // Proxy the request
      await this.proxyService.proxyRequest(req, res, serviceName, customPath);

      // Record request completion
      const duration = Date.now() - startTime;
      this.monitoringService.recordRequestEnd(req.method, req.route?.path || req.path);
      this.monitoringService.logResponse(requestId, req.method, req.originalUrl, res.statusCode, duration, userId);

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record request completion even for errors
      this.monitoringService.recordRequestEnd(req.method, req.route?.path || req.path);
      this.monitoringService.logResponse(requestId, req.method, req.originalUrl, 500, duration, userId);
      
      throw error;
    }
  }

  private async applyRateLimit(req: Request, res: Response, serviceName: string, userId?: string): Promise<void> {
    // Global rate limiting
    const globalResult = await this.rateLimitingService.checkGlobalRateLimit(req, res);
    if (!globalResult.allowed) {
      this.monitoringService.recordRateLimitHit('global');
      this.monitoringService.logRateLimitExceeded('global', globalResult.info.limit, req.ip, userId);
      throw new BadRequestException('Global rate limit exceeded. Please try again later.');
    }

    // Service-specific rate limiting
    const serviceResult = await this.rateLimitingService.checkServiceRateLimit(req, res, serviceName);
    if (!serviceResult.allowed) {
      this.monitoringService.recordRateLimitHit('service', serviceName);
      this.monitoringService.logRateLimitExceeded(`service:${serviceName}`, serviceResult.info.limit, req.ip, userId);
      throw new BadRequestException(`Rate limit exceeded for ${serviceName} service. Please try again later.`);
    }

    // User-specific rate limiting
    if (userId) {
      const userResult = await this.rateLimitingService.checkUserRateLimit(req, res, userId);
      if (!userResult.allowed) {
        this.monitoringService.recordRateLimitHit('user');
        this.monitoringService.logRateLimitExceeded(`user:${userId}`, userResult.info.limit, req.ip, userId);
        throw new BadRequestException('User rate limit exceeded. Please try again later.');
      }
    }
  }
}