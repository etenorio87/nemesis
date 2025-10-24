import {MarketTrendType, SignalType, TradingStrategyType} from '../types';
import {IndicatorSettings, MACDOutput, TrendIndicators} from './indicators';

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
  macd?: MACDOutput;
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

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface TrendDetectionSettings {
  adxPeriod?: number;        // Período para ADX (default: 14)
  adxThreshold?: number;     // Umbral de ADX para considerar tendencia fuerte (default: 25)
  ema20Period?: number;      // Período EMA corto (default: 20)
  ema50Period?: number;      // Período EMA medio (default: 50)
  ema200Period?: number;     // Período EMA largo (default: 200)
  lookbackPeriod?: number;   // Períodos para analizar highs/lows (default: 20)
}

/**
 * Configuración de trading general
 */
export interface TradingSettings {
  enableTrendFilter?: boolean;    // Si true, no opera en BEARISH
  commissionRate?: number;        // Tasa de comisión por operación (ej: 0.001)
  stopLossPercent?: number;       // % de stop loss (ej: 2.0)
  takeProfitPercent?: number;     // % de take profit (ej: 5.0)
  trailingStopPercent?: number;   // % de trailing (usa stopLoss si no se especifica)
  breakevenThreshold?: number;    // % para mover SL a breakeven (ej: 1.5)
  maxPositionSize?: number;       // Máximo % del balance por posición (ej: 0.95)
  minConfidenceToBuy?: number;    // Confianza mínima para comprar (ej: 60)
  minConfidenceToSell?: number;   // Confianza mínima para vender (ej: 50)
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
