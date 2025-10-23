import {
  EMA,
  ADX
} from 'technicalindicators';
import {EmaResults, Kline, TrendDetectionSettings} from '@nemesis/commons';
import {ADXOutput} from 'technicalindicators/declarations/generated';


export class StrategyUtil {

  /**
   * Calcula las EMAs (20, 50, 200) basándose en los precios de cierre.
   */
  static calculateEMAs(
    closePrices: number[],
    settings: TrendDetectionSettings,
  ): EmaResults {
    // La librería 'technicalindicators' necesita un array de valores y un período.

    const ema20 = EMA.calculate({
      values: closePrices,
      period: settings.ema20Period,
    });

    const ema50 = EMA.calculate({
      values: closePrices,
      period: settings.ema50Period,
    });

    const ema200 = EMA.calculate({
      values: closePrices,
      period: settings.ema200Period,
    });

    // Nota: Los arrays resultantes son más cortos que el array de entrada
    // (ema20 será 'closePrices.length - 19' elementos).
    // Esto lo manejaremos al alinear los datos, pero 'technicalindicators'
    // gestiona bien los cálculos subsiguientes.

    return { ema20, ema50, ema200 };
  }


  /**
   * Calcula el ADX (Average Directional Index).
   * Necesita High, Low y Close.
   */
  static calculateADX(
    klines: Kline[],
    settings: TrendDetectionSettings,
  ): ADXOutput[] {
    // Formateamos la entrada para la librería
    const adxInput = {
      high: klines.map((k) => k.high),
      low: klines.map((k) => k.low),
      close: klines.map((k) => k.close),
      period: settings.adxPeriod,
    };

    // La librería 'technicalindicators' devuelve un array de ADXOutput
    // ADXOutput = { adx: number, pdi: number, mdi: number }
    return ADX.calculate(adxInput);
  }

}
