import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { BinanceModule } from './features/binance/binance.module';
import { StrategyModule } from './features/strategy/strategy.module';
import { BacktestingModule } from './features/backtesting/backtesting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BinanceModule,
    StrategyModule,
    BacktestingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
