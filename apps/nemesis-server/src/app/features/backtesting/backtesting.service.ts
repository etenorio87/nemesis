import {Injectable, Logger} from '@nestjs/common';
import {BacktestConfig, BacktestResult, BacktestTrade, Kline,} from '@nemesis/commons';
import {BinanceService} from '../binance/binance.service';
import {AnalysisService} from '../strategy/analysis.service';

@Injectable()
export class BacktestingService {
  private readonly logger = new Logger(BacktestingService.name);

  constructor(
    private readonly binanceService: BinanceService,
    private readonly analysisService: AnalysisService
  ) {}

  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    this.logger.log(
      `Starting backtest for ${config.symbol} on ${config.interval} with SL: ${config.stopLossPercentage || 'N/A'}%, TP: ${config.takeProfitPercentage || 'N/A'}%`
    );

    // 1. Obtener datos históricos
    const klines = await this.binanceService.getKlines(
      config.symbol,
      config.interval,
      config.limit || 500
    );

    if (klines.length < 50) {
      throw new Error('Not enough data for backtesting (minimum 50 candles)');
    }

    // 2. Ejecutar backtest
    const result = this.simulateTrading(klines, config);

    this.logger.log(
      `Backtest completed: P/L: ${result.profitLossPercentage.toFixed(2)}%, Win Rate: ${result.winRate.toFixed(2)}%, SL Triggered: ${result.stopLossTriggered}, TP Triggered: ${result.takeProfitTriggered}`
    );

    return result;
  }

  private simulateTrading(
    klines: Kline[],
    config: BacktestConfig
  ): BacktestResult {
    let balance = config.initialBalance;
    let position: 'LONG' | null = null;
    let entryPrice = 0;
    let positionSize = 0;
    let highestPriceInPosition = 0; // Para trailing stop

    const trades: BacktestTrade[] = [];
    const equity: number[] = [balance];
    const commissionRate = config.commissionRate || 0.001;

    let winningTrades = 0;
    let losingTrades = 0;
    let stopLossTriggered = 0;
    let takeProfitTriggered = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;

    // Configuración de SL/TP
    const stopLossPercentage = config.stopLossPercentage || null;
    const takeProfitPercentage = config.takeProfitPercentage || null;
    const useTrailingStop = config.useTrailingStop || false;

    for (let i = 50; i < klines.length; i++) {
      const historicalData = klines.slice(0, i + 1);
      const currentKline = klines[i];

      // Analizar técnicamente
      const analysis = this.analysisService.analyzeTechnicals(
        historicalData,
        config.symbol,
        config.interval
      );

      const signal = this.analysisService.generateSignal(
        analysis,
        currentKline.close
      );

      if (position === null) {
        // No hay posición abierta - buscar entrada
        if (signal.signal === 'BUY' && signal.confidence >= 60) {
          position = 'LONG';
          entryPrice = currentKline.close;
          highestPriceInPosition = entryPrice;

          const investAmount = balance * 0.95;
          const commission = investAmount * commissionRate;
          positionSize = (investAmount - commission) / entryPrice;
          balance -= investAmount;

          trades.push({
            type: 'BUY',
            price: entryPrice,
            timestamp: new Date(currentKline.closeTime),
            reason: signal.reason,
          });

          this.logger.debug(
            `BUY at ${entryPrice} (${signal.confidence}%) - ${signal.reason}`
          );
        }
      } else if (position === 'LONG') {
        // Tenemos posición LONG abierta - verificar salidas
        const currentPrice = currentKline.close;
        const priceChangePercent =
          ((currentPrice - entryPrice) / entryPrice) * 100;

        // Actualizar highest price para trailing stop
        if (currentPrice > highestPriceInPosition) {
          highestPriceInPosition = currentPrice;
        }

        let shouldClose = false;
        let closeReason = '';

        // 1. Verificar Stop Loss
        if (stopLossPercentage !== null) {
          let stopLossPrice: number;

          if (useTrailingStop) {
            // Trailing Stop: se mueve con el precio
            stopLossPrice =
              highestPriceInPosition * (1 - stopLossPercentage / 100);
          } else {
            // Stop Loss fijo desde entrada
            stopLossPrice = entryPrice * (1 - stopLossPercentage / 100);
          }

          if (currentPrice <= stopLossPrice) {
            shouldClose = true;
            closeReason = useTrailingStop
              ? `Trailing Stop Loss activado (-${stopLossPercentage}% desde máximo)`
              : `Stop Loss activado (-${stopLossPercentage}%)`;
            stopLossTriggered++;
          }
        }

        // 2. Verificar Take Profit
        if (!shouldClose && takeProfitPercentage !== null) {
          const takeProfitPrice =
            entryPrice * (1 + takeProfitPercentage / 100);

          if (currentPrice >= takeProfitPrice) {
            shouldClose = true;
            closeReason = `Take Profit activado (+${takeProfitPercentage}%)`;
            takeProfitTriggered++;
          }
        }

        // 3. Verificar señal de venta del análisis técnico
        if (!shouldClose && signal.signal === 'SELL' && signal.confidence >= 50) {
          shouldClose = true;
          closeReason = `Señal técnica: ${signal.reason}`;
        }

        // Ejecutar cierre de posición
        if (shouldClose) {
          const exitPrice = currentPrice;
          const saleAmount = positionSize * exitPrice;
          const commission = saleAmount * commissionRate;
          const netSaleAmount = saleAmount - commission;
          balance += netSaleAmount;

          const profitLoss = netSaleAmount - positionSize * entryPrice;
          const profitLossPercentage = priceChangePercent;

          if (profitLoss > 0) {
            winningTrades++;
            totalWinAmount += profitLoss;
          } else {
            losingTrades++;
            totalLossAmount += Math.abs(profitLoss);
          }

          trades.push({
            type: 'SELL',
            price: exitPrice,
            timestamp: new Date(currentKline.closeTime),
            reason: closeReason,
            profitLoss,
            profitLossPercentage,
          });

          this.logger.debug(
            `SELL at ${exitPrice} - P/L: ${profitLoss.toFixed(2)} (${profitLossPercentage.toFixed(2)}%) - ${closeReason}`
          );

          position = null;
          positionSize = 0;
          entryPrice = 0;
          highestPriceInPosition = 0;
        }
      }

      // Calcular equity actual
      let currentEquity = balance;
      if (position === 'LONG') {
        currentEquity += positionSize * currentKline.close;
      }
      equity.push(currentEquity);
    }

    // Cerrar posición si queda abierta al final
    if (position === 'LONG') {
      const lastKline = klines[klines.length - 1];
      const exitPrice = lastKline.close;
      const saleAmount = positionSize * exitPrice;
      const commission = saleAmount * commissionRate;
      const netSaleAmount = saleAmount - commission;
      balance += netSaleAmount;

      const profitLoss = netSaleAmount - positionSize * entryPrice;
      const profitLossPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;

      if (profitLoss > 0) {
        winningTrades++;
        totalWinAmount += profitLoss;
      } else {
        losingTrades++;
        totalLossAmount += Math.abs(profitLoss);
      }

      trades.push({
        type: 'SELL',
        price: exitPrice,
        timestamp: new Date(lastKline.closeTime),
        reason: 'Cierre final del backtest',
        profitLoss,
        profitLossPercentage,
      });
    }

    const finalBalance = balance;
    const profitLoss = finalBalance - config.initialBalance;
    const profitLossPercentage = (profitLoss / config.initialBalance) * 100;
    const totalTradePairs = winningTrades + losingTrades;
    const winRate = totalTradePairs > 0 ? (winningTrades / totalTradePairs) * 100 : 0;

    // Calcular métricas adicionales
    const averageWin = winningTrades > 0 ? totalWinAmount / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? totalLossAmount / losingTrades : 0;
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;
    const maxDrawdown = this.calculateMaxDrawdown(equity);

    return {
      symbol: config.symbol,
      interval: config.interval,
      startDate: new Date(klines[0].openTime),
      endDate: new Date(klines[klines.length - 1].closeTime),
      initialBalance: config.initialBalance,
      finalBalance,
      totalOperations: trades.length, // Renombrado para claridad
      completedTrades: totalTradePairs, // Nuevo: pares completos
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

  async runMultipleBacktests(
    symbols: string[],
    config: Omit<BacktestConfig, 'symbol'>
  ): Promise<BacktestResult[]> {
    return await Promise.all(
      symbols.map((symbol) =>
        this.runBacktest({
          ...config,
          symbol,
        })
      )
    );
  }
}
