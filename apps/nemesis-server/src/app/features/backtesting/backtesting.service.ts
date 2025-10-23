import {Injectable, Logger} from '@nestjs/common';
import {
  BacktestConfig,
  BacktestResult,
  BacktestTrade,
  Kline, SignalEnum,
} from '@nemesis/commons';
import {BinanceService} from '../binance/binance.service';
import {AnalysisService} from '../strategy/analysis.service';
import {SettingsService} from '../settings/settings.service';

@Injectable()
export class BacktestingService {
  private readonly logger = new Logger(BacktestingService.name);

  constructor(
    private readonly binance: BinanceService,
    private readonly analysis: AnalysisService,
    private readonly settings: SettingsService
  ) {
  }

  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    const indicatorSettings = await this.settings.getIndicatorSettings();
    const tradingSettings = await this.settings.getTradingSettings();

    this.logger.log(
      `Starting backtest for ${config.symbol} on ${config.interval} with SL: ${tradingSettings.defaultStopLossPercentage}%, TP: ${tradingSettings.defaultTakeProfitPercentage}%`
    );

    // 1. Obtener datos históricos
    const klines = await this.binance.getKlines(
      config.symbol,
      config.interval,
      config.limit || 500
    );

    if (klines.length < 50) {
      throw new Error('Not enough data for backtesting (minimum 50 candles)');
    }

    // 2. Ejecutar backtest con configuración global
    const result = this.simulateTrading(klines, config, indicatorSettings, tradingSettings);

    this.logger.log(
      `Backtest completed: P/L: ${result.profitLossPercentage.toFixed(2)}%, Win Rate: ${result.winRate.toFixed(2)}%, SL Triggered: ${result.stopLossTriggered}, TP Triggered: ${result.takeProfitTriggered}`
    );

    return result;
  }

  private simulateTrading(
    klines: Kline[],
    config: BacktestConfig,
    indicatorSettings: any, // 🆕 NUEVO PARÁMETRO
    tradingSettings: any,   // 🆕 NUEVO PARÁMETRO
  ): BacktestResult {
    let balance = config.initialBalance;
    let position: 'LONG' | null = null;
    let entryPrice = 0;
    let positionSize = 0;
    let highestPriceInPosition = 0;

    const trades: BacktestTrade[] = [];
    const equity: number[] = [balance];

    // 🆕 Usar config global si no se especifica en el request
    const commissionRate = tradingSettings.defaultCommissionRate;
    const stopLossPercentage = tradingSettings.defaultStopLossPercentage;
    const takeProfitPercentage = tradingSettings.defaultTakeProfitPercentage;
    const useTrailingStop = tradingSettings.defaultUseTrailingStop;

    let winningTrades = 0;
    let losingTrades = 0;
    let stopLossTriggered = 0;
    let takeProfitTriggered = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;

    for (let i = 50; i < klines.length; i++) {
      const historicalData = klines.slice(0, i + 1);
      const currentKline = klines[i];

      // 🆕 Analizar técnicamente CON configuración global
      const analysis = this.analysis.analyzeTechnicals(
        historicalData,
        config.symbol,
        config.interval,
        indicatorSettings // 🆕 Usar config global
      );

      const signal = this.analysis.generateSignal(
        analysis,
        currentKline.close,
        indicatorSettings // 🆕 Usar config global
      );

      if (position === null) {
        // 🆕 Usar umbral de confianza de la config global
        if (signal.signal === SignalEnum.BUY && signal.confidence >= tradingSettings.minConfidenceToBuy) {
          position = 'LONG';
          entryPrice = currentKline.close;
          highestPriceInPosition = entryPrice;

          const investAmount = balance * 0.95;
          const commission = investAmount * commissionRate;
          positionSize = (investAmount - commission) / entryPrice;
          balance -= investAmount;

          trades.push({
            type: SignalEnum.BUY,
            price: entryPrice,
            timestamp: new Date(currentKline.closeTime),
            reason: signal.reason,
          });

          this.logger.debug(
            `BUY at ${entryPrice} (${signal.confidence}%) - ${signal.reason}`
          );
        }
      } else if (position === 'LONG') {
        const currentPrice = currentKline.close;

        if (currentPrice > highestPriceInPosition) {
          highestPriceInPosition = currentPrice;
        }

        let shouldClose = false;
        let closeReason = '';

        // 1. Verificar Stop-Loss
        if (stopLossPercentage) {
          let stopLossPrice: number;

          if (useTrailingStop) {
            stopLossPrice =
              highestPriceInPosition * (1 - stopLossPercentage / 100);
          } else {
            stopLossPrice = entryPrice * (1 - stopLossPercentage / 100);
          }

          if (currentPrice <= stopLossPrice) {
            shouldClose = true;
            closeReason = `Stop-Loss activado (${useTrailingStop ? 'Trailing' : 'Fijo'})`;
            stopLossTriggered++;
          }
        }

        // 2. Verificar Take-Profit
        if (!shouldClose && takeProfitPercentage) {
          const takeProfitPrice =
            entryPrice * (1 + takeProfitPercentage / 100);

          if (currentPrice >= takeProfitPrice) {
            shouldClose = true;
            closeReason = 'Take-Profit alcanzado';
            takeProfitTriggered++;
          }
        }

        // 3. Verificar señal de SELL
        // 🆕 Usar umbral de confianza de la config global
        if (!shouldClose && signal.signal === SignalEnum.SELL && signal.confidence >= tradingSettings.minConfidenceToSell) {
          shouldClose = true;
          closeReason = signal.reason;
        }

        if (shouldClose) {
          const sellValue = positionSize * currentPrice;
          const commission = sellValue * commissionRate;
          const netProceeds = sellValue - commission;

          balance += netProceeds;
          const profitLoss = netProceeds - (config.initialBalance - balance);
          const profitLossPercentage = (profitLoss / entryPrice) * 100;

          if (profitLoss > 0) {
            winningTrades++;
            totalWinAmount += profitLoss;
          } else {
            losingTrades++;
            totalLossAmount += Math.abs(profitLoss);
          }

          trades.push({
            type: SignalEnum.SELL,
            price: currentPrice,
            timestamp: new Date(currentKline.closeTime),
            reason: closeReason,
            profitLoss,
            profitLossPercentage,
          });

          this.logger.debug(
            `SELL at ${currentPrice} - ${closeReason} - P/L: ${profitLossPercentage.toFixed(2)}%`
          );

          position = null;
          positionSize = 0;
          entryPrice = 0;
          highestPriceInPosition = 0;
        }
      }

      const currentEquity =
        position === 'LONG'
          ? balance + positionSize * currentKline.close
          : balance;

      equity.push(currentEquity);
    }

    // Cerrar posición abierta al final si existe
    if (position === 'LONG') {
      const finalPrice = klines[klines.length - 1].close;
      const sellValue = positionSize * finalPrice;
      const commission = sellValue * commissionRate;
      const netProceeds = sellValue - commission;

      balance += netProceeds;
      const profitLoss = netProceeds - (config.initialBalance - balance);
      const profitLossPercentage = (profitLoss / entryPrice) * 100;

      if (profitLoss > 0) {
        winningTrades++;
        totalWinAmount += profitLoss;
      } else {
        losingTrades++;
        totalLossAmount += Math.abs(profitLoss);
      }

      trades.push({
        type: SignalEnum.SELL,
        price: finalPrice,
        timestamp: new Date(klines[klines.length - 1].closeTime),
        reason: 'Cierre forzado al final del backtest',
        profitLoss,
        profitLossPercentage,
      });
      position = null;
    }

    const finalBalance = balance;
    const profitLoss = finalBalance - config.initialBalance;
    const profitLossPercentage =
      (profitLoss / config.initialBalance) * 100;

    const totalTradePairs = Math.floor(trades.length / 2);
    const winRate = totalTradePairs > 0
      ? (winningTrades / totalTradePairs) * 100
      : 0;

    const averageWin = winningTrades > 0 ? totalWinAmount / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? totalLossAmount / losingTrades : 0;
    const profitFactor =
      totalLossAmount > 0
        ? totalWinAmount / totalLossAmount
        : totalWinAmount > 0
          ? Infinity
          : 0;
    const maxDrawdown = this.calculateMaxDrawdown(equity);

    return {
      symbol: config.symbol,
      interval: config.interval,
      startDate: new Date(klines[0].openTime),
      endDate: new Date(klines[klines.length - 1].closeTime),
      initialBalance: config.initialBalance,
      finalBalance,
      totalOperations: trades.length,
      completedTrades: totalTradePairs,
      winningTrades,
      losingTrades,
      profitLoss,
      profitLossPercentage,
      winRate,
      trades,
      equity,
      maxDrawdown,
      averageWin,
      averageLoss,
      profitFactor,
      stopLossTriggered,
      takeProfitTriggered,
      indicatorSettings, // 🆕 Documentar config usada
    };
  }

  private calculateMaxDrawdown(equity: number[]): number {
    let maxDrawdown = 0;
    let peak = equity[0];

    for (const value of equity) {
      if (value > peak) {
        peak = value;
      }
      const drawdown = ((peak - value) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

}
