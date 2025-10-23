import { IsNumber, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IndicatorSettings } from '@nemesis/commons';

/**
 * DTO para validar configuración de RSI
 */
export class RsiSettingsDto {
  @IsNumber()
  @Min(5)
  @Max(50)
  period: number;
}

/**
 * DTO para validar configuración de MACD
 */
export class MacdSettingsDto {
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
export class SmaSettingsDto {
  @IsNumber()
  @Min(5)
  @Max(200)
  period: number;
}

/**
 * DTO para validar configuración de EMA
 */
export class EmaSettingsDto {
  @IsNumber()
  @Min(5)
  @Max(200)
  period: number;
}

/**
 * DTO para actualizar configuración de indicadores
 */
export class UpdateIndicatorSettingsDto implements IndicatorSettings {
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
