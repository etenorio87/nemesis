import {IntervalType, OrderSideType, SignalType} from './types';

export interface BinanceConfig {
  apiKey: string;
  apiSecret: string;
  apiBaseUrl: string;
  apiWsUrl: string;
}

// Tipos básicos para el trading bot
export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
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
  signal: SignalType;
  confidence: number; // 0-100
  reason: string;
  price: number;
  timestamp: Date;
  indicators?: TechnicalAnalysis;
}

export interface BacktestTrade {
  type: OrderSideType;
  price: number;
  timestamp: Date;
  reason: string;
}

export interface BacktestResult {
  symbol: string;
  interval: IntervalType;
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  finalBalance: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitLoss: number;
  profitLossPercentage: number;
  winRate: number;
  trades: BacktestTrade[];
  equity: number[]; // Evolución del capital
  maxDrawdown: number;
  sharpeRatio?: number;
}

export interface BacktestConfig {
  symbol: string;
  interval: IntervalType;
  startDate?: Date;
  endDate?: Date;
  initialBalance: number;
  limit?: number; // Número de klines a analizar
  commissionRate?: number; // Comisión por trade (ej: 0.001 = 0.1%)
}
