import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { BinanceModule } from './features/binance/binance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BinanceModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
