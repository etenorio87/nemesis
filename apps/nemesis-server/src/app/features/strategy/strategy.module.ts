import { Module } from '@nestjs/common';
import {AnalysisService} from './analysis.service';
import {BinanceModule} from '../binance/binance.module';
import {TrendAnalysisService} from './trend-analysis.service';

@Module({
  imports: [BinanceModule],
  providers: [AnalysisService, TrendAnalysisService],
  exports: [AnalysisService, TrendAnalysisService],
})
export class StrategyModule {}
