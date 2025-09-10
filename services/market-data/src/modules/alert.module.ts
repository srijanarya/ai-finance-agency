import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketAlert } from '../entities/market-alert.entity';
import { AlertService } from '../services/alert.service';
import { AlertController } from '../controllers/alert.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MarketAlert])],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}