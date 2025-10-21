import {Controller, Get, Param} from '@nestjs/common';
import {BinanceService} from './features/binance/binance.service';

@Controller()
export class AppController {
  constructor(private readonly binance: BinanceService) {}

  @Get('health')
  async health() {
    const isConnected = await this.binance.testConnection();
    return {
      status: 'ok',
      binanceConnected: isConnected,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('price/:symbol')
  async getPrice(@Param('symbol') symbol: string) {
    return await this.binance.getMarketPrice(symbol);
  }

  @Get('account')
  async getAccount() {
    return await this.binance.getAccountInfo();
  }
}
