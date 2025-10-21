import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BinanceModule } from './features/binance/binance.module';
import { StrategyModule } from './features/strategy/strategy.module';
import { BacktestingModule } from './features/backtesting/backtesting.module';
import { HealthModule } from './features/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BinanceModule,
    StrategyModule,
    BacktestingModule,
    HealthModule,
  ]
})
export class AppModule {}
