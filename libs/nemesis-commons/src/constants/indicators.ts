import {BotSettings, IndicatorSettings, TrendDetectionSettings} from '../interfaces';

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
 * Configuración óptima por defecto del bot
 */
export const DEFAULT_BOT_CONFIGURATION: BotSettings = {
  indicators: DEFAULT_INDICATOR_SETTINGS,
  trendDetection: DEFAULT_TREND_DETECTION_SETTINGS,
  trading: {
    defaultStopLossPercentage: 2.0,
    defaultTakeProfitPercentage: 5.0,
    defaultUseTrailingStop: false,
    defaultCommissionRate: 0.001,
    enableTrendFilter: true,          // Por defecto SÍ filtrar mercados bajistas
    minConfidenceToBuy: 60,
    minConfidenceToSell: 50,
  },
  lastUpdated: new Date(),
  version: '1.0.0',
};

/**
 * Rangos de validación para configuración de tendencias
 */
export const TREND_DETECTION_VALIDATION_RANGES = {
  adxPeriod: { min: 7, max: 30 },
  adxThreshold: { min: 15, max: 40 },
  ema20Period: { min: 10, max: 50 },
  ema50Period: { min: 30, max: 100 },
  ema200Period: { min: 100, max: 300 },
  lookbackPeriod: { min: 10, max: 50 },
} as const;

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
