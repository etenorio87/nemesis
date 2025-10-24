import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  BacktestResult,
  BacktestTrade,
  BacktestConfig, ExecutedTrade, BotContext,
} from '@nemesis/commons';
import { BinanceService } from '../binance/binance.service';
import { SettingsService } from '../settings/settings.service';
import {TradingEngineService} from '../trading-engine/services/trading-engine.service';
import {BacktestAdapter} from '../trading-engine/adapters/backtest.adapter';

@Injectable()
export class BacktestingService {
  private readonly logger = new Logger(BacktestingService.name);

  constructor(
    private readonly binanceService: BinanceService,
    private readonly settingsService: SettingsService,
    private readonly engine: TradingEngineService,
  ) {}

  /**
   * Ejecuta un backtest completo
   * SIMPLIFICADO: Ahora solo itera y delega al TradingEngine
   */
  public async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    // --- 1. Obtención de Datos y Configuración ---
    this.logger.log(`Iniciando backtest para ${config.symbol} (${config.interval})...`);

    const klines = await this.binanceService.getKlines(
      config.symbol,
      config.interval,
      config.limit,
      config.startDate,
      config.endDate,
    );

    if (klines.length === 0) {
      throw new BadRequestException('No se obtuvieron datos de mercado');
    }

    // Obtener configuración global
    const settings = await this.settingsService.getAll();
    // Validar configuración
    const validation = this.engine.validateConfiguration(settings);
    if (!validation.valid) {
      throw new BadRequestException(
        `Configuración inválida: ${validation.errors.join(', ')}`,
      );
    }

    // =====================================================================
    // 2. CREAR CONTEXTO INICIAL
    // =====================================================================
    const initialContext: BotContext = {
      symbol: config.symbol,
      timestamp: new Date(klines[0].closeTime),
      currentPrice: klines[0].close,
      position: null,
      balance: config.initialBalance,
      equity: config.initialBalance,
      settings: settings,
    };

    // =====================================================================
    // 3. CREAR ADAPTADOR DE BACKTESTING
    // =====================================================================
    const adapter = new BacktestAdapter(initialContext);

    // =====================================================================
    // 4. CALCULAR ÍNDICE DE INICIO (warm-up period)
    // =====================================================================
    const startIndex = Math.max(
      settings.indicators.rsi.period,
      settings.trendDetection.ema200Period,
      settings.trendDetection.adxPeriod * 2,
    );

    if (klines.length <= startIndex) {
      throw new BadRequestException(
        `Datos insuficientes. Se requieren al menos ${startIndex} velas, pero solo hay ${klines.length}`,
      );
    }

    this.logger.log(
      `📊 Datos cargados: ${klines.length} velas | Inicio en índice: ${startIndex}`,
    );

    // =====================================================================
    // 5. ITERACIÓN SOBRE VELAS (SIMPLIFICADO)
    // =====================================================================
    const trades: ExecutedTrade[] = [];
    const equityCurve: Array<{ timestamp: number; equity: number }> = [];

    // Contadores para estadísticas
    const stats = {
      bullishPeriods: 0,
      bearishPeriods: 0,
      sidewaysPeriods: 0,
      tradesInBullish: 0,
      tradesInBearish: 0,
      tradesInSideways: 0,
      stopLossTriggered: 0,
      takeProfitTriggered: 0,
      trailingStopTriggered: 0,
    };

    for (let i = startIndex; i < klines.length; i++) {
      const currentKlines = klines.slice(0, i + 1);

      // 🎯 TODA LA LÓGICA DELEGADA AL TRADING ENGINE
      const result = await this.engine.processMarketData(config.symbol, currentKlines, adapter);

      // Registrar trades ejecutados
      if (result.executedAction === 'BUY') {
        trades.push({
          symbol: config.symbol,
          type: 'BUY',
          price: result.executedPrice!,
          quantity: result.executedQuantity!,
          timestamp: result.timestamp,
          reason: result.error || 'Señal de compra',
          fees: result.fees,
        });
      } else if (result.executedAction === 'SELL') {
        // Calcular P/L del trade
        const buyTrade = this.findMatchingBuyTrade(trades);
        const profitLoss = buyTrade
          ? (result.executedPrice! - buyTrade.price) * result.executedQuantity!
          : 0;
        const profitLossPercentage = buyTrade
          ? ((result.executedPrice! - buyTrade.price) / buyTrade.price) * 100
          : 0;

        // Determinar razón de salida
        let exitReason = 'Señal de venta';
        if (result.error?.includes('STOP LOSS')) {
          exitReason = 'Stop Loss';
          stats.stopLossTriggered++;
        } else if (result.error?.includes('TAKE PROFIT')) {
          exitReason = 'Take Profit';
          stats.takeProfitTriggered++;
        } else if (result.error?.includes('TRAILING')) {
          exitReason = 'Trailing Stop';
          stats.trailingStopTriggered++;
        }

        trades.push({
          symbol: config.symbol,
          type: 'SELL',
          price: result.executedPrice!,
          quantity: result.executedQuantity!,
          timestamp: result.timestamp,
          reason: exitReason,
          exitReason: exitReason,
          profitLoss: profitLoss,
          profitLossPercentage: profitLossPercentage,
          fees: result.fees,
        });
      }

      // Registrar equity curve
      const context = await adapter.getContext(config.symbol);
      equityCurve.push({
        timestamp: klines[i].closeTime,
        equity: context.equity,
      });

      // Actualizar estadísticas de tendencia (opcional, si quieres trackear)
      // Aquí podrías agregar lógica para contar períodos por tendencia
    }

    this.logger.log(`✅ Backtest completado: ${trades.length} operaciones`);

    // =====================================================================
    // 6. CALCULAR MÉTRICAS FINALES
    // =====================================================================
    return this.calculateMetrics(config, trades, equityCurve, stats, settings);
  }

  /**
   * Calcula todas las métricas del backtest
   */
  private calculateMetrics(
    config: BacktestConfig,
    trades: ExecutedTrade[],
    equityCurve: Array<{ timestamp: number; equity: number }>,
    stats: any,
    settings: any,
  ): BacktestResult {

    // Balance final
    const finalEquity = equityCurve[equityCurve.length - 1]?.equity || config.initialBalance;

    // Métricas de trades
    const buyTrades = trades.filter(t => t.type === 'BUY');
    const sellTrades = trades.filter(t => t.type === 'SELL');
    const completedTrades = sellTrades.length;

    const winningTrades = sellTrades.filter(t => t.profitLoss! > 0).length;
    const losingTrades = completedTrades - winningTrades;
    const winRate = completedTrades > 0 ? (winningTrades / completedTrades) * 100 : 0;

    // P/L
    const totalPnL = finalEquity - config.initialBalance;
    const totalPnLPercentage = (totalPnL / config.initialBalance) * 100;

    // Métricas avanzadas
    const wins = sellTrades.filter(t => t.profitLoss! > 0).map(t => t.profitLoss!);
    const losses = sellTrades.filter(t => t.profitLoss! <= 0).map(t => Math.abs(t.profitLoss!));

    const averageWin = wins.length > 0
      ? wins.reduce((a, b) => a + b, 0) / wins.length
      : 0;
    const averageLoss = losses.length > 0
      ? losses.reduce((a, b) => a + b, 0) / losses.length
      : 0;

    const totalWins = wins.reduce((a, b) => a + b, 0);
    const totalLosses = losses.reduce((a, b) => a + b, 0);
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    // Max Drawdown
    const maxDrawdown = this.calculateMaxDrawdown(equityCurve.map(e => e.equity));

    // Convertir trades para el resultado
    const backTestTrades: BacktestTrade[] = trades.map(t => ({
      type: t.type === 'BUY' ? 'BUY' : 'SELL',
      price: t.price,
      timestamp: t.timestamp,
      reason: t.reason,
      profitLoss: t.profitLoss,
      profitLossPercentage: t.profitLossPercentage,
    }));

    return {
      symbol: config.symbol,
      interval: config.interval,
      startDate: new Date(equityCurve[0]?.timestamp || Date.now()),
      endDate: new Date(equityCurve[equityCurve.length - 1]?.timestamp || Date.now()),
      initialBalance: config.initialBalance,
      finalBalance: finalEquity,
      totalOperations: trades.length,
      completedTrades: completedTrades,
      winningTrades: winningTrades,
      losingTrades: losingTrades,
      profitLoss: totalPnL,
      profitLossPercentage: totalPnLPercentage,
      winRate: winRate,
      trades: backTestTrades,
      equity: equityCurve.map(e => e.equity),
      maxDrawdown: maxDrawdown,
      averageWin: averageWin,
      averageLoss: averageLoss,
      profitFactor: profitFactor,
      stopLossTriggered: stats.stopLossTriggered,
      takeProfitTriggered: stats.takeProfitTriggered,
      indicatorSettings: settings.indicatorSettings,
      trendAnalysis: {
        bullishPeriods: stats.bullishPeriods,
        bearishPeriods: stats.bearishPeriods,
        sidewaysPeriods: stats.sidewaysPeriods,
        tradesInBullish: stats.tradesInBullish,
        tradesInBearish: stats.tradesInBearish,
        tradesInSideways: stats.tradesInSideways,
      },
    };
  }

  /**
   * 🆕 HELPER: Calcula el Max Drawdown
   * (La mayor caída porcentual desde un pico de equity)
   */
  private calculateMaxDrawdown(equity: number[]): number {
    if (equity.length === 0) return 0;

    let maxEquity = equity[0];
    let maxDrawdown = 0;

    for (let i = 1; i < equity.length; i++) {
      if (equity[i] > maxEquity) {
        maxEquity = equity[i];
      } else {
        // Calcular el drawdown actual
        const drawdown = ((maxEquity - equity[i]) / maxEquity) * 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }
    return maxDrawdown;
  }


  /**
   * Encuentra el trade de compra correspondiente a una venta
   */
  private findMatchingBuyTrade(trades: ExecutedTrade[]): ExecutedTrade | undefined {
    // Buscar el último BUY sin SELL correspondiente
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].type === 'BUY') {
        // Verificar si ya tiene un SELL asociado
        const hasSell = trades
          .slice(i + 1)
          .some(t => t.type === 'SELL');

        if (!hasSell) {
          return trades[i];
        }
      }
    }
    return undefined;
  }
}
