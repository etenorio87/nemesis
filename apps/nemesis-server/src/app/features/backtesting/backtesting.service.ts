import {Injectable, Logger} from '@nestjs/common';
import {BinanceService} from '../binance/binance.service';
import {AnalysisService} from '../strategy/analysis.service';
import {BacktestConfig, BacktestResult, BacktestTrade, Kline,} from '@nemesis/commons';

@Injectable()
export class BacktestingService {
  private readonly logger = new Logger(BacktestingService.name);

  constructor(
    private readonly binanceService: BinanceService,
    private readonly analysisService: AnalysisService
  ) {}

  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    this.logger.log(
      `Starting backtest for ${config.symbol} on ${config.interval}`
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
      `Backtest completed: P/L: ${result.profitLossPercentage.toFixed(2)}%, Win Rate: ${result.winRate.toFixed(2)}%`
    );

    return result;
  }

  private simulateTrading(
    klines: Kline[],
    config: BacktestConfig
  ): BacktestResult {
    let balance = config.initialBalance;
    let position: 'LONG' | 'SHORT' | null = null;
    let entryPrice = 0;
    let positionSize = 0;

    const trades: BacktestTrade[] = [];
    const equity: number[] = [balance];
    const commissionRate = config.commissionRate || 0.001; // 0.1% por defecto

    let winningTrades = 0;
    let losingTrades = 0;

    // Necesitamos al menos 26 velas para MACD (26 es el periodo lento)
    for (let i = 50; i < klines.length; i++) {
      // Tomar ventana de datos hasta el punto actual
      const historicalData = klines.slice(0, i + 1);
      const currentKline = klines[i];

      // Analizar técnicamente
      const analysis = this.analysisService.analyzeTechnicals(
        historicalData,
        config.symbol,
        config.interval
      );

      // Generar señal
      const signal = this.analysisService.generateSignal(
        analysis,
        currentKline.close
      );

      // Simular trading
      if (position === null) {
        // No hay posición abierta
        if (signal.signal === 'BUY' && signal.confidence >= 60) {
          // Abrir posición LONG
          position = 'LONG';
          entryPrice = currentKline.close;

          // Usar el 95% del balance (dejar 5% como margen)
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
        // Tenemos posición LONG abierta
        const shouldClose =
          signal.signal === 'SELL' && signal.confidence >= 50;

        if (shouldClose) {
          // Cerrar posición
          const exitPrice = currentKline.close;
          const saleAmount = positionSize * exitPrice;
          const commission = saleAmount * commissionRate;
          balance += saleAmount - commission;

          const profitLoss = saleAmount - commission - positionSize * entryPrice;

          if (profitLoss > 0) {
            winningTrades++;
          } else {
            losingTrades++;
          }

          trades.push({
            type: 'SELL',
            price: exitPrice,
            timestamp: new Date(currentKline.closeTime),
            reason: signal.reason,
          });

          this.logger.debug(
            `SELL at ${exitPrice} (${signal.confidence}%) - P/L: ${profitLoss.toFixed(2)} - ${signal.reason}`
          );

          position = null;
          positionSize = 0;
          entryPrice = 0;
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
      balance += saleAmount - commission;

      const profitLoss = saleAmount - commission - positionSize * entryPrice;
      if (profitLoss > 0) {
        winningTrades++;
      } else {
        losingTrades++;
      }

      trades.push({
        type: 'SELL',
        price: exitPrice,
        timestamp: new Date(lastKline.closeTime),
        reason: 'Cierre final del backtest',
      });
    }

    const finalBalance = balance;
    const profitLoss = finalBalance - config.initialBalance;
    const profitLossPercentage = (profitLoss / config.initialBalance) * 100;
    const winRate =
      trades.length > 0
        ? (winningTrades / (winningTrades + losingTrades)) * 100
        : 0;

    // Calcular max drawdown
    const maxDrawdown = this.calculateMaxDrawdown(equity);

    return {
      symbol: config.symbol,
      interval: config.interval,
      startDate: new Date(klines[0].openTime),
      endDate: new Date(klines[klines.length - 1].closeTime),
      initialBalance: config.initialBalance,
      finalBalance,
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      profitLoss,
      profitLossPercentage,
      winRate,
      trades,
      equity,
      maxDrawdown,
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

  /**
   * Ejecutar backtest en múltiples símbolos
   */
  async runMultipleBacktests(
    symbols: string[],
    config: Omit<BacktestConfig, 'symbol'>
  ): Promise<BacktestResult[]> {
    return await Promise.all(
      symbols.map((symbol) =>
        this.runBacktest({ ...config, symbol })
      )
    );
  }
}
