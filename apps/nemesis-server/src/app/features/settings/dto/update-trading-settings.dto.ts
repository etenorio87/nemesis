import {IsBoolean, IsNumber, IsOptional, Max, Min} from 'class-validator';
import { TradingSettings } from '@nemesis/commons';

export class UpdateTradingSettingsDto implements TradingSettings {

  @IsOptional()
  @IsBoolean()
  enableTrendFilter?: boolean;          // Si true, no opera en BEARISH

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  @Max(0.01)
  commissionRate?: number;              // Tasa de comisión por operación (ej: 0.001)

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  stopLossPercent?: number;             // % de stop loss (ej: 2.0)

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  takeProfitPercent?: number;           // % de take profit (ej: 5.0)

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  trailingStopPercent?: number;         // % de trailing (usa stopLoss si no se especifica)

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  breakevenThreshold?: number;          // % para mover SL a breakeven (ej: 1.5)

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  maxPositionSizePercent?: number;      // Máximo % del balance por posición (ej: 0.95)

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  minConfidenceToBuy?: number;          // Confianza mínima para comprar (ej: 60)

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  minConfidenceToSell?: number;         // Confianza mínima para vender (ej: 50)
}


