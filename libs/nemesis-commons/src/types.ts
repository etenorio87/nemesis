export enum SignalEnum {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD'
}

export enum OrderSideEnum {
  BUY = 'BUY',
  SELL = 'SELL',
}

export type SignalType = keyof typeof SignalEnum;
export type OrderSideType = keyof typeof OrderSideEnum;

export type IntervalType = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
