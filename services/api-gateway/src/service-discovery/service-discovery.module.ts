import { Module } from '@nestjs/common';
import { ServiceDiscoveryService } from './service-discovery.service';

@Module({
  providers: [ServiceDiscoveryService],
  exports: [ServiceDiscoveryService],
})
export class ServiceDiscoveryModule {}