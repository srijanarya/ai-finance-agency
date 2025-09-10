import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

// Configuration
import configuration from './config/configuration';

// Modules
import { AuthModule } from './auth/auth.module';
import { ServiceDiscoveryModule } from './service-discovery/service-discovery.module';
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';
import { RateLimitingModule } from './rate-limiting/rate-limiting.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { WebSocketModule } from './websocket/websocket.module';
import { ProxyModule } from './proxy/proxy.module';

// Controllers
import { GatewayController } from './gateway/gateway.controller';
import { HealthController } from './health/health.controller';

// Guards and Filters
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ApiKeyGuard } from './auth/guards/api-key.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

// Middleware
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { RequestValidationMiddleware } from './common/middleware/request-validation.middleware';
import { ResponseTransformMiddleware } from './common/middleware/response-transform.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env.development', '.env'],
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),

    // Throttling for additional rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000, // 1 second
            limit: 10,
          },
          {
            name: 'medium',
            ttl: 60000, // 1 minute
            limit: 100,
          },
          {
            name: 'long',
            ttl: 900000, // 15 minutes
            limit: 1000,
          },
        ],
      }),
    }),

    // Health check
    TerminusModule,

    // Core modules
    AuthModule,
    ServiceDiscoveryModule,
    CircuitBreakerModule,
    RateLimitingModule,
    MonitoringModule,
    WebSocketModule,
    ProxyModule,
  ],
  controllers: [
    GatewayController,
    HealthController,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RequestValidationMiddleware,
        LoggingMiddleware,
        ResponseTransformMiddleware,
      )
      .forRoutes('*');
  }
}
