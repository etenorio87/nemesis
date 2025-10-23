import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { TradingSettings } from '@nemesis/commons';

export class UpdateTradingSettingsDto implements TradingSettings {
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  defaultStopLossPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  defaultTakeProfitPercentage?: number;

  @IsOptional()
  @IsBoolean()
  defaultUseTrailingStop?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.01)
  defaultCommissionRate?: number;

  @IsOptional()
  @IsBoolean()
  enableTrendFilter?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(100)
  minConfidenceToBuy?: number;

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(100)
  minConfidenceToSell?: number;
}
