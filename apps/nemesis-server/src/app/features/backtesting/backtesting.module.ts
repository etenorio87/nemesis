import { Module } from '@nestjs/common';
import {BacktestingController} from './backtesting.controller';
import {BacktestingService} from './backtesting.service';
import {BinanceModule} from '../binance/binance.module';
import {StrategyModule} from '../strategy/strategy.module';
import {TradingEngineModule} from '../trading-engine/trading-engine.module';

@Module({
  controllers: [BacktestingController],
  providers: [BacktestingService],
  imports: [BinanceModule, StrategyModule, TradingEngineModule],
})
export class BacktestingModule {}
