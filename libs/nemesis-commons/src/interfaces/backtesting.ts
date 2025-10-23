import {IntervalType, OrderSideType} from '../types';
import {IndicatorSettings} from './indicators';

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
  totalOperations: number;
  completedTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitLoss: number;
  profitLossPercentage: number;
  winRate: number;
  trades: BacktestTrade[];
  equity: number[];
  maxDrawdown: number;
  sharpeRatio?: number;
  averageWin?: number;
  averageLoss?: number;
  profitFactor?: number;
  stopLossTriggered?: number;
  takeProfitTriggered?: number;
  indicatorSettings?: IndicatorSettings;
  trendAnalysis?: {                       // 🆕 NUEVO: Análisis de tendencias durante el backtest
    bullishPeriods: number;               // Períodos en tendencia alcista
    bearishPeriods: number;               // Períodos en tendencia bajista
    sidewaysPeriods: number;              // Períodos en mercado lateral
    tradesInBullish: number;              // Trades ejecutados en BULLISH
    tradesInBearish: number;              // Trades ejecutados en BEARISH (debería ser 0)
    tradesInSideways: number;             // Trades ejecutados en SIDEWAYS
  };
}


export interface BacktestConfig {
  symbol: string;
  interval: IntervalType;
  startDate?: Date;
  endDate?: Date;
  initialBalance: number;
  limit?: number;
}
