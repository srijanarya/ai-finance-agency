import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, TerminusModule } from '@nestjs/terminus';
import { ProxyService } from '../proxy/proxy.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';
import { ServiceDiscoveryService } from '../service-discovery/service-discovery.service';
import { RateLimitingService } from '../rate-limiting/rate-limiting.service';
import { WebSocketGatewayService } from '../websocket/websocket-gateway.service';
import { Public, Roles, RequireApiKey } from '../auth/decorators/auth.decorators';
import { UserRole } from '../auth/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Health & Monitoring')
@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private proxyService: ProxyService,
    private monitoringService: MonitoringService,
    private circuitBreakerService: CircuitBreakerService,
    private serviceDiscovery: ServiceDiscoveryService,
    private rateLimitingService: RateLimitingService,
    private webSocketGateway: WebSocketGatewayService,
  ) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth() {
    return this.monitoringService.getHealthStatus();
  }

  @Get('health/detailed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detailed health check with all services' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  async getDetailedHealth() {
    const baseHealth = this.monitoringService.getHealthStatus();
    
    // Get service discovery status
    const services = this.serviceDiscovery.getAllServices();
    const serviceHealth: any = {};
    
    services.forEach((instances, serviceName) => {
      const healthyInstances = instances.filter(instance => instance.healthy);
      serviceHealth[serviceName] = {
        totalInstances: instances.length,
        healthyInstances: healthyInstances.length,
        unhealthyInstances: instances.length - healthyInstances.length,
        instances: instances.map(instance => ({
          id: instance.id,
          address: `${instance.address}:${instance.port}`,
          healthy: instance.healthy,
          lastHealthCheck: instance.lastHealthCheck,
        })),
      };
    });

    // Get circuit breaker status
    const circuitBreakerHealth = await this.circuitBreakerService.healthCheck();
    
    // Get WebSocket connection stats
    const webSocketStats = this.webSocketGateway.getConnectionStats();

    // Get proxy service health
    const proxyHealth = await this.proxyService.healthCheck();

    return {
      ...baseHealth,
      services: serviceHealth,
      circuitBreakers: circuitBreakerHealth,
      webSocket: webSocketStats,
      proxy: proxyHealth,
    };
  }

  @Get('metrics')
  @RequireApiKey()
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics', type: String })
  async getMetrics() {
    return this.monitoringService.getMetrics();
  }

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comprehensive system status' })
  @ApiResponse({ status: 200, description: 'System status information' })
  async getSystemStatus() {
    // Service discovery status
    const allServices = this.serviceDiscovery.getAllServices();
    const serviceStatus: any = {};
    
    allServices.forEach((instances, serviceName) => {
      serviceStatus[serviceName] = {
        healthy: instances.some(instance => instance.healthy),
        instanceCount: instances.length,
        healthyCount: instances.filter(instance => instance.healthy).length,
      };
    });

    // Circuit breaker status
    const circuitBreakerStats = await this.circuitBreakerService.healthCheck();
    const circuitBreakerStatus: any = {};
    
    circuitBreakerStats.breakers.forEach(breaker => {
      circuitBreakerStatus[breaker.name] = {
        state: breaker.state,
        stats: breaker.stats,
      };
    });

    // Rate limiting status
    const rateLimitStatus = await this.rateLimitingService.getActiveRateLimits();

    // WebSocket status
    const webSocketStatus = this.webSocketGateway.getConnectionStats();

    // System resources
    const systemResources = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
    };

    return {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: serviceStatus,
      circuitBreakers: circuitBreakerStatus,
      rateLimits: rateLimitStatus,
      webSocket: webSocketStatus,
      system: systemResources,
    };
  }

  @Get('health/liveness')
  @Public()
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  getLiveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('health/readiness')
  @Public()
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
  async getReadiness() {
    // Check critical services are available
    const criticalServices = ['user-management', 'trading', 'signals'];
    const unavailableServices = [];

    for (const serviceName of criticalServices) {
      if (!this.serviceDiscovery.isServiceHealthy(serviceName)) {
        unavailableServices.push(serviceName);
      }
    }

    if (unavailableServices.length > 0) {
      return {
        status: 'not_ready',
        reason: `Critical services unavailable: ${unavailableServices.join(', ')}`,
        timestamp: new Date().toISOString(),
      };
    }

    return { 
      status: 'ready', 
      timestamp: new Date().toISOString() 
    };
  }

  @Get('version')
  @Public()
  @ApiOperation({ summary: 'Get service version information' })
  @ApiResponse({ status: 200, description: 'Version information' })
  getVersion() {
    return {
      service: 'api-gateway',
      version: '1.0.0',
      buildDate: process.env.BUILD_DATE || 'unknown',
      commit: process.env.GIT_COMMIT || 'unknown',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }
}