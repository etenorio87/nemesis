import {BotSettings, MarketTrend, TradeSignal} from './strategy';
import {ExecutedActionType, OrderSideType, PositionSideType, TradingActionType} from '../types';

/**
 * Posición abierta en el mercado
 */
export interface Position {
  symbol: string;                    // Ej: "BTCUSDT"
  side: PositionSideType;            // Por ahora solo LONG
  entryPrice: number;                // Precio de entrada
  quantity: number;                  // Cantidad de activo (ej: 0.5 BTC)
  entryTime: Date;                   // Momento de apertura
  unrealizedPnL: number;             // P/L no realizado (en USDT)
  unrealizedPnLPercentage: number;   // P/L no realizado (%)
  maxPriceSinceEntry: number;        // Máximo precio alcanzado (para trailing stop)
  minPriceSinceEntry?: number;       // Mínimo precio alcanzado (futuro: para SHORT)
}

/**
 * Contexto unificado de trading
 * Representa el estado actual en cualquier modo (Backtest/Paper/Live)
 */
export interface BotContext {
  symbol: string;                    // Símbolo actual (ej: "BTCUSDT")
  timestamp: Date;                   // Timestamp actual
  currentPrice: number;              // Precio actual del mercado
  position: Position | null;         // Posición actual (null si no hay)
  balance: number;                   // Balance disponible en USDT
  equity: number;                    // Balance + valor de posición abierta
  settings: BotSettings;             // Configuración de trading
}

/**
 * Decisión de trading (output del TradingEngine)
 */
export interface TradingDecision {
  action: TradingActionType;         // Acción a ejecutar
  reason: string;                    // Explicación de la decisión
  confidence?: number;               // Nivel de confianza (0-100)
  metadata?: TradingDecisionMetadata;
}


/**
 * Metadata adicional de la decisión
 */
export interface TradingDecisionMetadata {
  signal?: TradeSignal;              // Señal técnica que generó la decisión
  marketTrend?: MarketTrend;         // Tendencia del mercado
  riskData?: RiskData;               // Datos de gestión de riesgo
}

/**
 * Datos de gestión de riesgo
 */
export interface RiskData {
  stopLossPrice?: number;            // Precio de stop loss
  takeProfitPrice?: number;          // Precio de take profit
  trailingStopPrice?: number;        // Precio actual del trailing stop
  positionSize?: number;             // Tamaño calculado de la posición
  riskRewardRatio?: number;          // Ratio riesgo/recompensa
}

/**
 * Resultado de ejecución (output del Adapter)
 */
export interface ExecutionResult {
  success: boolean;                   // ¿Se ejecutó correctamente?
  executedAction: ExecutedActionType; // Acción ejecutada
  executedPrice?: number;             // Precio de ejecución
  executedQuantity?: number;          // Cantidad ejecutada
  newBalance: number;                 // Nuevo balance
  newPosition: Position | null;       // Nueva posición (null si se cerró)
  newEquity: number;                  // Nuevo equity
  fees?: number;                      // Comisiones pagadas
  orderId?: string;                   // ID de orden (solo live trading)
  error?: string;                     // Mensaje de error (si failed)
  timestamp: Date;                    // Timestamp de ejecución
}

// ============================================================================
// ESTADÍSTICAS Y MÉTRICAS
// ============================================================================

/**
 * Estadísticas de trading
 * Usadas para reportes y análisis de rendimiento
 */
export interface TradingStats {
  totalTrades: number;               // Total de trades ejecutados
  winningTrades: number;             // Trades ganadores
  losingTrades: number;              // Trades perdedores
  winRate: number;                   // % de trades ganadores
  totalPnL: number;                  // P/L total (USDT)
  totalPnLPercentage: number;        // P/L total (%)
  averageWin: number;                // Ganancia promedio por trade ganador
  averageLoss: number;               // Pérdida promedio por trade perdedor
  profitFactor: number;              // Total ganancias / Total pérdidas
  maxDrawdown: number;               // Máxima caída desde pico (%)
  sharpeRatio?: number;              // Ratio de Sharpe
  stopLossTriggered: number;         // Veces que se activó SL
  takeProfitTriggered: number;       // Veces que se activó TP
  trailingStopTriggered: number;     // Veces que se activó trailing
}

/**
 * Trade ejecutado (para historial)
 */
export interface ExecutedTrade {
  id?: string;                       // ID único del trade
  symbol: string;                    // Símbolo
  type: OrderSideType;               // Tipo de trade
  price: number;                     // Precio de ejecución
  quantity: number;                  // Cantidad ejecutada
  timestamp: Date;                   // Momento de ejecución
  reason: string;                    // Razón de la ejecución
  exitReason?: string;               // Razón de salida (para SELL)
  profitLoss?: number;               // P/L del trade (solo SELL)
  profitLossPercentage?: number;     // P/L % (solo SELL)
  fees?: number;                     // Comisiones
  orderId?: string;                  // ID de orden (live trading)
}

