import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketGatewayService } from './websocket-gateway.service';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { ServiceDiscoveryModule } from '../service-discovery/service-discovery.module';

@Module({
  imports: [
    JwtModule,
    MonitoringModule,
    ServiceDiscoveryModule,
  ],
  providers: [WebSocketGatewayService],
  exports: [WebSocketGatewayService],
})
export class WebSocketModule {}