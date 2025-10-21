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
  profitLoss?: number; // P/L de este trade específico
  profitLossPercentage?: number; // % P/L del trade
}

export interface BacktestResult {
  symbol: string;
  interval: IntervalType;
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  finalBalance: number;
  totalOperations: number; // Total de BUY + SELL
  completedTrades: number; // Pares completos (BUY+SELL)
  winningTrades: number;
  losingTrades: number;
  profitLoss: number;
  profitLossPercentage: number;
  winRate: number;
  trades: BacktestTrade[];
  equity: number[]; // Valor de la cuenta en cada momento (balance + posiciones)
  maxDrawdown: number;
  sharpeRatio?: number;
  averageWin?: number;
  averageLoss?: number;
  profitFactor?: number;
  stopLossTriggered?: number;
  takeProfitTriggered?: number;
}


export interface BacktestConfig {
  symbol: string;
  interval: IntervalType;
  startDate?: Date;
  endDate?: Date;
  initialBalance: number;
  limit?: number;
  commissionRate?: number;
  stopLossPercentage?: number; // % de pérdida para cerrar posición
  takeProfitPercentage?: number; // % de ganancia para cerrar posición
  useTrailingStop?: boolean; // Stop-loss dinámico
}
