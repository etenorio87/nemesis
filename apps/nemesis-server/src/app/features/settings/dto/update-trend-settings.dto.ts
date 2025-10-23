import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { TrendDetectionSettings } from '@nemesis/commons';

export class UpdateTrendSettingsDto implements TrendDetectionSettings {
  @IsOptional()
  @IsNumber()
  @Min(7)
  @Max(30)
  adxPeriod?: number;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(40)
  adxThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(50)
  ema20Period?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(100)
  ema50Period?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(300)
  ema200Period?: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(50)
  lookbackPeriod?: number;
}
