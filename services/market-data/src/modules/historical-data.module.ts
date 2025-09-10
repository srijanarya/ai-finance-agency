import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { HistoricalData } from "../entities/historical-data.entity";
import { HistoricalDataService } from "../services/historical-data.service";

@Module({
  imports: [TypeOrmModule.forFeature([HistoricalData])],
  providers: [HistoricalDataService],
  exports: [HistoricalDataService],
})
export class HistoricalDataModule {}
