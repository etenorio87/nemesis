// ==========================================
// 🆕 CONFIGURACIÓN DE INDICADORES - FASE 0
// ==========================================

/**
 * Configuración para RSI (Relative Strength Index)
 */
export interface RsiSettings {
  period: number; // Número de períodos (default: 14)
}

/**
 * Configuración para MACD (Moving Average Convergence Divergence)
 */
export interface MacdSettings {
  fastPeriod: number;   // Período rápido (default: 12)
  slowPeriod: number;   // Período lento (default: 26)
  signalPeriod: number; // Período de señal (default: 9)
}

/**
 * Configuración para SMA (Simple Moving Average)
 */
export interface SmaSettings {
  period: number; // Número de períodos (default: 20)
}

/**
 * Configuración para EMA (Exponential Moving Average)
 */
export interface EmaSettings {
  period: number; // Número de períodos (default: 20)
}

/**
 * Configuración completa de todos los indicadores técnicos
 * Todos los campos son opcionales - si no se especifican, se usan valores por defecto
 */
export interface IndicatorSettings {
  rsi?: RsiSettings;
  macd?: MacdSettings;
  sma?: SmaSettings;
  ema?: EmaSettings;
}
