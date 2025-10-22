import { IsNumber, Max, Min, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import {
  RsiSettings,
  MacdSettings,
  SmaSettings,
  EmaSettings,
  IndicatorSettings
} from '@nemesis/commons';

/**
 * DTO para validar configuración de RSI
 */
export class RsiSettingsDto implements RsiSettings {
  @IsNumber()
  @Min(5)
  @Max(50)
  period: number;
}

/**
 * DTO para validar configuración de MACD
 */
export class MacdSettingsDto implements MacdSettings {
  @IsNumber()
  @Min(5)
  @Max(30)
  fastPeriod: number;

  @IsNumber()
  @Min(15)
  @Max(50)
  slowPeriod: number;

  @IsNumber()
  @Min(5)
  @Max(20)
  signalPeriod: number;
}

/**
 * DTO para validar configuración de SMA
 */
export class SmaSettingsDto implements SmaSettings {
  @IsNumber()
  @Min(5)
  @Max(200)
  period: number;
}

/**
 * DTO para validar configuración de EMA
 */
export class EmaSettingsDto implements EmaSettings {
  @IsNumber()
  @Min(5)
  @Max(200)
  period: number;
}

/**
 * DTO para validar configuración completa de indicadores
 */
export class IndicatorSettingsDto implements IndicatorSettings {
  @IsOptional()
  @ValidateNested()
  @Type(() => RsiSettingsDto)
  rsi?: RsiSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MacdSettingsDto)
  macd?: MacdSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SmaSettingsDto)
  sma?: SmaSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmaSettingsDto)
  ema?: EmaSettingsDto;
}
