import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested} from 'class-validator';
import {Type} from 'class-transformer';
import {IntervalType} from '@nemesis/commons';
import {IndicatorSettingsDto} from './indicator-settings.dto';

export class RunBacktestDto {
  @IsString()
  symbol: string;

  @IsEnum(['1m', '5m', '15m', '1h', '4h', '1d'])
  interval: IntervalType;

  @IsNumber()
  @Min(100)
  initialBalance: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1000)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.01)
  commissionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  stopLossPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  takeProfitPercentage?: number;

  @IsOptional()
  @IsBoolean()
  useTrailingStop?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => IndicatorSettingsDto)
  indicatorSettings?: IndicatorSettingsDto;
}
