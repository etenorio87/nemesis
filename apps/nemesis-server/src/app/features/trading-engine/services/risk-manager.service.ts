/**
 * Risk Manager Service
 * Gestiona Stop Loss, Take Profit y Trailing Stop
 * Responsable de proteger el capital y asegurar ganancias
 */

import { Injectable, Logger } from '@nestjs/common';
import { BotContext, TradingDecision, RiskData } from '@nemesis/commons';

@Injectable()
export class RiskManagerService {
  private readonly logger = new Logger(RiskManagerService.name);

  /**
   * Evalúa si debe activarse algún mecanismo de gestión de riesgo
   * Este método tiene PRIORIDAD sobre las señales de trading
   *
   * @param context - Contexto actual de trading
   * @returns Decisión de trading (HOLD si no hay riesgo, o CLOSE_* si hay)
   */
  evaluateRiskManagement(context: BotContext): TradingDecision {

    // Sin posición = sin riesgo que gestionar
    if (!context.position) {
      return {
        action: 'HOLD',
        reason: 'Sin posición abierta, no hay riesgo que gestionar',
      };
    }

    const { position, settings } = context;
    const currentPnLPercentage = position.unrealizedPnLPercentage;
    const tradingSettings = settings.trading;

    // =====================================================================
    // 1. STOP LOSS FIJO
    // =====================================================================
    const stopLossThreshold = -Math.abs(tradingSettings.stopLossPercent);
    const stopLossPrice = position.entryPrice * (1 + stopLossThreshold / 100);

    if (currentPnLPercentage <= stopLossThreshold) {
      this.logger.warn(
        `🛑 STOP LOSS activado | Símbolo: ${context.symbol} | ` +
        `P/L: ${currentPnLPercentage.toFixed(2)}% | ` +
        `Umbral: ${stopLossThreshold}% | ` +
        `Precio actual: ${context.currentPrice} | ` +
        `Precio SL: ${stopLossPrice.toFixed(2)}`,
      );

      return {
        action: 'CLOSE_SL',
        reason: this.buildStopLossReason(currentPnLPercentage, stopLossThreshold),
        metadata: {
          riskData: {
            stopLossPrice: stopLossPrice,
          },
        },
      };
    }

    // =====================================================================
    // 2. TAKE PROFIT
    // =====================================================================
    const takeProfitThreshold = Math.abs(tradingSettings.takeProfitPercent);
    const takeProfitPrice = position.entryPrice * (1 + takeProfitThreshold / 100);

    if (currentPnLPercentage >= takeProfitThreshold) {
      this.logger.log(
        `🎯 TAKE PROFIT activado | Símbolo: ${context.symbol} | ` +
        `P/L: ${currentPnLPercentage.toFixed(2)}% | ` +
        `Umbral: ${takeProfitThreshold}% | ` +
        `Precio actual: ${context.currentPrice} | ` +
        `Precio TP: ${takeProfitPrice.toFixed(2)}`,
      );

      return {
        action: 'CLOSE_TP',
        reason: this.buildTakeProfitReason(currentPnLPercentage, takeProfitThreshold),
        metadata: {
          riskData: {
            takeProfitPrice: takeProfitPrice,
          },
        },
      };
    }

    // =====================================================================
    // 3. TRAILING STOP
    // =====================================================================
    const trailingPercentage = tradingSettings.trailingStopPercent || tradingSettings.stopLossPercent;
    const maxPrice = position.maxPriceSinceEntry;
    const trailingStopPrice = maxPrice * (1 - trailingPercentage / 100);
    const dropFromMaxPercentage = ((maxPrice - context.currentPrice) / maxPrice) * 100;

    // El trailing stop se activa cuando el precio cae X% desde el máximo
    if (context.currentPrice <= trailingStopPrice) {
      this.logger.warn(
        `📉 TRAILING STOP activado | Símbolo: ${context.symbol} | ` +
        `Caída desde máximo: ${dropFromMaxPercentage.toFixed(2)}% | ` +
        `Precio máximo: ${maxPrice.toFixed(2)} | ` +
        `Precio actual: ${context.currentPrice} | ` +
        `Precio trailing: ${trailingStopPrice.toFixed(2)} | ` +
        `P/L al cerrar: ${currentPnLPercentage.toFixed(2)}%`,
      );

      return {
        action: 'CLOSE_TRAILING',
        reason: this.buildTrailingStopReason(
          dropFromMaxPercentage,
          trailingPercentage,
          maxPrice,
          currentPnLPercentage,
        ),
        metadata: {
          riskData: {
            trailingStopPrice: trailingStopPrice,
          },
        },
      };
    }

    // =====================================================================
    // 4. BREAKEVEN STOP (OPCIONAL - AVANZADO)
    // =====================================================================
    if (tradingSettings.breakevenThreshold && currentPnLPercentage >= tradingSettings.breakevenThreshold) {
      // Esta lógica es informativa por ahora
      // En Paper/Live Trading, aquí moverías realmente el SL al precio de entrada
      this.logger.debug(
        `✅ Breakeven alcanzado | Símbolo: ${context.symbol} | ` +
        `P/L: ${currentPnLPercentage.toFixed(2)}% >= ${tradingSettings.breakevenThreshold}% | ` +
        `En modo Live, el SL se movería a ${position.entryPrice}`,
      );
    }

    // No hay riesgo que gestionar en este momento
    return {
      action: 'HOLD',
      reason: 'Gestión de riesgo OK, posición dentro de parámetros',
    };
  }

  /**
   * Calcula los precios de SL/TP para una nueva posición
   * Útil para mostrar información al usuario antes de abrir
   */
  calculateRiskPrices(
    entryPrice: number,
    settings: any,
  ): RiskData {
    const riskData: RiskData = {};

    if (settings.enableStopLoss) {
      const stopLossPercentage = -Math.abs(settings.defaultStopLossPercentage);
      riskData.stopLossPrice = entryPrice * (1 + stopLossPercentage / 100);
    }

    if (settings.enableTakeProfit) {
      const takeProfitPercentage = Math.abs(settings.defaultTakeProfitPercentage);
      riskData.takeProfitPrice = entryPrice * (1 + takeProfitPercentage / 100);
    }

    // Calcular ratio riesgo/recompensa
    if (riskData.stopLossPrice && riskData.takeProfitPrice) {
      const risk = Math.abs(entryPrice - riskData.stopLossPrice);
      const reward = Math.abs(riskData.takeProfitPrice - entryPrice);
      riskData.riskRewardRatio = reward / risk;
    }

    return riskData;
  }

  /**
   * Valida que la configuración de riesgo sea coherente
   */
  validateRiskSettings(settings: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar que los porcentajes sean positivos
    if (settings.enableStopLoss && settings.defaultStopLossPercentage <= 0) {
      errors.push('El porcentaje de Stop Loss debe ser mayor a 0');
    }

    if (settings.enableTakeProfit && settings.defaultTakeProfitPercentage <= 0) {
      errors.push('El porcentaje de Take Profit debe ser mayor a 0');
    }

    // Validar que TP sea mayor que SL (ratio riesgo/recompensa mínimo de 1:1)
    if (settings.enableStopLoss && settings.enableTakeProfit) {
      if (settings.defaultTakeProfitPercentage <= settings.defaultStopLossPercentage) {
        errors.push(
          'El Take Profit debe ser mayor que el Stop Loss (ratio riesgo/recompensa < 1:1)',
        );
      }
    }

    // Validar breakeven threshold
    if (settings.breakevenThreshold) {
      if (settings.breakevenThreshold <= 0) {
        errors.push('El umbral de breakeven debe ser mayor a 0');
      }
      if (settings.enableTakeProfit &&
        settings.breakevenThreshold >= settings.defaultTakeProfitPercentage) {
        errors.push('El umbral de breakeven debe ser menor que el Take Profit');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ========================================================================
  // PRIVATE HELPER METHODS - Construcción de mensajes
  // ========================================================================

  private buildStopLossReason(currentPnL: number, threshold: number): string {
    return (
      `Stop Loss activado: P/L actual ${currentPnL.toFixed(2)}% alcanzó el umbral de ${threshold}%. ` +
      `Cerrando posición para limitar pérdidas.`
    );
  }

  private buildTakeProfitReason(currentPnL: number, threshold: number): string {
    return (
      `Take Profit activado: P/L actual ${currentPnL.toFixed(2)}% alcanzó el objetivo de ${threshold}%. ` +
      `Asegurando ganancias.`
    );
  }

  private buildTrailingStopReason(
    dropFromMax: number,
    trailingPercentage: number,
    maxPrice: number,
    finalPnL: number,
  ): string {
    return (
      `Trailing Stop activado: El precio cayó ${dropFromMax.toFixed(2)}% desde el máximo de ${maxPrice.toFixed(2)}. ` +
      `Cerrando posición con P/L final de ${finalPnL.toFixed(2)}%.`
    );
  }
}
