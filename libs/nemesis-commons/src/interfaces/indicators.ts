// ==========================================
// 🆕 CONFIGURACIÓN DE INDICADORES - FASE 0
// ==========================================
export interface RsiSettings {
  period: number; // Número de períodos (default: 14)
}

export interface MacdSettings {
  fastPeriod: number;   // Período rápido (default: 12)
  slowPeriod: number;   // Período lento (default: 26)
  signalPeriod: number; // Período de señal (default: 9)
}

export interface SmaSettings {
  period: number; // Número de períodos (default: 20)
}

export interface EmaSettings {
  period: number; // Número de períodos (default: 20)
}

export interface IndicatorSettings {
  rsi?: RsiSettings;
  macd?: MacdSettings;
  sma?: SmaSettings;
  ema?: EmaSettings;
}

export interface TrendIndicators {
  adx?: number;              // Average Directional Index (fuerza de tendencia)
  ema20?: number;            // EMA corto plazo
  ema50?: number;            // EMA medio plazo
  ema200?: number;           // EMA largo plazo
  ema20Slope?: number;       // Pendiente de EMA20 (positiva=alcista, negativa=bajista)
  ema50Slope?: number;       // Pendiente de EMA50
  pricePosition?: string;    // Posición del precio vs EMAs
  higherHighs?: boolean;     // ¿Precio hace máximos más altos?
  higherLows?: boolean;      // ¿Precio hace mínimos más altos?
  lowerHighs?: boolean;      // ¿Precio hace máximos más bajos?
  lowerLows?: boolean;       // ¿Precio hace mínimos más bajos?
}
