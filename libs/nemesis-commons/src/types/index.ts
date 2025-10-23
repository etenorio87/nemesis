export enum SignalEnum {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD'
}

export enum OrderSideEnum {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum MarketTrendEnum {
  BULLISH = 'BULLISH',   // Mercado alcista
  BEARISH = 'BEARISH',   // Mercado bajista
  SIDEWAYS = 'SIDEWAYS', // Mercado lateral
}

export enum TradingStrategyEnum {
  TREND_FOLLOWING = 'TREND_FOLLOWING', // Seguir la tendencia
  MEAN_REVERSION = 'MEAN_REVERSION',   // Reversión a la media
  HOLD = 'HOLD',                        // No operar
}


export type SignalType = keyof typeof SignalEnum;
export type OrderSideType = keyof typeof OrderSideEnum;
export type MarketTrendType = keyof typeof MarketTrendEnum;
export type TradingStrategyType = keyof typeof TradingStrategyEnum;
export type IntervalType = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
