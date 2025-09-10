import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyService } from './proxy.service';
import { ServiceDiscoveryModule } from '../service-discovery/service-discovery.module';
import { CircuitBreakerModule } from '../circuit-breaker/circuit-breaker.module';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ServiceDiscoveryModule,
    CircuitBreakerModule,
    MonitoringModule,
  ],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}