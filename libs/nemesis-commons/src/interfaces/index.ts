export * from './backtesting';
export * from './indicators';
export * from './strategy';

export interface BinanceConfig {
  apiKey: string;
  apiSecret: string;
  apiBaseUrl: string;
  apiWsUrl: string;
}

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}
