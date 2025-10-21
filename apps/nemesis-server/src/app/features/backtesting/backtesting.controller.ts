import { Controller, Get, Query, ParseFloatPipe, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { BacktestingService } from './backtesting.service';
import { IntervalType } from '@nemesis/commons';

@Controller('backtest')
export class BacktestingController {
  constructor(private readonly backtestingService: BacktestingService) {}

  @Get('run')
  async runBacktest(
    @Query('symbol') symbol: string = 'BTCUSDT',
    @Query('interval') interval: IntervalType = '15m',
    @Query('balance', new DefaultValuePipe(10000), ParseFloatPipe) balance: number,
    @Query('limit', new DefaultValuePipe(500), ParseIntPipe) limit: number,
    @Query('commission', new DefaultValuePipe(0.001), ParseFloatPipe) commission: number
  ) {
    return await this.backtestingService.runBacktest({
      symbol,
      interval,
      initialBalance: balance,
      limit,
      commissionRate: commission,
    });
  }

  @Get('compare')
  async compareSymbols(
    @Query('symbols') symbols: string = 'BTCUSDT,ETHUSDT,BNBUSDT',
    @Query('interval') interval: IntervalType = '15m',
    @Query('balance', new DefaultValuePipe(10000), ParseFloatPipe) balance: number,
    @Query('limit', new DefaultValuePipe(500), ParseIntPipe) limit: number
  ) {
    const symbolList = symbols.split(',');
    return await this.backtestingService.runMultipleBacktests(symbolList, {
      interval,
      initialBalance: balance,
      limit,
    });
  }
}
