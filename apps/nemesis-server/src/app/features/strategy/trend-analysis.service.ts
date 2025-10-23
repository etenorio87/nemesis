import { Injectable, Logger } from '@nestjs/common';
import {
  Kline,
  MarketTrend,
  MarketTrendType,
  TrendDetectionSettings,
  TradingStrategyType, MarketTrendEnum, TradingStrategyEnum,
} from '@nemesis/commons';
import {StrategyUtil} from './strategy.util';

@Injectable()
export class TrendAnalysisService {
  private readonly logger = new Logger(TrendAnalysisService.name);

  constructor() {}

  /**
   * Analiza la tendencia del mercado basándose en Klines y configuraciones.
   * @param klines - Array de velas (Kline).
   * @param settings - Configuración para la detección de tendencias.
   * @returns MarketTrend - El objeto que describe la tendencia actual.
   */
  public detectTrend(
    klines: Kline[],
    settings: TrendDetectionSettings,
  ): MarketTrend {
    // 1. Validar datos mínimos
    const minDataRequired = Math.max(
      settings.ema200Period,
      settings.adxPeriod * 2, // ADX necesita más "warm-up"
    );

    if (klines.length < minDataRequired) {
      this.logger.warn(
        `No hay suficientes datos de Klines (${klines.length}) para calcular indicadores largos (requerido: ${minDataRequired}).`,
      );
      // Retornamos SIDEWAYS si no hay datos suficientes para un análisis robusto.
      return this.createMarketTrendObject(MarketTrendEnum.SIDEWAYS, 0);
    }

    // Extraemos los precios de cierre
    const closePrices = klines.map((k) => k.close);

    // 2. Calcular EMAs
    const emaResults = StrategyUtil.calculateEMAs(closePrices, settings);

    // 3. Calcular ADX (NUEVO)
    const adxResults = StrategyUtil.calculateADX(klines, settings);

    // 4. Determinar tendencia y estrategia (Lógica MEJORADA)

    // Obtenemos los últimos valores de los indicadores.
    // Usamos 'slice(-1)[0]' o 'at(-1)' para obtener el último elemento de forma segura.
    const lastPrice = closePrices[closePrices.length - 1];
    const lastEma200 = emaResults.ema200[emaResults.ema200.length - 1];

    // ADX devuelve un array más corto; tomamos el último cálculo.
    const lastAdx = adxResults[adxResults.length - 1];
    if (!lastAdx) {
      // Si el cálculo de ADX falló o no devolvió nada
      return this.createMarketTrendObject(MarketTrendEnum.SIDEWAYS, 0);
    }

    const adxValue = lastAdx.adx;
    const pdiValue = lastAdx.pdi; // Positive Directional Indicator
    const mdiValue = lastAdx.mdi; // Negative Directional Indicator

    // --- Lógica de Decisión Combinada ---
    let currentTrend = MarketTrendEnum.SIDEWAYS;

    // Filtro 1: ¿Hay fuerza en el mercado? (ADX > Umbral)
    const isTrending = adxValue > settings.adxThreshold;

    // Filtro 2: ¿Cuál es la dirección? (PDI vs MDI)
    const isBullishDirection = pdiValue > mdiValue;

    // Filtro 3: ¿Confirma la tendencia a largo plazo? (Precio vs EMA 200)
    const isAboveLongTerm = lastPrice > lastEma200;

    if (!isTrending) {
      // Si ADX es bajo, no hay tendencia. Es lateral.
      currentTrend = MarketTrendEnum.SIDEWAYS;
    } else {
      // Si hay tendencia (ADX alto)...
      if (isBullishDirection && isAboveLongTerm) {
        // Tendencia alcista confirmada (ADX fuerte, PDI > MDI, Precio > EMA 200)
        currentTrend = MarketTrendEnum.BULLISH;
      } else if (!isBullishDirection && !isAboveLongTerm) {
        // Tendencia bajista confirmada (ADX fuerte, MDI > PDI, Precio < EMA 200)
        currentTrend = MarketTrendEnum.BEARISH;
      } else {
        // Señales mixtas (p.ej. ADX fuerte, PDI > MDI, pero Precio < EMA 200)
        // Esto es un 'pullback' alcista en tendencia bajista, o viceversa.
        // Es un estado de "incertidumbre" o "transición". Lo tratamos como HOLD/SIDEWAYS.
        currentTrend = MarketTrendEnum.SIDEWAYS;
      }
    }
    // --- Fin Lógica de Decisión ---

    // Usamos el valor del ADX como la 'fuerza' de la tendencia.
    return this.createMarketTrendObject(currentTrend, adxValue);
  }

  /**
   * Método helper para construir el objeto MarketTrend y asignar la estrategia recomendada.
   */
  private createMarketTrendObject(
    trend: MarketTrendType,
    strength: number, // (p.ej. valor ADX)
    confidence = 0.5, // Confianza en la detección (0-1)
  ): MarketTrend {
    let strategy: TradingStrategyType;

    switch (trend) {
      case MarketTrendEnum.BULLISH:
        strategy = TradingStrategyEnum.TREND_FOLLOWING;
        break;
      case MarketTrendEnum.SIDEWAYS:
        strategy = TradingStrategyEnum.MEAN_REVERSION;
        break;
      case MarketTrendEnum.BEARISH:
      default:
        strategy = TradingStrategyEnum.HOLD;
        break;
    }

    return {
      type: trend,
      strength,
      confidence,
      reason: null,
      indicators: null,
      recommendedStrategy: strategy,
    };
  }

  // Métodos privados para cálculos de indicadores (se implementarán a continuación)
  // private calculateEMAs(...) {}
  // private calculateADX(...) {}
  // private analyzePriceAction(...) {}
}
