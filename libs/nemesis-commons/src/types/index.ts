export type SignalType = 'BUY' | 'SELL' | 'HOLD';
export type OrderSideType = 'BUY' | 'SELL';
export type MarketTrendType = 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
export type TradingStrategyType = 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'HOLD';
export type IntervalType = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
export type PositionSideType = 'LONG' | 'SHORT';
export type ExecutedActionType =
  | 'BUY'              // Compra ejecutada
  | 'SELL'             // Venta ejecutada
  | 'HOLD';            // No se ejecutó nada
export type TradingActionType =
  | 'BUY'              // Abrir posición LONG
  | 'SELL'             // Cerrar posición por señal
  | 'HOLD'             // No hacer nada
  | 'CLOSE_SL'         // Cerrar por Stop Loss
  | 'CLOSE_TP'         // Cerrar por Take Profit
  | 'CLOSE_TRAILING';  // Cerrar por Trailing Stop
