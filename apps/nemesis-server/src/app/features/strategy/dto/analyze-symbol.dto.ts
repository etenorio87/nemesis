import { IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IntervalType } from '@nemesis/commons';
import { IndicatorSettingsDto } from '../../backtesting/dto/indicator-settings.dto';

export class AnalyzeSymbolDto {
  @IsString()
  symbol: string;

  @IsEnum(['1m', '5m', '15m', '1h', '4h', '1d'])
  interval: IntervalType;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1000)
  limit?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => IndicatorSettingsDto)
  indicatorSettings?: IndicatorSettingsDto;
}
