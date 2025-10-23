import {IsEnum, IsNumber, IsOptional, IsString, Max, Min} from 'class-validator';
import {IntervalType} from '@nemesis/commons';

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
}
