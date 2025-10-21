import { Injectable, Logger } from '@nestjs/common';
import { RSI, MACD, SMA, EMA } from 'technicalindicators';
import {
  Kline,
  TechnicalAnalysis,
  TradeSignal,
  IntervalType,
} from '@nemesis/commons';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  /**
   * Procesa klines y calcula indicadores técnicos
   */
  analyzeTechnicals(
    klines: Kline[],
    symbol: string,
    interval: IntervalType
  ): TechnicalAnalysis {
    const closes = klines.map((k) => k.close);
    const highs = klines.map((k) => k.high);
    const lows = klines.map((k) => k.low);

    // RSI (14 periodos)
    const rsiValues = RSI.calculate({
      values: closes,
      period: 14,
    });
    const currentRSI = rsiValues[rsiValues.length - 1];

    // MACD (12, 26, 9)
    const macdValues = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    const currentMACD = macdValues[macdValues.length - 1];

    // SMA (20 periodos)
    const smaValues = SMA.calculate({
      values: closes,
      period: 20,
    });
    const currentSMA = smaValues[smaValues.length - 1];

    // EMA (20 periodos)
    const emaValues = EMA.calculate({
      values: closes,
      period: 20,
    });
    const currentEMA = emaValues[emaValues.length - 1];

    return {
      symbol,
      interval,
      rsi: currentRSI,
      macd: currentMACD
        ? {
          MACD: currentMACD.MACD,
          signal: currentMACD.signal,
          histogram: currentMACD.histogram,
        }
        : undefined,
      sma: currentSMA,
      ema: currentEMA,
      timestamp: new Date(),
    };
  }

  /**
   * Genera señal de trading basada en análisis técnico simple
   * Estrategia: RSI + MACD crossover
   */
  generateSignal(
    analysis: TechnicalAnalysis,
    currentPrice: number
  ): TradeSignal {
    const signals: string[] = [];
    let buyScore = 0;
    let sellScore = 0;

    // Análisis RSI
    if (analysis.rsi) {
      if (analysis.rsi < 30) {
        buyScore += 40;
        signals.push('RSI sobreventa (<30)');
      } else if (analysis.rsi > 70) {
        sellScore += 40;
        signals.push('RSI sobrecompra (>70)');
      } else if (analysis.rsi < 40) {
        buyScore += 20;
        signals.push('RSI bajo (<40)');
      } else if (analysis.rsi > 60) {
        sellScore += 20;
        signals.push('RSI alto (>60)');
      }
    }

    // Análisis MACD
    if (analysis.macd) {
      const { MACD: macdLine, signal, histogram } = analysis.macd;

      // MACD crossover alcista
      if (histogram > 0 && macdLine > signal) {
        buyScore += 30;
        signals.push('MACD crossover alcista');
      }
      // MACD crossover bajista
      else if (histogram < 0 && macdLine < signal) {
        sellScore += 30;
        signals.push('MACD crossover bajista');
      }
    }

    // Análisis de medias móviles
    if (analysis.sma && analysis.ema) {
      if (currentPrice > analysis.sma && currentPrice > analysis.ema) {
        buyScore += 20;
        signals.push('Precio sobre SMA y EMA');
      } else if (currentPrice < analysis.sma && currentPrice < analysis.ema) {
        sellScore += 20;
        signals.push('Precio bajo SMA y EMA');
      }
    }

    // Determinar señal final
    let signal: 'BUY' | 'SELL' | 'HOLD';
    let confidence: number;
    let reason: string;

    if (buyScore > sellScore && buyScore >= 50) {
      signal = 'BUY';
      confidence = Math.min(buyScore, 100);
      reason = `Señal de COMPRA: ${signals.join(', ')}`;
    } else if (sellScore > buyScore && sellScore >= 50) {
      signal = 'SELL';
      confidence = Math.min(sellScore, 100);
      reason = `Señal de VENTA: ${signals.join(', ')}`;
    } else {
      signal = 'HOLD';
      confidence = Math.abs(buyScore - sellScore);
      reason = `Sin señal clara. ${signals.join(', ') || 'Mercado neutral'}`;
    }

    this.logger.log(
      `${analysis.symbol}: ${signal} (${confidence}%) - ${reason}`
    );

    return {
      symbol: analysis.symbol,
      signal,
      confidence,
      reason,
      price: currentPrice,
      timestamp: new Date(),
      indicators: analysis,
    };
  }
}
