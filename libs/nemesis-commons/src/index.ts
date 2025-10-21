// Tipos básicos para el trading bot
export interface BinanceConfig {
  apiKey: string;
  apiSecret: string;
  apiBaseUrl: string;
  apiWsUrl: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
}

export interface BotStatus {
  isRunning: boolean;
  lastUpdate: Date;
  activeTrades: number;
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

export interface TechnicalAnalysis {
  symbol: string;
  interval: string;
  rsi?: number;
  macd?: {
    MACD: number;
    signal: number;
    histogram: number;
  };
  sma?: number;
  ema?: number;
  timestamp: Date;
}

export interface TradeSignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-100
  reason: string;
  price: number;
  timestamp: Date;
  indicators?: TechnicalAnalysis;
}

export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
