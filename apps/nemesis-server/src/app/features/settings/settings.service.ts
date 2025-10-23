import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  IndicatorSettings,
  TrendDetectionSettings,
  TradingSettings,
  DEFAULT_BOT_CONFIGURATION, BotSettings,
} from '@nemesis/commons';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);
  private readonly CACHE_KEY = 'bot:settings';
  private readonly CACHE_TTL = 86400; // 24 horas

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Se ejecuta al iniciar el módulo
   */
  async onModuleInit() {
    await this.initializeConfiguration();
  }

  /**
   * Inicializa la configuración al arrancar el servidor
   */
  private async initializeConfiguration(): Promise<void> {
    this.logger.log('🔄 Inicializando configuración del bot...');

    try {
      // 1. Intentar cargar desde Redis
      const cachedConfig = await this.redis.get(this.CACHE_KEY);

      if (cachedConfig) {
        this.logger.log('✅ Configuración cargada desde Redis (cache)');
        return;
      }

      // 2. Si no está en Redis, cargar desde BD
      let dbConfig = await this.prisma.botConfig.findFirst({
        orderBy: { updatedAt: 'desc' },
      });

      // 3. Si no existe en BD, crear configuración por defecto
      if (!dbConfig) {
        this.logger.log('📝 No existe configuración, creando por defecto...');
        dbConfig = await this.createDefaultConfiguration();
      }

      // 4. Guardar en Redis para futuras consultas
      const config = this.mapDbToConfig(dbConfig);
      await this.saveToCache(config);

      this.logger.log('✅ Configuración inicializada correctamente');
      this.logger.log(`📊 RSI: ${config.indicators.rsi?.period}, MACD: ${config.indicators.macd?.fastPeriod}/${config.indicators.macd?.slowPeriod}/${config.indicators.macd?.signalPeriod}`);
    } catch (error) {
      this.logger.error('❌ Error inicializando configuración:', error);
      // En caso de error, usar defaults en memoria
      await this.saveToCache(DEFAULT_BOT_CONFIGURATION);
    }
  }

  /**
   * Crea la configuración por defecto en BD
   */
  private async createDefaultConfiguration(): Promise<any> {
    const defaults = DEFAULT_BOT_CONFIGURATION;

    return this.prisma.botConfig.create({
      data: {
        version: defaults.version,
        // Indicadores
        rsiPeriod: defaults.indicators.rsi!.period,
        macdFastPeriod: defaults.indicators.macd!.fastPeriod,
        macdSlowPeriod: defaults.indicators.macd!.slowPeriod,
        macdSignalPeriod: defaults.indicators.macd!.signalPeriod,
        smaPeriod: defaults.indicators.sma!.period,
        emaPeriod: defaults.indicators.ema!.period,
        // Detección de tendencias
        adxPeriod: defaults.trendDetection.adxPeriod!,
        adxThreshold: defaults.trendDetection.adxThreshold!,
        ema20Period: defaults.trendDetection.ema20Period!,
        ema50Period: defaults.trendDetection.ema50Period!,
        ema200Period: defaults.trendDetection.ema200Period!,
        lookbackPeriod: defaults.trendDetection.lookbackPeriod!,
        // Trading
        defaultStopLoss: defaults.trading.defaultStopLossPercentage!,
        defaultTakeProfit: defaults.trading.defaultTakeProfitPercentage!,
        useTrailingStop: defaults.trading.defaultUseTrailingStop!,
        commissionRate: defaults.trading.defaultCommissionRate!,
        enableTrendFilter: defaults.trading.enableTrendFilter!,
        minConfidenceBuy: defaults.trading.minConfidenceToBuy!,
        minConfidenceSell: defaults.trading.minConfidenceToSell!,
      },
    });
  }

  /**
   * Mapea registro de BD a BotConfiguration
   */
  private mapDbToConfig(dbConfig: any): BotSettings {
    return {
      indicators: {
        rsi: { period: dbConfig.rsiPeriod },
        macd: {
          fastPeriod: dbConfig.macdFastPeriod,
          slowPeriod: dbConfig.macdSlowPeriod,
          signalPeriod: dbConfig.macdSignalPeriod,
        },
        sma: { period: dbConfig.smaPeriod },
        ema: { period: dbConfig.emaPeriod },
      },
      trendDetection: {
        adxPeriod: dbConfig.adxPeriod,
        adxThreshold: dbConfig.adxThreshold,
        ema20Period: dbConfig.ema20Period,
        ema50Period: dbConfig.ema50Period,
        ema200Period: dbConfig.ema200Period,
        lookbackPeriod: dbConfig.lookbackPeriod,
      },
      trading: {
        defaultStopLossPercentage: dbConfig.defaultStopLoss,
        defaultTakeProfitPercentage: dbConfig.defaultTakeProfit,
        defaultUseTrailingStop: dbConfig.useTrailingStop,
        defaultCommissionRate: dbConfig.commissionRate,
        enableTrendFilter: dbConfig.enableTrendFilter,
        minConfidenceToBuy: dbConfig.minConfidenceBuy,
        minConfidenceToSell: dbConfig.minConfidenceSell,
      },
      lastUpdated: dbConfig.updatedAt,
      version: dbConfig.version,
    };
  }

  /**
   * Guarda configuración en Redis
   */
  private async saveToCache(config: BotSettings): Promise<void> {
    await this.redis.set(
      this.CACHE_KEY,
      JSON.stringify(config),
      this.CACHE_TTL
    );
  }

  /**
   * Obtiene la configuración actual desde Redis
   */
  async getConfiguration(): Promise<BotSettings> {
    const cached = await this.redis.get(this.CACHE_KEY);

    if (!cached) {
      // Si por alguna razón no está en cache, reinicializar
      await this.initializeConfiguration();
      const reloaded = await this.redis.get(this.CACHE_KEY);
      return JSON.parse(reloaded!);
    }

    return JSON.parse(cached);
  }

  async getIndicatorSettings(): Promise<IndicatorSettings> {
    const config = await this.getConfiguration();
    return config.indicators;
  }

  async getTrendDetectionSettings(): Promise<TrendDetectionSettings> {
    const config = await this.getConfiguration();
    return config.trendDetection;
  }

  async getTradingSettings(): Promise<TradingSettings> {
    const config = await this.getConfiguration();
    return config.trading;
  }

  /**
   * Actualiza configuración de indicadores
   */
  async updateIndicatorSettings(settings: Partial<IndicatorSettings>): Promise<BotSettings> {
    await this.prisma.botConfig.updateMany({
      data: {
        rsiPeriod: settings.rsi?.period,
        macdFastPeriod: settings.macd?.fastPeriod,
        macdSlowPeriod: settings.macd?.slowPeriod,
        macdSignalPeriod: settings.macd?.signalPeriod,
        smaPeriod: settings.sma?.period,
        emaPeriod: settings.ema?.period,
        updatedAt: new Date(),
      },
    });

    const newConfig = await this.reloadConfiguration();
    this.logger.log('📝 Configuración de indicadores actualizada');
    return newConfig;
  }

  /**
   * Actualiza configuración de detección de tendencias
   */
  async updateTrendDetectionSettings(settings: Partial<TrendDetectionSettings>): Promise<BotSettings> {
    await this.prisma.botConfig.updateMany({
      data: {
        adxPeriod: settings.adxPeriod,
        adxThreshold: settings.adxThreshold,
        ema20Period: settings.ema20Period,
        ema50Period: settings.ema50Period,
        ema200Period: settings.ema200Period,
        lookbackPeriod: settings.lookbackPeriod,
        updatedAt: new Date(),
      },
    });

    const newConfig = await this.reloadConfiguration();
    this.logger.log('📝 Configuración de detección de tendencias actualizada');
    return newConfig;
  }

  /**
   * Actualiza configuración de trading
   */
  async updateTradingSettings(settings: Partial<TradingSettings>): Promise<BotSettings> {
    await this.prisma.botConfig.updateMany({
      data: {
        defaultStopLoss: settings.defaultStopLossPercentage,
        defaultTakeProfit: settings.defaultTakeProfitPercentage,
        useTrailingStop: settings.defaultUseTrailingStop,
        commissionRate: settings.defaultCommissionRate,
        enableTrendFilter: settings.enableTrendFilter,
        minConfidenceBuy: settings.minConfidenceToBuy,
        minConfidenceSell: settings.minConfidenceToSell,
        updatedAt: new Date(),
      },
    });

    const newConfig = await this.reloadConfiguration();
    this.logger.log('📝 Configuración de trading actualizada');
    return newConfig;
  }

  /**
   * Resetea a configuración por defecto
   */
  async resetToDefaults(): Promise<BotSettings> {
    await this.prisma.botConfig.deleteMany({});
    await this.redis.del(this.CACHE_KEY);
    await this.initializeConfiguration();

    this.logger.warn('⚠️  Configuración reseteada a valores por defecto');
    return await this.getConfiguration();
  }

  /**
   * Recarga configuración desde BD y actualiza cache
   */
  private async reloadConfiguration(): Promise<BotSettings> {
    const dbConfig = await this.prisma.botConfig.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    const config = this.mapDbToConfig(dbConfig);
    await this.saveToCache(config);

    return config;
  }
}
