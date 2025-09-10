import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.health';
import { ExternalServiceHealthIndicator } from './indicators/external-service.health';

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
      gracefulShutdownTimeoutMs: 1000,
    }),
    HttpModule,
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    RabbitMQHealthIndicator,
    ExternalServiceHealthIndicator,
  ],
  exports: [
    HealthService,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    RabbitMQHealthIndicator,
    ExternalServiceHealthIndicator,
  ],
})
export class HealthModule {}