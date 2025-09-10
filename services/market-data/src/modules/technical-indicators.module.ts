import { Module, forwardRef } from "@nestjs/common";

import { TechnicalIndicatorsService } from "../services/technical-indicators.service";
import { HistoricalDataModule } from "./historical-data.module";

@Module({
  imports: [forwardRef(() => HistoricalDataModule)],
  providers: [TechnicalIndicatorsService],
  exports: [TechnicalIndicatorsService],
})
export class TechnicalIndicatorsModule {}
