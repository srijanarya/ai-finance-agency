import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from '../controllers/health.controller';
import { NotificationHealthIndicator } from '../health/notification.health';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [NotificationHealthIndicator],
})
export class HealthModule {}