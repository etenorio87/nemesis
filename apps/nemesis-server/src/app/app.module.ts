import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {BinanceModule} from './features/binance/binance.module';
import {StrategyModule} from './features/strategy/strategy.module';
import {BacktestingModule} from './features/backtesting/backtesting.module';
import {HealthModule} from './features/health/health.module';
import {PrismaModule} from './core/prisma/prisma.module';
import {SettingsModule} from './features/settings/settings.module';
import {RedisModule} from './core/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    BinanceModule,
    StrategyModule,
    BacktestingModule,
    HealthModule,
    PrismaModule,
    SettingsModule,
  ],
})
export class AppModule {
}
