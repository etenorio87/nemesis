import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { UpdateIndicatorSettingsDto } from './dto/update-indicator-settings.dto';
import { UpdateTrendSettingsDto } from './dto/update-trend-settings.dto';
import { UpdateTradingSettingsDto } from './dto/update-trading-settings.dto';
import {SettingsService} from './settings.service';

@Controller('config')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /**
   * GET /config
   * Obtiene la configuración completa actual
   */
  @Get()
  async getConfiguration() {
    return await this.settings.getConfiguration();
  }

  /**
   * GET /config/indicators
   * Obtiene solo la configuración de indicadores
   */
  @Get('indicators')
  async getIndicatorSettings() {
    return await this.settings.getIndicatorSettings();
  }

  /**
   * GET /config/trend-detection
   * Obtiene solo la configuración de detección de tendencias
   */
  @Get('trend-detection')
  async getTrendDetectionSettings() {
    return await this.settings.getTrendDetectionSettings();
  }

  /**
   * GET /config/trading
   * Obtiene solo la configuración de trading
   */
  @Get('trading')
  async getTradingSettings() {
    return await this.settings.getTradingSettings();
  }

  /**
   * PUT /config/indicators
   * Actualiza la configuración de indicadores
   */
  @Put('indicators')
  async updateIndicatorSettings(@Body() dto: UpdateIndicatorSettingsDto) {
    return await this.settings.updateIndicatorSettings(dto);
  }

  /**
   * PUT /config/trend-detection
   * Actualiza la configuración de detección de tendencias
   */
  @Put('trend-detection')
  async updateTrendDetectionSettings(@Body() dto: UpdateTrendSettingsDto) {
    return await this.settings.updateTrendDetectionSettings(dto);
  }

  /**
   * PUT /config/trading
   * Actualiza la configuración de trading general
   */
  @Put('trading')
  async updateTradingSettings(@Body() dto: UpdateTradingSettingsDto) {
    return await this.settings.updateTradingSettings(dto);
  }

  /**
   * POST /config/reset
   * Resetea toda la configuración a valores por defecto
   */
  @Post('reset')
  async resetConfiguration() {
    return await this.settings.resetToDefaults();
  }
}
