import { Injectable, Logger } from '@nestjs/common';
import { IntervalType, TradeSignal, IndicatorSettings } from '@nemesis/commons';
import { BinanceService } from '../binance/binance.service';
import { AnalysisService } from './analysis.service';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);

  constructor(
    private readonly binanceService: BinanceService,
    private readonly analysisService: AnalysisService
  ) {}

  async analyzeSymbol(
    symbol: string,
    interval: IntervalType = '15m',
    limit: number = 100,
    indicatorSettings?: IndicatorSettings // 🆕 NUEVO PARÁMETRO
  ): Promise<TradeSignal> {
    this.logger.log(`Analyzing ${symbol} on ${interval} interval`);

    // 1. Obtener klines
    const klines = await this.binanceService.getKlines(symbol, interval, limit);

    // 2. Obtener precio actual
    const marketData = await this.binanceService.getMarketPrice(symbol);

    // 3. Calcular indicadores técnicos con configuración personalizada
    const analysis = this.analysisService.analyzeTechnicals(
      klines,
      symbol,
      interval,
      indicatorSettings // 🆕 Pasar configuración
    );

    // 4. Generar señal de trading
    return this.analysisService.generateSignal(
      analysis,
      marketData.price,
      indicatorSettings // 🆕 Pasar configuración para documentar
    );
  }

  async getMultipleSignals(
    symbols: string[],
    interval: IntervalType = '15m',
    indicatorSettings?: IndicatorSettings // 🆕 NUEVO PARÁMETRO
  ): Promise<TradeSignal[]> {
    return await Promise.all(
      symbols.map((symbol) =>
        this.analyzeSymbol(symbol, interval, 100, indicatorSettings)
      )
    );
  }
}
