import {Controller, Get} from '@nestjs/common';
import {BinanceService} from '../binance/binance.service';

@Controller('health')
export class HealthController {
  constructor(private readonly binance: BinanceService) {}

  @Get('')
  async health() {
    const isConnected = await this.binance.testConnection();
    return {
      status: 'ok',
      binanceConnected: isConnected,
      timestamp: new Date().toISOString(),
    };
  }

}
