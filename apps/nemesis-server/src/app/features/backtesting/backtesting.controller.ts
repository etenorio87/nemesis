import {Controller, Post, Body, ValidationPipe} from '@nestjs/common';
import {CompareBacktestsDto} from './dto/compare-symbols.dto';
import {BacktestingService} from './backtesting.service';
import {RunBacktestDto} from './dto/run-backtest.dto';

@Controller('backtest')
export class BacktestingController {
  constructor(private readonly backtestingService: BacktestingService) {
  }

  @Post('run')
  async runBacktest(
    @Body(new ValidationPipe({ transform: true })) dto: RunBacktestDto
  ) {
    return await this.backtestingService.runBacktest({
      symbol: dto.symbol,
      interval: dto.interval,
      initialBalance: dto.initialBalance,
      limit: dto.limit || 500,
      commissionRate: dto.commissionRate || 0.001,
      stopLossPercentage: dto.stopLossPercentage,
      takeProfitPercentage: dto.takeProfitPercentage,
      useTrailingStop: dto.useTrailingStop || false,
    });
  }

  @Post('compare')
  async compareSymbols(
    @Body(new ValidationPipe({ transform: true })) dto: CompareBacktestsDto
  ) {
    return await this.backtestingService.runMultipleBacktests(dto.symbols, {
      interval: dto.interval,
      initialBalance: dto.initialBalance,
      limit: dto.limit || 500,
    });
  }

}
