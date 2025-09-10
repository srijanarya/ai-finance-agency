import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { MarketData } from '../entities/market-data.entity';
import { MarketSession } from '../entities/market-session.entity';
import { MarketDataService } from '../services/market-data.service';
import { MarketDataController } from '../controllers/market-data.controller';
import { MarketDataGateway } from '../gateways/market-data.gateway';
import { HistoricalDataModule } from './historical-data.module';
import { TechnicalIndicatorsModule } from './technical-indicators.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketData, MarketSession]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    HistoricalDataModule,
    TechnicalIndicatorsModule,
  ],
  controllers: [MarketDataController],
  providers: [MarketDataService, MarketDataGateway],
  exports: [MarketDataService],
})
export class MarketDataModule {}