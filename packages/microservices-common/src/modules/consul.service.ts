import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Consul from 'consul';

export interface ServiceRegistration {
  id: string;
  name: string;
  address: string;
  port: number;
  tags?: string[];
  meta?: Record<string, string>;
  check?: {
    http?: string;
    interval?: string;
    timeout?: string;
    deregisterCriticalServiceAfter?: string;
  };
}

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsulService.name);
  private consul: any;
  private serviceId: string;
  private serviceName: string;

  constructor(private readonly configService: ConfigService) {
    this.setupConsulClient();
    this.serviceName = this.configService.get('SERVICE_NAME', 'unknown');
    this.serviceId = `${this.serviceName}-${process.env.HOSTNAME || 'local'}-${Date.now()}`;
  }

  async onModuleInit() {
    await this.registerService();
  }

  async onModuleDestroy() {
    await this.deregisterService();
  }

  private setupConsulClient() {
    const consulHost = this.configService.get('CONSUL_HOST', 'localhost');
    const consulPort = this.configService.get('CONSUL_PORT', 8500);

    this.consul = new Consul({
      host: consulHost,
      port: consulPort,
    });

    this.logger.log(`Consul client configured for ${consulHost}:${consulPort}`);
  }

  async registerService(): Promise<void> {
    const servicePort = this.configService.get('PORT', 3000);
    const grpcPort = this.configService.get('GRPC_PORT');
    const serviceAddress = this.configService.get('SERVICE_ADDRESS', 'localhost');

    const registration: ServiceRegistration = {
      id: this.serviceId,
      name: this.serviceName,
      address: serviceAddress,
      port: servicePort,
      tags: [
        'treum-finance',
        `version-${this.configService.get('SERVICE_VERSION', '1.0.0')}`,
        `env-${this.configService.get('NODE_ENV', 'development')}`,
      ],
      meta: {
        version: this.configService.get('SERVICE_VERSION', '1.0.0'),
        environment: this.configService.get('NODE_ENV', 'development'),
        grpcPort: grpcPort?.toString() || '',
      },
      check: {
        http: `http://${serviceAddress}:${servicePort}/health`,
        interval: '30s',
        timeout: '10s',
        deregisterCriticalServiceAfter: '5m',
      },
    };

    try {
      await this.consul.agent.service.register(registration);
      this.logger.log(`Service registered with Consul: ${this.serviceId}`, {
        serviceName: this.serviceName,
        serviceId: this.serviceId,
        address: serviceAddress,
        port: servicePort,
      });
    } catch (error) {
      this.logger.error(`Failed to register service with Consul`, {
        error: error.message,
        serviceId: this.serviceId,
      });
      throw error;
    }
  }

  async deregisterService(): Promise<void> {
    try {
      await this.consul.agent.service.deregister(this.serviceId);
      this.logger.log(`Service deregistered from Consul: ${this.serviceId}`);
    } catch (error) {
      this.logger.error(`Failed to deregister service from Consul`, {
        error: error.message,
        serviceId: this.serviceId,
      });
    }
  }

  async discoverService(serviceName: string): Promise<ServiceRegistration[]> {
    try {
      const services = await this.consul.health.service({
        service: serviceName,
        passing: true, // Only return healthy services
      });

      return services.map(service => ({
        id: service.Service.ID,
        name: service.Service.Service,
        address: service.Service.Address,
        port: service.Service.Port,
        tags: service.Service.Tags,
        meta: service.Service.Meta,
      }));
    } catch (error) {
      this.logger.error(`Failed to discover service ${serviceName}`, {
        error: error.message,
      });
      return [];
    }
  }

  async discoverServiceEndpoint(serviceName: string): Promise<ServiceRegistration | null> {
    const services = await this.discoverService(serviceName);
    
    if (services.length === 0) {
      this.logger.warn(`No healthy instances found for service ${serviceName}`);
      return null;
    }

    // Simple load balancing: return a random service instance
    const randomIndex = Math.floor(Math.random() * services.length);
    const selectedService = services[randomIndex];

    this.logger.debug(`Selected service instance for ${serviceName}`, {
      serviceId: selectedService.id,
      address: selectedService.address,
      port: selectedService.port,
    });

    return selectedService;
  }

  async getAllServices(): Promise<Record<string, string[]>> {
    try {
      const catalog = await this.consul.catalog.service.list();
      return catalog;
    } catch (error) {
      this.logger.error(`Failed to get all services from Consul`, {
        error: error.message,
      });
      return {};
    }
  }

  async getServiceHealth(serviceName: string): Promise<Array<{
    service: string;
    status: string;
    output: string;
  }>> {
    try {
      const health = await this.consul.health.service({
        service: serviceName,
      });

      return health.map(instance => ({
        service: instance.Service.ID,
        status: this.getWorstHealthStatus(instance.Checks),
        output: instance.Checks
          .map(check => `${check.Name}: ${check.Status} - ${check.Output}`)
          .join('; '),
      }));
    } catch (error) {
      this.logger.error(`Failed to get health status for service ${serviceName}`, {
        error: error.message,
      });
      return [];
    }
  }

  private getWorstHealthStatus(checks: any[]): string {
    if (checks.some(check => check.Status === 'critical')) return 'critical';
    if (checks.some(check => check.Status === 'warning')) return 'warning';
    if (checks.every(check => check.Status === 'passing')) return 'passing';
    return 'unknown';
  }

  async watchService(serviceName: string, callback: (services: ServiceRegistration[]) => void): Promise<void> {
    const watch = this.consul.watch({
      method: this.consul.health.service,
      options: {
        service: serviceName,
        passing: true,
      },
    });

    watch.on('change', (data: any[]) => {
      const services = data.map(service => ({
        id: service.Service.ID,
        name: service.Service.Service,
        address: service.Service.Address,
        port: service.Service.Port,
        tags: service.Service.Tags,
        meta: service.Service.Meta,
      }));

      callback(services);
    });

    watch.on('error', (error: Error) => {
      this.logger.error(`Error watching service ${serviceName}`, {
        error: error.message,
      });
    });

    this.logger.log(`Started watching service ${serviceName}`);
  }

  // Key-Value store operations
  async setKey(key: string, value: string): Promise<void> {
    try {
      await this.consul.kv.set(key, value);
      this.logger.debug(`Set key in Consul KV: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set key in Consul KV: ${key}`, {
        error: error.message,
      });
      throw error;
    }
  }

  async getKey(key: string): Promise<string | null> {
    try {
      const result = await this.consul.kv.get(key);
      return result?.Value || null;
    } catch (error) {
      this.logger.error(`Failed to get key from Consul KV: ${key}`, {
        error: error.message,
      });
      return null;
    }
  }

  async deleteKey(key: string): Promise<void> {
    try {
      await this.consul.kv.del(key);
      this.logger.debug(`Deleted key from Consul KV: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete key from Consul KV: ${key}`, {
        error: error.message,
      });
      throw error;
    }
  }
}