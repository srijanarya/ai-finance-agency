import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

// Future implementation for health checks
// Controllers and services would be implemented here

@Module({
  imports: [
    TerminusModule,
    HttpModule,
  ],
  controllers: [
    // HealthController - to be implemented
  ],
  providers: [
    // HealthService - to be implemented
  ],
})
export class HealthModule {}