import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Watchlist } from "../entities/watchlist.entity";
import { WatchlistService } from "../services/watchlist.service";
import { WatchlistController } from "../controllers/watchlist.controller";
import { MarketDataModule } from "./market-data.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Watchlist]),
    forwardRef(() => MarketDataModule),
  ],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
