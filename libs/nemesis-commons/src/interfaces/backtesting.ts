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
  indicatorSettings?: IndicatorSettings;
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
  indicatorSettings?: IndicatorSettings;
}
