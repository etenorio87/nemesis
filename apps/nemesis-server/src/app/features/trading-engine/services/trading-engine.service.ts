/**
 * Trading Engine Service
 * Orquestador principal del sistema de trading
 * Coordina: Análisis → Decisión → Ejecución
 *
 * RESPONSABILIDADES:
 * 1. Analizar el mercado (indicadores + tendencias)
 * 2. Evaluar gestión de riesgo (SL/TP/Trailing)
 * 3. Generar decisiones de trading
 * 4. Delegar ejecución al adapter apropiado
 *
 * REUTILIZABLE en: Backtesting, Paper Trading, Live Trading
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  TradingDecision,
  ExecutionResult,
  Kline,
  MarketTrend,
  TradeSignal, BotContext,
} from '@nemesis/commons';
import { AnalysisService } from '../../strategy/analysis.service';
import { TrendAnalysisService } from '../../strategy/trend-analysis.service';
import { RiskManagerService } from './risk-manager.service';
import {IExecutionAdapter} from '../adapters/base.adapter';

@Injectable()
export class TradingEngineService {
  private readonly logger = new Logger(TradingEngineService.name);

  constructor(
    private readonly analysisService: AnalysisService,
    private readonly trendAnalysisService: TrendAnalysisService,
    private readonly riskManager: RiskManagerService,
  ) {
    this.logger.log('TradingEngine inicializado ✅');
  }

  /**
   * MÉTODO PRINCIPAL: Procesa datos de mercado y toma decisiones
   *
   * FLUJO:
   * 1. Obtener contexto actual del adapter
   * 2. Actualizar precio actual
   * 3. PRIORIDAD: Evaluar gestión de riesgo (SL/TP)
   * 4. SECUNDARIO: Analizar mercado y generar señales
   * 5. Convertir señal en decisión
   * 6. Ejecutar decisión a través del adapter
   *
   * @param symbol - Símbolo del par de trading
   * @param klines - Historial de velas (incluye la actual)
   * @param adapter - Adaptador de ejecución (Backtest/Paper/Live)
   * @returns Resultado de la ejecución
   */
  async processMarketData(
    symbol: string,
    klines: Kline[],
    adapter: IExecutionAdapter,
  ): Promise<ExecutionResult> {

    const currentKline = klines[klines.length - 1];

    try {
      // 1. Obtener contexto actual
      const context = await adapter.getContext(symbol);

      // 2. Actualizar precio actual
      await adapter.updatePrice(symbol, currentKline.close, new Date(currentKline.closeTime));

      // 3. Obtener contexto actualizado después del updatePrice
      const updatedContext = await adapter.getContext(symbol);

      // 4. PRIORIDAD: Evaluar gestión de riesgo
      const riskDecision = this.riskManager.evaluateRiskManagement(updatedContext);

      if (riskDecision.action !== 'HOLD') {
        this.logger.log(
          `[${symbol}] 🛡️ Decisión de RIESGO: ${riskDecision.action} - ${riskDecision.reason}`,
        );
        return await adapter.execute(updatedContext, riskDecision);
      }

      // 5. SECUNDARIO: Analizar mercado y generar señales
      const marketDecision = await this.analyzeMarketAndDecide(
        klines,
        updatedContext,
      );

      if (marketDecision.action !== 'HOLD') {
        this.logger.log(
          `[${symbol}] 📊 Decisión de MERCADO: ${marketDecision.action} - ${marketDecision.reason}`,
        );
      }

      // 6. Ejecutar decisión
      return await adapter.execute(updatedContext, marketDecision);

    } catch (error) {
      this.logger.error(
        `Error procesando datos de mercado para ${symbol}: ${error.message}`,
        error.stack,
      );

      // Retornar resultado de error sin ejecutar nada
      const context = await adapter.getContext(symbol);
      return {
        success: false,
        executedAction: 'HOLD',
        newBalance: context.balance,
        newPosition: context.position,
        newEquity: context.equity,
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * Analiza el mercado y genera una decisión de trading
   *
   * @param klines - Historial de velas
   * @param context - Contexto actual
   * @returns Decisión de trading
   */
  private async analyzeMarketAndDecide(
    klines: Kline[],
    context: BotContext,
  ): Promise<TradingDecision> {

    // 1. Detectar tendencia del mercado
    const marketTrend: MarketTrend = this.trendAnalysisService.detectTrend(
      klines,
      context.settings.trendDetection,
    );

    // 2. Generar señal técnica basada en la estrategia recomendada
    const signal: TradeSignal = this.analysisService.generateSignals(
      context.symbol,
      klines,
      context.settings.indicators,
      marketTrend.recommendedStrategy,
    );

    // 3. Convertir señal a decisión (aplicando validaciones)
    return this.convertSignalToDecision(signal, marketTrend, context);
  }

  /**
   * Convierte una señal técnica en una decisión de trading
   * Aplica validaciones de negocio:
   * - No comprar si ya hay posición
   * - No vender si no hay posición
   * - Validar confianza mínima
   *
   * @param signal - Señal técnica generada
   * @param marketTrend - Tendencia del mercado
   * @param context - Contexto actual
   * @returns Decisión validada
   */
  private convertSignalToDecision(
    signal: TradeSignal,
    marketTrend: MarketTrend,
    context: BotContext,
  ): TradingDecision {

    // =====================================================================
    // VALIDACIÓN 1: No comprar si ya hay posición
    // =====================================================================
    if (signal.signal === 'BUY' && context.position) {
      return {
        action: 'HOLD',
        reason: 'Señal de compra ignorada: ya existe una posición abierta',
        confidence: signal.confidence,
        metadata: {
          signal,
          marketTrend,
        },
      };
    }

    // =====================================================================
    // VALIDACIÓN 2: No vender si no hay posición
    // =====================================================================
    if (signal.signal === 'SELL' && !context.position) {
      return {
        action: 'HOLD',
        reason: 'Señal de venta ignorada: no hay posición para cerrar',
        confidence: signal.confidence,
        metadata: {
          signal,
          marketTrend,
        },
      };
    }

    // =====================================================================
    // VALIDACIÓN 3: Confianza mínima para COMPRA
    // =====================================================================
    if (signal.signal === 'BUY') {
      const minConfidence = context.settings.trading.minConfidenceToBuy;

      if (signal.confidence < minConfidence) {
        return {
          action: 'HOLD',
          reason: `Confianza insuficiente para compra: ${signal.confidence.toFixed(0)}% < ${minConfidence}%`,
          confidence: signal.confidence,
          metadata: {
            signal,
            marketTrend,
          },
        };
      }
    }

    // =====================================================================
    // VALIDACIÓN 4: Confianza mínima para VENTA
    // =====================================================================
    if (signal.signal === 'SELL') {
      const minConfidence = context.settings.trading.minConfidenceToSell;

      if (signal.confidence < minConfidence) {
        return {
          action: 'HOLD',
          reason: `Confianza insuficiente para venta: ${signal.confidence.toFixed(0)}% < ${minConfidence}%`,
          confidence: signal.confidence,
          metadata: {
            signal,
            marketTrend,
          },
        };
      }
    }

    // =====================================================================
    // VALIDACIÓN 5: Señal HOLD del análisis
    // =====================================================================
    if (signal.signal === 'HOLD') {
      return {
        action: 'HOLD',
        reason: signal.reason,
        confidence: signal.confidence,
        metadata: {
          signal,
          marketTrend,
        },
      };
    }

    // =====================================================================
    // SEÑAL VÁLIDA: Convertir a acción
    // =====================================================================
    const action = signal.signal === 'BUY' ? 'BUY' : 'SELL';

    // Enriquecer razón con información de tendencia
    const enrichedReason = this.enrichReasonWithTrend(signal.reason, marketTrend);

    return {
      action,
      reason: enrichedReason,
      confidence: signal.confidence,
      metadata: {
        signal,
        marketTrend,
        riskData: action === 'BUY'
          ? this.riskManager.calculateRiskPrices(context.currentPrice, context.settings)
          : undefined,
      },
    };
  }

  /**
   * Enriquece la razón de la señal con información de tendencia
   */
  private enrichReasonWithTrend(reason: string, marketTrend: MarketTrend): string {
    return `${reason} | Tendencia: ${marketTrend.type} (${marketTrend.strength.toFixed(0)}%)`;
  }

  /**
   * Valida la configuración antes de comenzar trading
   * Útil para evitar errores en Paper/Live Trading
   */
  validateConfiguration(settings: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar gestión de riesgo
    const riskValidation = this.riskManager.validateRiskSettings(settings);
    if (!riskValidation.valid) {
      errors.push(...riskValidation.errors);
    }

    // Validar umbrales de confianza
    if (settings.minConfidenceToBuy < 0 || settings.minConfidenceToBuy > 100) {
      errors.push('minConfidenceToBuy debe estar entre 0 y 100');
    }
    if (settings.minConfidenceToSell < 0 || settings.minConfidenceToSell > 100) {
      errors.push('minConfidenceToSell debe estar entre 0 y 100');
    }

    // Validar tamaño de posición
    if (settings.maxPositionSize <= 0 || settings.maxPositionSize > 1) {
      errors.push('maxPositionSize debe estar entre 0 y 1 (0% a 100%)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
