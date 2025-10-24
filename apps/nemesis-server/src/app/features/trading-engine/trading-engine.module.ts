/**
 * Trading Engine Module
 * Módulo que encapsula toda la lógica de trading reutilizable
 *
 * EXPORTS:
 * - TradingEngineService: Orquestador principal
 * - RiskManagerService: Gestión de riesgo
 * - BacktestAdapter: Adaptador para backtesting
 *
 * IMPORTS necesarios:
 * - StrategyModule: Para AnalysisService y TrendAnalysisService
 */

import { Module } from '@nestjs/common';
import { TradingEngineService } from './services/trading-engine.service';
import { RiskManagerService } from './services/risk-manager.service';
import { AnalysisService } from '../strategy/analysis.service';
import { TrendAnalysisService } from '../strategy/trend-analysis.service';

@Module({
  providers: [
    // Core Services
    TradingEngineService,
    RiskManagerService,

    // Strategy Services (si no están en un módulo separado)
    AnalysisService,
    TrendAnalysisService,

    // Adapters
    // Nota: BacktestAdapter no se registra aquí porque se instancia manualmente
    // en el BacktestingService con el contexto inicial
  ],
  exports: [
    TradingEngineService,
    RiskManagerService,
    AnalysisService,
    TrendAnalysisService,
  ],
})
export class TradingEngineModule {}
