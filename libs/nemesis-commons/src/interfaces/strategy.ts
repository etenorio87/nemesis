import {MarketTrendType, SignalType, TradingStrategyType} from '../types';
import {IndicatorSettings, TrendIndicators} from './indicators';

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
  trend?: MarketTrend; // 🆕 NUEVO: Información de tendencia
}

export interface TradeSignal {
  symbol: string;
  signal: SignalType;
  confidence: number;
  reason: string;
  price: number;
  timestamp: Date;
  indicators?: TechnicalAnalysis;
  indicatorSettings?: IndicatorSettings;
  marketTrend?: MarketTrend;              // 🆕 NUEVO: Tendencia del mercado
  strategyUsed?: TradingStrategyType;     // 🆕 NUEVO: Estrategia aplicada
}

export interface MarketTrend {
  type: MarketTrendType;                    // BULLISH, BEARISH, SIDEWAYS
  strength: number;                         // Fuerza de la tendencia (0-100)
  confidence: number;                       // Confianza en la detección (0-100)
  reason: string;                           // Explicación de por qué se detectó esta tendencia
  indicators: TrendIndicators;              // Indicadores usados en la detección
  recommendedStrategy: TradingStrategyType; // Estrategia recomendada
}

export interface TrendDetectionSettings {
  adxPeriod?: number;        // Período para ADX (default: 14)
  adxThreshold?: number;     // Umbral de ADX para considerar tendencia fuerte (default: 25)
  ema20Period?: number;      // Período EMA corto (default: 20)
  ema50Period?: number;      // Período EMA medio (default: 50)
  ema200Period?: number;     // Período EMA largo (default: 200)
  lookbackPeriod?: number;   // Períodos para analizar highs/lows (default: 20)
}

// ==========================================
// 🆕 CONFIGURACIÓN GLOBAL DEL BOT
// ==========================================

/**
 * Configuración de trading general
 */
export interface TradingSettings {
  defaultStopLossPercentage?: number;
  defaultTakeProfitPercentage?: number;
  defaultUseTrailingStop?: boolean;
  defaultCommissionRate?: number;
  enableTrendFilter?: boolean;        // Si true, no opera en BEARISH
  minConfidenceToBuy?: number;        // Default: 60
  minConfidenceToSell?: number;       // Default: 50
}

/**
 * Configuración completa del bot
 * Esta es la configuración que se guarda y persiste
 */
export interface BotSettings {
  indicators: IndicatorSettings;
  trendDetection: TrendDetectionSettings;
  trading: TradingSettings;
  lastUpdated: Date;
  version: string;
}
