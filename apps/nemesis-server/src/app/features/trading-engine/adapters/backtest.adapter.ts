import {Injectable, Logger} from '@nestjs/common';
import {BotContext, ExecutionResult, Position, TradingDecision,} from '@nemesis/commons';
import {IExecutionAdapter} from './base.adapter';

@Injectable()
export class BacktestAdapter implements IExecutionAdapter {
  private readonly logger = new Logger(BacktestAdapter.name);
  private context: BotContext;

  /**
   * Constructor
   * @param initialContext - Contexto inicial del backtesting
   */
  constructor(initialContext: BotContext) {
    this.context = { ...initialContext };
    this.logger.log(`BacktestAdapter inicializado para ${initialContext.symbol}`);
  }

  /**
   * Inicializa el adaptador con un nuevo contexto
   */
  async initialize(context: BotContext): Promise<void> {
    this.context = { ...context };
    this.logger.log(`Contexto reinicializado: ${context.symbol}`);
  }

  /**
   * Obtiene el contexto actual
   */
  async getContext(symbol: string): Promise<BotContext> {
    if (this.context.symbol !== symbol) {
      throw new Error(
        `Símbolo no coincide. Esperado: ${this.context.symbol}, Recibido: ${symbol}`,
      );
    }
    return { ...this.context };
  }

  /**
   * Actualiza el precio actual y recalcula métricas
   */
  async updatePrice(symbol: string, price: number, timestamp: Date): Promise<void> {
    if (this.context.symbol !== symbol) {
      throw new Error(
        `Símbolo no coincide. Esperado: ${this.context.symbol}, Recibido: ${symbol}`,
      );
    }

    this.context.currentPrice = price;
    this.context.timestamp = timestamp;

    // Actualizar P/L no realizado y equity si hay posición abierta
    if (this.context.position) {
      this.updatePositionMetrics(this.context.position, price);
      this.context.equity = this.context.balance + this.context.position.quantity * price;
    } else {
      this.context.equity = this.context.balance;
    }
  }

  /**
   * Ejecuta una decisión de trading
   */
  async execute(
    context: BotContext,
    decision: TradingDecision,
  ): Promise<ExecutionResult> {

    // Asegurar que estamos trabajando con el contexto actualizado
    this.context = { ...context };

    const result: ExecutionResult = {
      success: false,
      executedAction: 'HOLD',
      newBalance: context.balance,
      newPosition: context.position,
      newEquity: context.equity,
      timestamp: context.timestamp,
    };

    try {
      switch (decision.action) {
        case 'BUY':
          return await this.executeBuy(decision);

        case 'SELL':
        case 'CLOSE_SL':
        case 'CLOSE_TP':
        case 'CLOSE_TRAILING':
          return await this.executeSell(decision);

        case 'HOLD':
        default:
          return result;
      }
    } catch (error) {
      this.logger.error(`Error ejecutando ${decision.action}: ${error.message}`);
      return {
        ...result,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Ejecuta una compra (apertura de posición LONG)
   */
  private async executeBuy(decision: TradingDecision): Promise<ExecutionResult> {

    // Validar que no hay posición abierta
    if (this.context.position) {
      return {
        success: false,
        executedAction: 'HOLD',
        newBalance: this.context.balance,
        newPosition: this.context.position,
        newEquity: this.context.equity,
        timestamp: this.context.timestamp,
        error: 'Ya existe una posición abierta',
      };
    }

    // Validar que hay balance suficiente
    if (this.context.balance <= 0) {
      return {
        success: false,
        executedAction: 'HOLD',
        newBalance: this.context.balance,
        newPosition: null,
        newEquity: this.context.equity,
        timestamp: this.context.timestamp,
        error: 'Balance insuficiente',
      };
    }

    // Calcular tamaño de posición (95% del balance por defecto)
    const positionSizePercentage = this.context.settings.trading.maxPositionSize || 0.95;
    const amountToInvest = this.context.balance * positionSizePercentage;
    const quantity = amountToInvest / this.context.currentPrice;

    // Calcular comisión
    const commissionRate = this.context.settings.trading.commissionRate || 0.001;
    const commission = amountToInvest * commissionRate;
    const totalCost = amountToInvest + commission;

    // Crear nueva posición
    const newPosition: Position = {
      symbol: this.context.symbol,
      side: 'LONG',
      entryPrice: this.context.currentPrice,
      quantity: quantity,
      entryTime: this.context.timestamp,
      unrealizedPnL: 0,
      unrealizedPnLPercentage: 0,
      maxPriceSinceEntry: this.context.currentPrice,
    };

    // Actualizar contexto
    this.context.balance -= totalCost;
    this.context.position = newPosition;
    this.context.equity = this.context.balance + quantity * this.context.currentPrice;

    this.logger.log(
      `BUY ejecutado: ${quantity.toFixed(8)} ${this.context.symbol} @ ${this.context.currentPrice} (Comisión: ${commission.toFixed(2)} USDT)`,
    );

    return {
      success: true,
      executedAction: 'BUY',
      executedPrice: this.context.currentPrice,
      executedQuantity: quantity,
      newBalance: this.context.balance,
      newPosition: newPosition,
      newEquity: this.context.equity,
      fees: commission,
      timestamp: this.context.timestamp,
    };
  }

  /**
   * Ejecuta una venta (cierre de posición)
   */
  private async executeSell(decision: TradingDecision): Promise<ExecutionResult> {

    // Validar que hay posición abierta
    if (!this.context.position) {
      return {
        success: false,
        executedAction: 'HOLD',
        newBalance: this.context.balance,
        newPosition: null,
        newEquity: this.context.equity,
        timestamp: this.context.timestamp,
        error: 'No hay posición para cerrar',
      };
    }

    const position = this.context.position;

    // Calcular ingresos por venta
    const revenue = position.quantity * this.context.currentPrice;

    // Calcular comisión
    const commissionRate = this.context.settings.trading.commissionRate || 0.001;
    const commission = revenue * commissionRate;
    const netRevenue = revenue - commission;

    // Calcular P/L
    const cost = position.quantity * position.entryPrice;
    const profitLoss = netRevenue - cost;
    const profitLossPercentage = (profitLoss / cost) * 100;

    // Actualizar contexto
    this.context.balance += netRevenue;
    this.context.position = null;
    this.context.equity = this.context.balance;

    const actionLabel = this.getActionLabel(decision.action);

    this.logger.log(
      `${actionLabel} ejecutado: ${position.quantity.toFixed(8)} ${this.context.symbol} @ ${this.context.currentPrice} | P/L: ${profitLoss.toFixed(2)} USDT (${profitLossPercentage.toFixed(2)}%)`,
    );

    return {
      success: true,
      executedAction: 'SELL',
      executedPrice: this.context.currentPrice,
      executedQuantity: position.quantity,
      newBalance: this.context.balance,
      newPosition: null,
      newEquity: this.context.equity,
      fees: commission,
      timestamp: this.context.timestamp,
    };
  }

  /**
   * Actualiza las métricas de una posición abierta
   */
  private updatePositionMetrics(position: Position, currentPrice: number): void {
    // Actualizar P/L no realizado
    position.unrealizedPnL = (currentPrice - position.entryPrice) * position.quantity;
    position.unrealizedPnLPercentage =
      ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
    // Actualizar máximo precio (para trailing stop)
    position.maxPriceSinceEntry = Math.max(position.maxPriceSinceEntry, currentPrice);
  }

  /**
   * Convierte el tipo de acción a una etiqueta legible
   */
  private getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'SELL': 'SELL',
      'CLOSE_SL': 'STOP LOSS',
      'CLOSE_TP': 'TAKE PROFIT',
      'CLOSE_TRAILING': 'TRAILING STOP',
    };
    return labels[action] || action;
  }

  /**
   * Limpieza de recursos (no necesario en backtesting)
   */
  async cleanup(): Promise<void> {
    this.logger.log(`BacktestAdapter limpiado para ${this.context.symbol}`);
  }
}
