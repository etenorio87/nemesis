import { Body, Controller, Post } from '@nestjs/common';
import { TradingService } from './trading.service';
import {AnalyzeSymbolDto} from './dto/analyze-symbol.dto';

@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post('analyze')
  async analyzeSymbol(@Body() dto: AnalyzeSymbolDto) {
    return await this.tradingService.analyzeSymbol(
      dto.symbol,
      dto.interval,
      dto.limit ?? 100,
      dto.indicatorSettings // 🆕 Pasar configuración de indicadores
    );
  }

  @Post('signals')
  async getSignals(
    @Body() dto: { symbols: string[]; interval: string; indicatorSettings?: any }
  ) {
    return await this.tradingService.getMultipleSignals(
      dto.symbols,
      dto.interval as any,
      dto.indicatorSettings // 🆕 Pasar configuración de indicadores
    );
  }
}
