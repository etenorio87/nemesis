import { Controller, Get, Query } from '@nestjs/common';
import { IntervalType } from '@nemesis/commons';
import { TradingService } from './trading.service';

@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get('analyze')
  async analyzeSymbol(
    @Query('symbol') symbol: string = 'BTCUSDT',
    @Query('interval') interval: IntervalType = '15m',
    @Query('limit') limit: string = '100'
  ) {
    return await this.tradingService.analyzeSymbol(
      symbol,
      interval,
      parseInt(limit)
    );
  }

  @Get('signals')
  async getSignals(@Query('symbols') symbols?: string) {
    const symbolList = symbols
      ? symbols.split(',')
      : ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];

    return await this.tradingService.getMultipleSignals(symbolList);
  }
}
