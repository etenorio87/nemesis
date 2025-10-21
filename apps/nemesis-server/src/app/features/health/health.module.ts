import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import {BinanceModule} from '../binance/binance.module';

@Module({
  controllers:  [HealthController],
  imports:      [BinanceModule]
})
export class HealthModule {}
