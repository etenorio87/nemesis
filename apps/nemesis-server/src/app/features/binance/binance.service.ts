import {Injectable, Logger} from '@nestjs/common';
import Binance from 'binance-api-node';
import {BinanceConfig, MarketData} from '@nemesis/commons';

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private client: ReturnType<typeof Binance>;

  constructor() {
    const config: BinanceConfig = {
      apiKey: process.env.BINANCE_API_KEY || '',
      apiSecret: process.env.BINANCE_API_SECRET || '',
      apiBaseUrl: process.env.BINANCE_BASE_URL || '',
      apiWsUrl: process.env.BINANCE_WSS_URL || '',
    };

    this.client = Binance({
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      httpBase: config.apiBaseUrl,
      wsBase: config.apiWsUrl,
    });

    this.logger.log('Binance client initialized');
  }

  async getMarketPrice(symbol: string): Promise<MarketData> {
    try {
      const ticker = await this.client.prices({ symbol });
      return {
        symbol,
        price: parseFloat(ticker[symbol]),
        volume: 0, // Por ahora
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error getting market price for ${symbol}:`, error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      this.logger.log('Binance connection successful');
      return true;
    } catch (error) {
      this.logger.error('Binance connection failed:', error);
      return false;
    }
  }

  async getAccountInfo() {
    try {
      return await this.client.accountInfo();
    } catch (error) {
      this.logger.error('Error getting account info:', error);
      throw error;
    }
  }
}
