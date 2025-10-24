import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  BacktestResult,
  Kline,
  MarketTrend,
  BacktestTrade,  // 1. Usar BacktestTrade
  TradeSignal,    // 2. Usar TradeSignal
  TradingSettings,
  BacktestConfig, SignalEnum, MarketTrendEnum, // Importar
} from '@nemesis/commons';
import { BinanceService } from '../binance/binance.service';
import { AnalysisService } from '../strategy/analysis.service';
import { SettingsService } from '../settings/settings.service';
import { TrendAnalysisService } from '../strategy/trend-analysis.service';

@Injectable()
export class BacktestingService {
  private readonly logger = new Logger(BacktestingService.name);

  constructor(
    private readonly binanceService: BinanceService,
    private readonly settingsService: SettingsService,
    private readonly analysisService: AnalysisService,
    private readonly trendAnalysisService: TrendAnalysisService,
  ) {}

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

    const [indicatorSettings, trendSettings, tradingSettings] = await Promise.all([
      this.settingsService.getIndicatorSettings(),
      this.settingsService.getTrendDetectionSettings(),
      this.settingsService.getTradingSettings(),
    ]);

    // --- 2. Inicialización de Estado ---
    let balance = config.initialBalance;
    let position = 0; // Cantidad de activo (ej. 1 BTC)
    let entryPrice = 0; // Precio de la última compra
    const trades: BacktestTrade[] = []; // 3. Usar BacktestTrade[]
    const equityCurve = [];

    // 2b. 🆕 INICIALIZAR ESTADÍSTICAS DE TENDENCIA
    const stats = {
      bullishPeriods: 0,
      bearishPeriods: 0,
      sidewaysPeriods: 0,
      tradesInBullish: 0,
      tradesInBearish: 0, // Debería ser 0
      tradesInSideways: 0,
    };

    // --- 3. Calcular StartIndex (Corregido) ---
    const startIndex = Math.max(
      indicatorSettings.rsi.period, // 4. Corregido (sin Stochastic)
      trendSettings.ema200Period,
      trendSettings.adxPeriod * 2,
    );

    if (klines.length <= startIndex) {
      throw new BadRequestException(
        `Datos de Klines insuficientes (${klines.length}) para el período de calentamiento requerido (${startIndex}).`,
      );
    }

    this.logger.log(`Klines cargados: ${klines.length}. Iniciando simulación en índice: ${startIndex}`);

    // --- 4. Bucle Principal de Simulación ---
    for (let i = startIndex; i < klines.length; i++) {
      const currentKlines = klines.slice(0, i + 1);
      const currentKline = klines[i];
      const tradesBefore = trades.length; // 3. Contar trades antes

      // 4a. DETECTAR RÉGIMEN DE MERCADO
      const marketTrend: MarketTrend = this.trendAnalysisService.detectTrend(
        currentKlines,
        trendSettings,
      );

      // 4b. Generar Señal
      const signal = this.analysisService.generateSignals( // 6. Llamar al nuevo método
        config.symbol,
        currentKlines,
        indicatorSettings,
        marketTrend.recommendedStrategy, // Pasamos la estrategia
      );

      // 4c. SIMULAR TRADES
      const simulationResult = this.simulateTrades(
        signal, // 7. Pasar la señal singular
        currentKline,
        position,
        balance,
        entryPrice, // Pasamos el estado actual
        tradingSettings,
        trades,
      );

      const tradeExecuted = trades.length > tradesBefore; // 4. Comprobar si se ejecutó
      position = simulationResult.position;
      balance = simulationResult.balance;
      entryPrice = simulationResult.entryPrice;

      // 4d. 🆕 ACTUALIZAR ESTADÍSTICAS DE TENDENCIA
      switch (marketTrend.type) {
        case MarketTrendEnum.BULLISH:
          stats.bullishPeriods++;
          if (tradeExecuted) stats.tradesInBullish++;
          break;
        case MarketTrendEnum.BEARISH:
          stats.bearishPeriods++;
          if (tradeExecuted) stats.tradesInBearish++; // Validar que esto sea 0
          break;
        case MarketTrendEnum.SIDEWAYS:
          stats.sidewaysPeriods++;
          if (tradeExecuted) stats.tradesInSideways++;
          break;
      }

      // 4e. Actualizar Curva de Equity (sin cambios)
      const currentPnl =
        position > 0 ? (currentKline.close - entryPrice) * position : 0;
      equityCurve.push({
        timestamp: currentKline.closeTime,
        equity: balance + currentPnl,
      });
    } // --- Fin del Bucle ---

    this.logger.log(`Backtest completado. Trades realizados: ${trades.length}`);

    // --- 5. 🆕 CÁLCULO DE MÉTRICAS Y RETORNO (IMPLEMENTADO) ---
    // 5a. Liquidar posición abierta si existe (para P/L final)
    let finalBalance = balance;
    if (position > 0) {
      const lastPrice = klines[klines.length - 1].close;
      finalBalance += position * lastPrice;
    }

    // 5b. Métricas de Trades
    const completedTrades = trades.filter((t) => t.type === 'SELL');
    const winningTrades = completedTrades.filter(
      (t) => t.profitLoss > 0,
    ).length;
    const losingTrades = completedTrades.length - winningTrades;
    const winRate =
      completedTrades.length > 0
        ? (winningTrades / completedTrades.length) * 100
        : 0;

    // 5c. Métricas de P/L
    const totalPnl = finalBalance - config.initialBalance;
    const totalPnlPercentage =
      (totalPnl / config.initialBalance) * 100;

    // 5d. Métricas de Equity y Drawdown
    const equityValues = equityCurve.map((e) => e.equity);
    const maxDrawdown = this.calculateMaxDrawdown(equityValues);

    // 5e. Construir el objeto de retorno COMPLETO
    return {
      symbol: config.symbol,
      interval: config.interval,
      startDate: new Date(config.startDate),
      endDate: new Date(config.endDate),
      initialBalance: config.initialBalance,
      finalBalance: finalBalance,
      totalOperations: trades.length,
      completedTrades: completedTrades.length,
      winningTrades: winningTrades,
      losingTrades: losingTrades,
      profitLoss: totalPnl,
      profitLossPercentage: totalPnlPercentage,
      winRate: winRate,
      trades: trades,
      equity: equityValues,
      maxDrawdown: maxDrawdown,
      indicatorSettings: indicatorSettings, // Devolver la config usada
      trendAnalysis: stats, // El objeto que ya funciona
    };
  }

  /**
   * Lógica de simulación de trades (Ajustada)
   * Ahora usa BacktestTrade y TradeSignal
   */
  private simulateTrades(
    signal: TradeSignal, // Recibe una sola señal
    kline: Kline,
    position: number,
    balance: number,
    entryPrice: number,
    settings: TradingSettings,
    trades: BacktestTrade[], // Usa el tipo correcto
  ): { position: number; balance: number; entryPrice: number } {
    const currentPrice = kline.close;
    const orderAmountPercentage = 1;

    // Lógica de Compra
    if (signal.signal === SignalEnum.BUY && position === 0) {
      const positionSize = (balance * orderAmountPercentage) / currentPrice;
      const cost = positionSize * currentPrice;

      position = positionSize;
      balance -= cost;
      entryPrice = currentPrice;

      trades.push({
        type: SignalEnum.BUY,
        price: currentPrice, // 8. Usar 'price'
        timestamp: new Date(kline.closeTime),
        reason: signal.reason,
      });
    }
    // Lógica de Venta
    else if (signal.signal === SignalEnum.SELL && position > 0) {
      const revenue = position * currentPrice;
      const profitLoss = (currentPrice - entryPrice) * position;
      const profitLossPercentage = ((currentPrice - entryPrice) / entryPrice) * 100;

      balance += revenue;
      position = 0;
      entryPrice = 0;

      trades.push({
        type: SignalEnum.SELL,
        price: currentPrice, // 9. Usar 'price'
        timestamp: new Date(kline.closeTime),
        reason: signal.reason,
        profitLoss: profitLoss,
        profitLossPercentage: profitLossPercentage,
      });
    }

    return { position, balance, entryPrice };
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
}
