import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Consul = require('consul');

export interface ServiceInstance {
  id: string;
  name: string;
  address: string;
  port: number;
  grpcPort?: number;
  tags: string[];
  healthy: boolean;
  lastHealthCheck: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class ServiceDiscoveryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ServiceDiscoveryService.name);
  private consul: any;
  private serviceInstances = new Map<string, ServiceInstance[]>();
  private healthCheckInterval: NodeJS.Timeout;
  private registrationRetryInterval: NodeJS.Timeout;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    const consulHost = this.configService.get<string>('consul.host');
    const consulPort = this.configService.get<number>('consul.port');
    
    this.consul = new Consul({
      host: consulHost,
      port: consulPort,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
    await this.registerSelf();
    this.startHealthChecking();
    this.startServiceDiscovery();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.registrationRetryInterval) {
      clearInterval(this.registrationRetryInterval);
    }
    await this.deregisterSelf();
  }

  private async connect(): Promise<void> {
    try {
      await this.consul.status.leader();
      this.isConnected = true;
      this.logger.log('Successfully connected to Consul');
    } catch (error) {
      this.logger.error('Failed to connect to Consul:', error.message);
      this.isConnected = false;
      // Retry connection
      setTimeout(() => this.connect(), 5000);
    }
  }

  private async registerSelf(): Promise<void> {
    if (!this.isConnected) return;

    const serviceName = this.configService.get<string>('serviceName');
    const port = this.configService.get<number>('port');
    const grpcPort = this.configService.get<number>('grpcPort');

    const registration = {
      id: `${serviceName}-${process.pid}`,
      name: serviceName,
      address: 'localhost', // In production, use actual IP
      port: port,
      tags: ['api-gateway', 'http', 'grpc', 'production'],
      meta: {
        version: '1.0.0',
        grpcPort: grpcPort.toString(),
      },
      check: {
        http: `http://localhost:${port}/health`,
        interval: '10s',
        timeout: '5s',
        deregisterCriticalServiceAfter: '1m',
      },
    };

    try {
      await this.consul.agent.service.register(registration);
      this.logger.log(`Service registered with Consul: ${registration.id}`);
    } catch (error) {
      this.logger.error('Failed to register service with Consul:', error.message);
      // Retry registration
      this.registrationRetryInterval = setTimeout(() => this.registerSelf(), 30000);
    }
  }

  private async deregisterSelf(): Promise<void> {
    if (!this.isConnected) return;

    const serviceName = this.configService.get<string>('serviceName');
    const serviceId = `${serviceName}-${process.pid}`;

    try {
      await this.consul.agent.service.deregister(serviceId);
      this.logger.log(`Service deregistered from Consul: ${serviceId}`);
    } catch (error) {
      this.logger.error('Failed to deregister service from Consul:', error.message);
    }
  }

  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.updateServiceHealth();
    }, 30000); // Check every 30 seconds
  }

  private startServiceDiscovery(): void {
    // Discover services immediately and then periodically
    this.discoverServices();
    setInterval(() => this.discoverServices(), 60000); // Discover every minute
  }

  private async updateServiceHealth(): Promise<void> {
    if (!this.isConnected) return;

    const services = this.configService.get('services');
    
    for (const [serviceName, serviceConfig] of Object.entries(services)) {
      const instances = this.serviceInstances.get(serviceName) || [];
      
      for (const instance of instances) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const healthEndpoint = (serviceConfig as any)?.healthEndpoint || '/health';
          const response = await fetch(
            `http://${instance.address}:${instance.port}${healthEndpoint}`,
            { method: 'GET', signal: controller.signal }
          );
          
          clearTimeout(timeoutId);
          
          instance.healthy = response.status === 200;
          instance.lastHealthCheck = new Date();
        } catch (error) {
          instance.healthy = false;
          instance.lastHealthCheck = new Date();
          this.logger.warn(`Health check failed for ${serviceName} instance ${instance.id}: ${error.message}`);
        }
      }
    }
  }

  private async discoverServices(): Promise<void> {
    if (!this.isConnected) return;

    try {
      const services = await this.consul.health.service({
        service: '', // Get all services
        passing: true,
      });

      const serviceMap = new Map<string, ServiceInstance[]>();

      for (const [serviceName, checks] of Object.entries(services)) {
        if (!checks || !Array.isArray(checks)) continue;

        const instances: ServiceInstance[] = checks.map((check: any) => ({
          id: check.Service.ID,
          name: check.Service.Service,
          address: check.Service.Address || check.Node.Address,
          port: check.Service.Port,
          grpcPort: check.Service.Meta?.grpcPort ? parseInt(check.Service.Meta.grpcPort) : undefined,
          tags: check.Service.Tags || [],
          healthy: check.Checks.every((c: any) => c.Status === 'passing'),
          lastHealthCheck: new Date(),
          metadata: check.Service.Meta || {},
        }));

        serviceMap.set(serviceName, instances);
      }

      this.serviceInstances = serviceMap;
      this.logger.debug('Service discovery updated');
    } catch (error) {
      this.logger.error('Service discovery failed:', error.message);
    }
  }

  getServiceInstances(serviceName: string): ServiceInstance[] {
    return this.serviceInstances.get(serviceName) || [];
  }

  getHealthyServiceInstances(serviceName: string): ServiceInstance[] {
    const instances = this.getServiceInstances(serviceName);
    return instances.filter(instance => instance.healthy);
  }

  getServiceInstance(serviceName: string): ServiceInstance | null {
    const healthyInstances = this.getHealthyServiceInstances(serviceName);
    if (healthyInstances.length === 0) return null;

    // Simple round-robin load balancing
    const randomIndex = Math.floor(Math.random() * healthyInstances.length);
    return healthyInstances[randomIndex];
  }

  getAllServices(): Map<string, ServiceInstance[]> {
    return new Map(this.serviceInstances);
  }

  isServiceHealthy(serviceName: string): boolean {
    const healthyInstances = this.getHealthyServiceInstances(serviceName);
    return healthyInstances.length > 0;
  }
}