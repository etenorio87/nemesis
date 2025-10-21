import { Module } from '@nestjs/common';
import {AnalysisService} from './analysis.service';
import {TradingService} from './trading.service';
import {TradingController} from './trading.controller';
import {BinanceModule} from '../binance/binance.module';

@Module({
  controllers: [TradingController],
  imports: [BinanceModule],
  providers: [AnalysisService, TradingService],
  exports: [AnalysisService, TradingService],
})
export class StrategyModule {}
