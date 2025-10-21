import { Module } from '@nestjs/common';
import {BacktestingController} from './backtesting.controller';
import {BacktestingService} from './backtesting.service';
import {BinanceModule} from '../binance/binance.module';
import {StrategyModule} from '../strategy/strategy.module';

@Module({
  controllers: [BacktestingController],
  providers: [BacktestingService],
  imports: [BinanceModule, StrategyModule],
})
export class BacktestingModule {}
