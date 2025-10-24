import {BotSettings, IndicatorSettings, TradingSettings, TrendDetectionSettings} from '../interfaces';

/**
 * Valores por defecto para todos los indicadores
 * Estos valores se usan cuando el usuario no especifica configuración personalizada
 */
export const DEFAULT_INDICATOR_SETTINGS: Required<IndicatorSettings> = {
  rsi: { period: 14 },
  macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  sma: { period: 20 },
  ema: { period: 20 }
};

/**
 * Valores por defecto para detección de tendencias
 */
export const DEFAULT_TREND_DETECTION_SETTINGS: Required<TrendDetectionSettings> = {
  adxPeriod: 14,
  adxThreshold: 25,        // ADX > 25 indica tendencia fuerte
  ema20Period: 20,
  ema50Period: 50,
  ema200Period: 200,
  lookbackPeriod: 20,      // Analizar últimos 20 períodos para highs/lows
};

/**
 * Valores por defecto para detección de tendencias
 */
export const DEFAULT_TRADING_SETTINGS: Required<TradingSettings> = {
  enableTrendFilter: true,          // Por defecto SÍ filtrar mercados bajistas
  commissionRate: 0.001,
  stopLossPercent: 0.015,
  takeProfitPercent: 0.03,
  trailingStopPercent: 0.008,
  breakevenThreshold: 0.015,
  maxPositionSize: 0.95,
  minConfidenceToBuy: 60,
  minConfidenceToSell: 50,
};

/**
 * Configuración óptima por defecto del bot
 */
export const DEFAULT_BOT_CONFIGURATION: BotSettings = {
  version:        '1.0.0',
  indicators:     DEFAULT_INDICATOR_SETTINGS,
  trendDetection: DEFAULT_TREND_DETECTION_SETTINGS,
  trading:        DEFAULT_TRADING_SETTINGS,
  lastUpdated:    new Date(),
};


/**
 * GUÍA DE INTERPRETACIÓN DE TENDENCIAS
 *
 * ADX (Average Directional Index):
 * - ADX < 20: Tendencia débil o mercado lateral (SIDEWAYS)
 * - ADX 20-25: Tendencia emergente
 * - ADX > 25: Tendencia fuerte (BULLISH o BEARISH) ⭐
 * - ADX > 40: Tendencia muy fuerte
 *
 * EMAs (Exponential Moving Averages):
 * - Precio > EMA20 > EMA50 > EMA200: Fuerte tendencia BULLISH ⭐
 * - Precio < EMA20 < EMA50 < EMA200: Fuerte tendencia BEARISH
 * - EMAs entrelazadas: Mercado SIDEWAYS
 *
 * Price Action:
 * - Higher Highs + Higher Lows: BULLISH
 * - Lower Highs + Lower Lows: BEARISH
 * - Mezcla de ambos: SIDEWAYS
 *
 * Estrategias Recomendadas:
 * - BULLISH: TREND_FOLLOWING (seguir la tendencia alcista)
 * - BEARISH: HOLD (no operar, evitar pérdidas)
 * - SIDEWAYS: MEAN_REVERSION (comprar bajo, vender alto)
 */
