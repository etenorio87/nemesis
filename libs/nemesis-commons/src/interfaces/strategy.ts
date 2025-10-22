import {SignalType} from '../types';
import {IndicatorSettings} from './indicators';


export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
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
  confidence: number;
  reason: string;
  price: number;
  timestamp: Date;
  indicators?: TechnicalAnalysis;
  indicatorSettings?: IndicatorSettings; // 🆕 NUEVO
}
