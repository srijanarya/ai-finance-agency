// Export all generated gRPC clients and types
// This will be populated after running proto:generate scripts

// Re-export all proto generated files (these will exist after build)
// export * from './generated/user_pb';
// export * from './generated/user_grpc_pb';
// export * from './generated/trading_pb';
// export * from './generated/trading_grpc_pb';
// export * from './generated/signals_pb';
// export * from './generated/signals_grpc_pb';
// export * from './generated/payment_pb';
// export * from './generated/payment_grpc_pb';
// export * from './generated/education_pb';
// export * from './generated/education_grpc_pb';
// export * from './generated/common_pb';
// export * from './generated/common_grpc_pb';

// gRPC Client Factory
import * as grpc from '@grpc/grpc-js';

export interface GrpcClientConfig {
  host: string;
  port: number;
  credentials?: grpc.ChannelCredentials;
  options?: grpc.ChannelOptions;
}

export class GrpcClientFactory {
  private static defaultCredentials = grpc.credentials.createInsecure();
  private static defaultOptions: grpc.ChannelOptions = {
    'grpc.keepalive_time_ms': 30000,
    'grpc.keepalive_timeout_ms': 5000,
    'grpc.keepalive_permit_without_calls': 1,
    'grpc.http2.max_pings_without_data': 0,
    'grpc.http2.min_time_between_pings_ms': 10000,
    'grpc.http2.min_ping_interval_without_data_ms': 300000,
  };

  static createClient<T>(
    clientConstructor: new (address: string, credentials: grpc.ChannelCredentials, options?: grpc.ChannelOptions) => T,
    config: GrpcClientConfig
  ): T {
    const address = `${config.host}:${config.port}`;
    const credentials = config.credentials || this.defaultCredentials;
    const options = { ...this.defaultOptions, ...config.options };
    
    return new clientConstructor(address, credentials, options);
  }
}

// Service Registry for dynamic service discovery
export interface ServiceEndpoint {
  name: string;
  host: string;
  port: number;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked: Date;
  version?: string;
  metadata?: Record<string, any>;
}

export class ServiceRegistry {
  private services = new Map<string, ServiceEndpoint>();

  register(service: ServiceEndpoint): void {
    this.services.set(service.name, service);
  }

  unregister(serviceName: string): boolean {
    return this.services.delete(serviceName);
  }

  get(serviceName: string): ServiceEndpoint | undefined {
    return this.services.get(serviceName);
  }

  getHealthy(serviceName: string): ServiceEndpoint | undefined {
    const service = this.services.get(serviceName);
    return service?.health === 'healthy' ? service : undefined;
  }

  list(): ServiceEndpoint[] {
    return Array.from(this.services.values());
  }

  listHealthy(): ServiceEndpoint[] {
    return Array.from(this.services.values()).filter(s => s.health === 'healthy');
  }

  updateHealth(serviceName: string, health: 'healthy' | 'unhealthy' | 'unknown'): boolean {
    const service = this.services.get(serviceName);
    if (service) {
      service.health = health;
      service.lastChecked = new Date();
      return true;
    }
    return false;
  }
}

// Singleton instance
export const serviceRegistry = new ServiceRegistry();

// Circuit Breaker Implementation
export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  expectedErrors: string[];
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
}

export class CircuitBreaker {
  private state: CircuitBreakerState;
  private options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions) {
    this.options = options;
    this.state = {
      state: 'CLOSED',
      failureCount: 0
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onError(error as Error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failureCount = 0;
    this.state.state = 'CLOSED';
    this.state.lastFailureTime = undefined;
    this.state.nextAttemptTime = undefined;
  }

  private onError(error: Error): void {
    if (this.isExpectedError(error)) {
      return;
    }

    this.state.failureCount++;
    this.state.lastFailureTime = new Date();

    if (this.state.failureCount >= this.options.failureThreshold) {
      this.state.state = 'OPEN';
      this.state.nextAttemptTime = new Date(Date.now() + this.options.recoveryTimeout);
    }
  }

  private isExpectedError(error: Error): boolean {
    return this.options.expectedErrors.some(expectedError => 
      error.message.includes(expectedError) || error.name === expectedError
    );
  }

  private shouldAttemptReset(): boolean {
    return this.state.nextAttemptTime ? new Date() >= this.state.nextAttemptTime : false;
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

// Retry Logic Implementation
export interface RetryOptions {
  retries: number;
  factor: number;
  minTimeout: number;
  maxTimeout: number;
  randomize: boolean;
}

export class RetryHandler {
  static async retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= options.retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === options.retries) {
          break;
        }

        const timeout = this.calculateTimeout(attempt, options);
        await this.delay(timeout);
      }
    }

    throw lastError!;
  }

  private static calculateTimeout(attempt: number, options: RetryOptions): number {
    let timeout = options.minTimeout * Math.pow(options.factor, attempt);
    
    if (options.randomize) {
      timeout *= Math.random() + 0.5;
    }

    return Math.min(timeout, options.maxTimeout);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// gRPC Service Client with Circuit Breaker and Retry
export abstract class ResilientGrpcClient<T> {
  protected client: T;
  protected circuitBreaker: CircuitBreaker;
  protected retryOptions: RetryOptions;

  constructor(
    clientConstructor: new (address: string, credentials: grpc.ChannelCredentials, options?: grpc.ChannelOptions) => T,
    config: GrpcClientConfig,
    circuitBreakerOptions?: Partial<CircuitBreakerOptions>,
    retryOptions?: Partial<RetryOptions>
  ) {
    this.client = GrpcClientFactory.createClient(clientConstructor, config);
    
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 10000,
      monitoringPeriod: 30000,
      expectedErrors: ['CANCELLED', 'DEADLINE_EXCEEDED'],
      ...circuitBreakerOptions
    });

    this.retryOptions = {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000,
      randomize: true,
      ...retryOptions
    };
  }

  protected async executeWithResilience<TResult>(
    operation: () => Promise<TResult>
  ): Promise<TResult> {
    return this.circuitBreaker.execute(() =>
      RetryHandler.retry(operation, this.retryOptions)
    );
  }

  getCircuitBreakerState(): CircuitBreakerState {
    return this.circuitBreaker.getState();
  }
}

// Version information
export const GRPC_CONTRACTS_VERSION = '1.0.0';