import {ExecutionResult, BotContext, TradingDecision} from '@nemesis/commons';

/**
 * Interfaz que deben implementar todos los adaptadores de ejecución
 * (Backtest, Paper, Live)
 *
 * Los adaptadores son el puente entre la lógica de decisión (TradingEngine)
 * y el entorno de ejecución (simulado, paper, o real)
 */
export interface IExecutionAdapter {
  /**
   * Ejecuta una decisión de trading en el entorno correspondiente
   * @param context - Estado actual del trading
   * @param decision - Decisión tomada por el TradingEngine
   * @returns Resultado de la ejecución
   */
  execute(
    context: BotContext,
    decision: TradingDecision,
  ): Promise<ExecutionResult>;

  /**
   * Obtiene el contexto actual de trading
   * Útil para inicialización y recuperación de estado
   * @param symbol - Símbolo del par de trading
   * @returns Contexto actual
   */
  getContext(symbol: string): Promise<BotContext>;

  /**
   * Actualiza el precio actual en el contexto
   * Necesario para calcular P/L no realizado y equity
   * @param symbol - Símbolo del par
   * @param price - Nuevo precio
   * @param timestamp - Timestamp del precio
   */
  updatePrice(symbol: string, price: number, timestamp: Date): Promise<void>;

  /**
   * Inicializa o reinicia el contexto de trading
   * @param context - Contexto inicial
   */
  initialize(context: BotContext): Promise<void>;

  /**
   * Limpia recursos (conexiones, timers, etc)
   */
  cleanup?(): Promise<void>;
}
