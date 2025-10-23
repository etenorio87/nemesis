import { Module } from '@nestjs/common';
import {AnalysisService} from './analysis.service';
import {BinanceModule} from '../binance/binance.module';

@Module({
  imports: [BinanceModule],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class StrategyModule {}
