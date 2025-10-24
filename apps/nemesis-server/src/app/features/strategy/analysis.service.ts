import { Injectable } from '@nestjs/common';
import { RSI, MACD } from 'technicalindicators';
import {
  Kline,
  TechnicalAnalysis,
  TradeSignal,
  IndicatorSettings,
  DEFAULT_INDICATOR_SETTINGS, TradingStrategyType, SignalType,
} from '@nemesis/commons';

@Injectable()
export class AnalysisService {

  /**
   * MÉTODO ROUTER PRINCIPAL
   * Este método reemplaza la lógica anterior.
   * Recibe la estrategia y delega al método de cálculo apropiado.
   *
   * @param symbol - El símbolo del par (ej. 'BTCUSDT')
   * @param klines - Historial de velas (OHLCV).
   * @param settings - Configuración de indicadores.
   * @param strategy - La estrategia dictada por TrendAnalysisService (MEAN_REVERSION o TREND_FOLLOWING).
   * @returns TradeSignal - Una señal de trading (BUY, SELL, o HOLD).
   */
  public generateSignals(
    symbol: string,
    klines: Kline[],
    settings: IndicatorSettings,
    strategy: TradingStrategyType,
  ): TradeSignal {
    // Obtenemos la última vela y precio
    const currentKline = klines[klines.length - 1];
    if (!currentKline) {
      return this.createHoldSignal(
        'Datos de Klines insuficientes',
        symbol
      );
    }

    // Unificamos la configuración
    const mergedSettings = this.mergeWithDefaults(settings);

    // Enrutamos la lógica basada en la estrategia
    switch (strategy) {
      case 'MEAN_REVERSION':
        return this.generateMeanReversionSignal(
          symbol,
          klines,
          mergedSettings,
          currentKline,
        );
      case 'TREND_FOLLOWING':
        return this.generateTrendFollowingSignal(
          symbol,
          klines,
          mergedSettings,
          currentKline,
        );
      case 'HOLD':
      default:
        return this.createHoldSignal(
          'Estrategia HOLD activa (detectado mercado bajista o incierto)',
          symbol,
        );
    }
  }

  /**
   * Estrategia de Reversión a la Media (Mercados Laterales)
   * (Esta es su lógica existente, adaptada)
   */
  private generateMeanReversionSignal(
    symbol: string,
    klines: Kline[],
    settings: Required<IndicatorSettings>,
    currentKline: Kline,
  ): TradeSignal {
    const closes = klines.map((k) => k.close);
    const analysis: Partial<TechnicalAnalysis> = {}; // Usamos Partial para construirlo

    // RSI
    const rsiValues = RSI.calculate({
      values: closes,
      period: settings.rsi.period,
    });
    analysis.rsi = rsiValues[rsiValues.length - 1];

    // Lógica de Puntuación (Scoring)
    const signals: string[] = [];
    let buyScore = 0;
    let sellScore = 0;

    if (analysis.rsi) {
      if (analysis.rsi < 30) {
        buyScore = 100; // Señal fuerte
        signals.push('RSI sobreventa (<30)');
      } else if (analysis.rsi > 70) {
        sellScore = 100; // Señal fuerte
        signals.push('RSI sobrecompra (>70)');
      }
    }

    // Determinar señal final
    if (buyScore > sellScore) {
      return this.createSignal(
        symbol,
        'BUY',
        buyScore,
        `Señal de COMPRA (Mean Reversion): ${signals.join(', ')}`,
        currentKline,
        settings,
        analysis,
        'MEAN_REVERSION', // 1. Especificar estrategia
      );
    } else if (sellScore > buyScore) {
      return this.createSignal(
        symbol,
        'SELL',
        sellScore,
        `Señal de VENTA (Mean Reversion): ${signals.join(', ')}`,
        currentKline,
        settings,
        analysis,
        'MEAN_REVERSION', // 2. Especificar estrategia
      );
    }

    return this.createHoldSignal(
      `Señal HOLD (Mean Reversion): RSI neutral (${analysis.rsi?.toFixed(2)})`,
      symbol,
      analysis,
    );
  }

  /**
   * Estrategia de Seguimiento de Tendencia (Mercados Alcistas)
   * (A implementar)
   */
  private generateTrendFollowingSignal(
    symbol: string,
    klines: Kline[],
    settings: Required<IndicatorSettings>,
    currentKline: Kline,
  ): TradeSignal {
    const closes = klines.map((k) => k.close);

    // 1. Calcular MACD
    const macdValues = MACD.calculate({
      values: closes,
      fastPeriod: settings.macd.fastPeriod,
      slowPeriod: settings.macd.slowPeriod,
      signalPeriod: settings.macd.signalPeriod,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });

    // 2. Verificar datos suficientes para un crossover
    if (macdValues.length < 2) {
      return this.createHoldSignal(
        'Datos insuficientes para MACD crossover',
        symbol,
      );
    }

    // 3. Obtener los dos últimos valores de MACD (actual y anterior)
    const currentMacd = macdValues[macdValues.length - 1];
    const previousMacd = macdValues[macdValues.length - 2];

    // Adjuntamos el indicador al análisis para el registro
    const analysis: Partial<TechnicalAnalysis> = {
      macd: currentMacd,
    };

    // 4. Lógica de Crossover
    const signals: string[] = [];
    let buyScore = 0;
    let sellScore = 0;

    // Crossover Alcista (Golden Cross) -> Señal de ENTRADA
    if (
      previousMacd.MACD <= previousMacd.signal && // Estaba abajo o cruzando
      currentMacd.MACD > currentMacd.signal &&    // Cruzó arriba
      currentMacd.histogram > 0                  // Confirmado por histograma positivo
    ) {
      buyScore = 100;
      signals.push('MACD Crossover Alcista (Entrada)');
    }
    // Crossover Bajista (Dead Cross) -> Señal de SALIDA
    else if (
      previousMacd.MACD >= previousMacd.signal && // Estaba arriba o cruzando
      currentMacd.MACD < currentMacd.signal       // Cruzó abajo
    ) {
      sellScore = 100;
      signals.push('MACD Crossover Bajista (Salida)');
    }

    // 5. Determinar señal final
    if (buyScore > 0) {
      return this.createSignal(
        symbol,
        'BUY',
        buyScore,
        `Señal de COMPRA (Trend Following): ${signals.join(', ')}`,
        currentKline,
        settings,
        analysis,
        'TREND_FOLLOWING', // 3. Especificar estrategia
      );
    } else if (sellScore > 0) {
      return this.createSignal(
        symbol,
        'SELL',
        sellScore,
        `Señal de VENTA (Trend Following): ${signals.join(', ')}`,
        currentKline,
        settings,
        analysis,
        'TREND_FOLLOWING', // 4. Especificar estrategia
      );
    }

    return this.createHoldSignal(
      `Señal HOLD (Trend Following): Sin Crossover MACD. Hist: ${currentMacd.histogram?.toFixed(
        2,
      )}`,
      symbol,
      analysis,
    );
  }

  // --- MÉTODOS HELPER ---

  /**
   * Helper para crear señales (BUY/SELL)
   */
  private createSignal(
    symbol: string,
    signal: SignalType,
    confidence: number,
    reason: string,
    kline: Kline,
    settings: IndicatorSettings,
    analysis: Partial<TechnicalAnalysis>,
    strategy: TradingStrategyType, // 5. NUEVO PARÁMETRO
  ): TradeSignal {
    return {
      symbol,
      signal,
      confidence,
      reason,
      price: kline.close,
      timestamp: new Date(kline.closeTime),
      indicators: analysis as TechnicalAnalysis,
      indicatorSettings: settings,
      strategyUsed: strategy
    };
  }

  /**
   * Helper para crear señal HOLD
   */
  private createHoldSignal(
    reason: string,
    symbol: string,
    analysis?: Partial<TechnicalAnalysis>,
  ): TradeSignal {
    return {
      symbol: symbol,
      signal: 'HOLD',
      confidence: 0,
      reason,
      price: 0, // No aplica
      timestamp: new Date(),
      indicators: (analysis as TechnicalAnalysis) || undefined,
    };
  }

  /**
   * Merge configuración personalizada con defaults
   */
  private mergeWithDefaults(
    customSettings?: IndicatorSettings,
  ): Required<IndicatorSettings> {
    return {
      rsi: {
        period: customSettings?.rsi?.period ?? DEFAULT_INDICATOR_SETTINGS.rsi.period,
      },
      macd: {
        fastPeriod: customSettings?.macd?.fastPeriod ?? DEFAULT_INDICATOR_SETTINGS.macd.fastPeriod,
        slowPeriod: customSettings?.macd?.slowPeriod ?? DEFAULT_INDICATOR_SETTINGS.macd.slowPeriod,
        signalPeriod: customSettings?.macd?.signalPeriod ?? DEFAULT_INDICATOR_SETTINGS.macd.signalPeriod,
      },
      sma: {
        period: customSettings?.sma?.period ?? DEFAULT_INDICATOR_SETTINGS.sma.period,
      },
      ema: {
        period: customSettings?.ema?.period ?? DEFAULT_INDICATOR_SETTINGS.ema.period,
      },
    };
  }
}
