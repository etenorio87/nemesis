/**
 * 🎯 FASE 0: Constantes para Indicadores Configurables
 *
 * Este archivo contiene los valores por defecto y rangos de validación
 * para todos los indicadores técnicos configurables.
 */

import { IndicatorSettings } from '../interfaces';

/**
 * Valores por defecto para todos los indicadores
 * Estos valores se usan cuando el usuario no especifica configuración personalizada
 */
export const DEFAULT_INDICATOR_SETTINGS: Required<IndicatorSettings> = {
  rsi: {
    period: 14
  },
  macd: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  },
  sma: {
    period: 20
  },
  ema: {
    period: 20
  }
};

/**
 * Rangos válidos para validación de parámetros
 * Usados por los DTOs para validar inputs del usuario
 */
export const INDICATOR_VALIDATION_RANGES = {
  rsi: {
    period: { min: 5, max: 50 }
  },
  macd: {
    fastPeriod: { min: 5, max: 30 },
    slowPeriod: { min: 15, max: 50 },
    signalPeriod: { min: 5, max: 20 }
  },
  sma: {
    period: { min: 5, max: 200 }
  },
  ema: {
    period: { min: 5, max: 200 }
  }
} as const;

/**
 * GUÍA DE CONFIGURACIÓN DE INDICADORES
 *
 * RSI (Relative Strength Index):
 * - period: 7-10 = Más sensible, más señales (riesgoso)
 * - period: 14 = Balanceado (recomendado) ⭐
 * - period: 21-30 = Más conservador, menos señales
 *
 * MACD (Moving Average Convergence Divergence):
 * - Fast/Slow/Signal: 8/21/5 = Agresivo, mercados rápidos
 * - Fast/Slow/Signal: 12/26/9 = Estándar (recomendado) ⭐
 * - Fast/Slow/Signal: 19/39/9 = Conservador, tendencias largas
 *
 * SMA/EMA (Moving Averages):
 * - period: 20 = Corto plazo, day trading ⭐
 * - period: 50 = Medio plazo, swing trading
 * - period: 200 = Largo plazo, tendencias principales
 *
 * NOTA: Períodos más cortos = Más señales pero más falsas
 *       Períodos más largos = Menos señales pero más confiables
 */
