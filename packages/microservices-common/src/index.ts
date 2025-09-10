// Export decorators
export * from './decorators/correlation-id.decorator';
export * from './decorators/circuit-breaker.decorator';

// Export interceptors
export * from './interceptors/tracing.interceptor';

// Export health module and related services
export * from './modules/health.module';
export * from './modules/health.controller';
export * from './modules/health.service';
export * from './modules/indicators/database.health';
export * from './modules/indicators/redis.health';
export * from './modules/indicators/rabbitmq.health';
export * from './modules/indicators/external-service.health';

// Export event bus module and services
export * from './modules/event-bus.module';
export * from './modules/event-bus.service';
export * from './modules/event-publisher.service';
export * from './modules/event-subscriber.service';

// Version information
export const MICROSERVICES_COMMON_VERSION = '1.0.0';