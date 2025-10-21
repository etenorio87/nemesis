# 🗺️ Nemesis Trading Bot - Roadmap de Desarrollo

## Estado Actual: MVP Completado ✅

- [x] Integración con Binance API (Testnet y Mainnet)
- [x] Análisis técnico con indicadores (RSI, MACD, SMA, EMA)
- [x] Sistema de señales BUY/SELL/HOLD con niveles de confianza
- [x] Backtesting completo con métricas avanzadas
- [x] Stop-loss (fijo y trailing)
- [x] Take-profit configurable
- [x] DTOs y validación con class-validator
- [x] Arquitectura de monorepo con Nx
- [x] API REST con NestJS

---

## 📋 Próximos Pasos

### 0. **Indicadores Configurables** 🎯 *[PRÓXIMO]*

**Objetivo:** Permitir configurar los parámetros de los indicadores técnicos desde el request.

**Tareas:**
- [ ] Crear tipos/interfaces para configuración de indicadores en `nemesis-commons`
  - `IndicatorSettings` con opciones para RSI, MACD, SMA, EMA
  - Valores por defecto claramente definidos
- [ ] Actualizar DTOs (`AnalyzeSymbolDto`, `RunBacktestDto`) para aceptar `indicatorSettings` opcional
- [ ] Modificar `AnalysisService.analyzeTechnicals()` para recibir y usar configuración personalizada
- [ ] Agregar validación de rangos para los parámetros (ej: RSI period entre 5-50)
- [ ] Documentar parámetros recomendados para cada indicador
- [ ] Probar diferentes combinaciones de parámetros

**Resultado esperado:**
```json
{
  "symbol": "BTCUSDT",
  "interval": "1h",
  "indicatorSettings": {
    "rsi": { "period": 10 },
    "macd": { "fastPeriod": 8, "slowPeriod": 21, "signalPeriod": 5 },
    "sma": { "period": 50 },
    "ema": { "period": 21 }
  }
}
```

---

### 0.5. **Detector de Tendencias del Mercado** 📊 *[DESPUÉS DE FASE 0]*

**Objetivo:** Detectar automáticamente la tendencia del mercado y adaptar la estrategia de trading.

**Flujo de ejecución:**
```
1. Usuario envía request → con/sin parámetros de indicadores
2. Sistema obtiene klines históricos
3. ⭐ Analizar tendencia del mercado (BULLISH/BEARISH/SIDEWAYS)
4. Calcular indicadores según tendencia y parámetros del usuario
5. Procesar klines buscando señales BUY/SELL/HOLD
6. Aplicar filtros de tendencia:
   - BEARISH → No operar (forzar HOLD)
   - SIDEWAYS → Mean reversion strategy
   - BULLISH → Trend following strategy
7. Ejecutar trade (backtest/paper/live según modo)
```

**Tareas:**
- [ ] Crear `TrendAnalysisService` independiente
- [ ] Implementar indicadores para detectar tendencia:
  - ADX (Average Directional Index) para fuerza de tendencia
  - EMA múltiples (20, 50, 200) para dirección
  - Price Action analysis
  - Slope de las medias móviles
- [ ] Crear tipo `MarketTrend` en `nemesis-commons`:
  ```typescript
  interface MarketTrend {
    type: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    strength: number; // 0-100 (fuerza de la tendencia)
    confidence: number; // 0-100 (confianza en la detección)
    reason: string;
    indicators: {
      adx?: number;
      emaSlope?: number;
      pricePosition?: string;
    };
  }
  ```
- [ ] Crear estrategias adaptativas por tendencia:
  - `TREND_FOLLOWING` (para mercados alcistas)
  - `MEAN_REVERSION` (para mercados laterales)
  - Pesos diferentes de indicadores según estrategia
- [ ] Modificar `AnalysisService.generateSignal()` para recibir tendencia
- [ ] Implementar filtro de mercado bajista (no operar)
- [ ] Ajustar SL/TP según tipo de mercado:
  - Lateral: SL más ajustado (1.5%), TP conservador (3%)
  - Alcista: SL normal, TP más amplio
- [ ] Actualizar `TradeSignal` para incluir:
  ```typescript
  interface TradeSignal {
    // ... campos existentes
    marketTrend: MarketTrend;
    strategyUsed: string; // 'TREND_FOLLOWING' | 'MEAN_REVERSION'
    indicatorsConfig: IndicatorSettings;
  }
  ```
- [ ] Agregar endpoint `/trading/analyze-trend` para solo ver tendencia
- [ ] Tests de detección de tendencias con datos históricos
- [ ] Documentar umbrales y parámetros de detección

**Resultado esperado:**
```json
{
  "signal": "BUY",
  "confidence": 75,
  "marketTrend": {
    "type": "BULLISH",
    "strength": 85,
    "confidence": 90,
    "reason": "ADX alto (35), EMAs alineadas alcistas, precio sobre EMA200"
  },
  "strategyUsed": "TREND_FOLLOWING",
  "indicatorsConfig": { ... }
}
```

**Consideraciones importantes:**
- En mercado SIDEWAYS: Mayor riesgo de señales falsas (whipsaws)
- En mercado BEARISH: No operar (por ahora, en futuro agregar shorts)
- Logging detallado de decisiones para análisis posterior
- Permitir override manual del filtro de tendencia (parámetro opcional)

---

### 1. **Optimización Automática de Parámetros** 🔧

**Objetivo:** Encontrar automáticamente los mejores parámetros para cada símbolo y timeframe.

**Tareas:**
- [ ] Implementar Grid Search para optimizar:
  - Periodos de indicadores (RSI, MACD, SMA, EMA)
  - Niveles de Stop-loss y Take-profit
  - Umbrales de confianza para señales
- [ ] Crear servicio `OptimizationService` que:
  - Ejecute múltiples backtests con diferentes combinaciones
  - Evalúe según métricas: Profit Factor, Sharpe Ratio, Max Drawdown
  - Identifique la mejor configuración
- [ ] Endpoint `/optimization/find-best-params`
- [ ] Guardar resultados de optimizaciones para consulta posterior
- [ ] Implementar Walk-Forward Analysis para validar resultados
- [ ] Agregar límites de tiempo/iteraciones para evitar procesos infinitos

**Métricas de evaluación:**
- Sharpe Ratio (retorno ajustado por riesgo)
- Profit Factor (ganancias/pérdidas)
- Win Rate
- Max Drawdown
- Total Return

---

### 2. **Más Estrategias de Trading** 📊

**Objetivo:** Ampliar el arsenal de indicadores y estrategias.

**Fase 2.1: Nuevos Indicadores**
- [ ] Bollinger Bands (bandas de volatilidad)
- [ ] Stochastic RSI (momentum)
- [ ] ATR - Average True Range (volatilidad)
- [ ] ADX - Average Directional Index (fuerza de tendencia)
- [ ] Ichimoku Cloud (análisis completo)
- [ ] Volume indicators (OBV, Volume Profile)

**Fase 2.2: Estrategias Compuestas**
- [ ] Estrategia de Mean Reversion (reversión a la media)
- [ ] Estrategia de Breakout (ruptura de niveles)
- [ ] Estrategia de Tendencia (seguimiento de tendencias)
- [ ] Estrategia Multi-timeframe (análisis en varios intervalos)
- [ ] Permitir crear estrategias personalizadas combinando indicadores

**Fase 2.3: Sistema de Estrategias**
- [ ] `StrategyService` para gestionar múltiples estrategias
- [ ] Interfaz común para todas las estrategias
- [ ] Comparador de estrategias (backtesting paralelo)
- [ ] Selector automático de mejor estrategia por símbolo

---

### 3. **Trading Real (Paper Trading primero)** 💰

**Objetivo:** Ejecutar trades reales basados en las señales del bot.

**Fase 3.1: Paper Trading**
- [ ] Modo simulación sin dinero real
- [ ] Sistema de órdenes simuladas
- [ ] Monitoreo en tiempo real del mercado
- [ ] Registro detallado de todas las operaciones simuladas
- [ ] Dashboard de rendimiento en vivo

**Fase 3.2: Trading Real**
- [ ] Sistema de gestión de órdenes con Binance:
  - Market orders
  - Limit orders
  - Stop-loss orders
  - Take-profit orders
  - OCO (One-Cancels-Other) orders
- [ ] Gestión de riesgo:
  - Límite de capital por trade
  - Límite de pérdida diaria
  - Límite de trades simultáneos
  - Tamaño de posición dinámico
- [ ] Sistema de confirmación para trades (requerir aprobación manual)
- [ ] Modo automático vs semi-automático
- [ ] Circuit breakers (pausar bot ante pérdidas excesivas)

**Fase 3.3: Monitoreo Continuo**
- [ ] WebSocket para datos de mercado en tiempo real
- [ ] Sistema de eventos para señales de trading
- [ ] Health checks y reconexión automática
- [ ] Manejo de errores de API (rate limits, timeouts)

---

### 4. **Sistema de Notificaciones** 📱

**Objetivo:** Alertar al usuario sobre eventos importantes.

**Fase 4.1: Telegram Bot**
- [ ] Crear bot de Telegram
- [ ] Notificaciones de:
  - Señales generadas (BUY/SELL)
  - Trades ejecutados
  - Stop-loss / Take-profit activados
  - Errores críticos
  - Resumen diario de performance
- [ ] Comandos del bot:
  - `/status` - Estado actual del bot
  - `/balance` - Balance de cuenta
  - `/trades` - Últimos trades
  - `/pause` / `/resume` - Control del bot
  - `/stats` - Estadísticas

**Fase 4.2: Email Notifications**
- [ ] Integración con servicio de email (SendGrid/Mailgun)
- [ ] Reportes diarios/semanales por email
- [ ] Alertas de eventos críticos
- [ ] Templates HTML profesionales

**Fase 4.3: Webhooks**
- [ ] Sistema de webhooks configurables
- [ ] Integración con servicios externos (Discord, Slack)
- [ ] Formato de payload estandarizado

---

### 5. **Base de Datos y Persistencia** 💾

**Objetivo:** Almacenar historial y configuraciones de forma persistente.

**Fase 5.1: Setup de Infraestructura**
- [ ] Docker Compose con Redis y MariaDB
- [ ] Configuración de conexiones en NestJS
- [ ] Migraciones de base de datos con TypeORM

**Fase 5.2: Modelos de Datos**
- [ ] Entidad `Trade` (historial de operaciones)
- [ ] Entidad `Signal` (señales generadas)
- [ ] Entidad `BacktestResult` (resultados de backtests)
- [ ] Entidad `BotConfiguration` (configuraciones guardadas)
- [ ] Entidad `PerformanceMetric` (métricas diarias)

**Fase 5.3: Repositorios y Servicios**
- [ ] Repository pattern para cada entidad
- [ ] Servicio de persistencia de trades
- [ ] Servicio de historial de señales
- [ ] Cache con Redis para datos de mercado
- [ ] Queries optimizadas para reportes

**Fase 5.4: Features con DB**
- [ ] Historial completo de operaciones
- [ ] Análisis de performance histórica
- [ ] Comparación de periodos
- [ ] Exportación de datos (CSV, Excel)

---

### 6. **Dashboard y Visualización** 📈

**Objetivo:** Interface para monitorear y controlar el bot.

**Fase 6.1: API de Estadísticas**
- [ ] Endpoints para métricas en tiempo real
- [ ] Endpoints de historial (trades, señales, equity)
- [ ] Endpoints de configuración (CRUD de strategies)
- [ ] WebSocket para updates en vivo

**Fase 6.2: Dashboard Web (opcional - antes de app móvil)**
- [ ] Dashboard básico con Angular (reusando nemesis-app)
- [ ] Gráficos de equity curve
- [ ] Lista de trades activos
- [ ] Controles de bot (start/stop/pause)
- [ ] Formularios de configuración

**Fase 6.3: App Móvil (Ionic/Angular)**
- [ ] Desarrollo de nemesis-app
- [ ] Pantallas principales:
  - Dashboard de resumen
  - Historial de trades
  - Configuración de estrategias
  - Notificaciones
  - Controles del bot
- [ ] Autenticación y seguridad
- [ ] Build para iOS y Android

---

### 7. **Preparación para Producción** 🚀

**Objetivo:** Código robusto, seguro y escalable.

**Fase 7.1: Logging y Monitoreo**
- [ ] Winston para logging estructurado
- [ ] Niveles de log apropiados (error, warn, info, debug)
- [ ] Rotación de logs
- [ ] Integración con servicios de monitoreo (Datadog, Sentry)
- [ ] Métricas de aplicación (Prometheus)

**Fase 7.2: Manejo de Errores**
- [ ] Global exception filters
- [ ] Retry logic para llamadas a Binance API
- [ ] Fallback strategies ante fallos
- [ ] Alertas automáticas de errores críticos
- [ ] Circuit breaker pattern

**Fase 7.3: Seguridad**
- [ ] Autenticación JWT para endpoints
- [ ] Rate limiting por IP/usuario
- [ ] Encriptación de API keys
- [ ] Validación exhaustiva de inputs
- [ ] CORS configurado correctamente
- [ ] Secrets management (variables de entorno seguras)

**Fase 7.4: Tests**
- [ ] Tests unitarios de servicios críticos
- [ ] Tests de integración con Binance (usando testnet)
- [ ] Tests de backtesting con datos sintéticos
- [ ] Tests E2E de flujos completos
- [ ] Cobertura de código >80%
- [ ] CI/CD con GitHub Actions

**Fase 7.5: Documentación**
- [ ] API documentation con Swagger/OpenAPI
- [ ] Guías de deployment
- [ ] Guías de troubleshooting
- [ ] Documentación de estrategias
- [ ] Ejemplos de uso completos

**Fase 7.6: Performance**
- [ ] Profiling y optimización de queries
- [ ] Caching estratégico
- [ ] Connection pooling para DB
- [ ] Compresión de responses
- [ ] Rate limiting interno para Binance

**Fase 7.7: Deployment**
- [ ] Dockerización completa
- [ ] Docker Compose para entorno completo
- [ ] Scripts de deployment
- [ ] Configuración para VPS/Cloud (AWS, DigitalOcean)
- [ ] Backups automáticos de DB
- [ ] Rollback strategy

---

## 🎯 Criterios de Éxito por Fase

### Fase 0 - Indicadores Configurables
✅ Poder ejecutar backtests con diferentes configuraciones de indicadores  
✅ Documentación clara de parámetros recomendados  
✅ Validación robusta de inputs

### Fase 0.5 - Detector de Tendencias
✅ Detectar tendencia correctamente en >85% de casos históricos  
✅ No operar en mercados bajistas (0 trades en BEARISH)  
✅ Adaptar estrategia automáticamente según tendencia  
✅ Logging claro de tendencia detectada en cada análisis

### Fase 1 - Optimización
✅ Encontrar configuración óptima en <5 minutos  
✅ Mejora medible en Profit Factor  
✅ Resultados reproducibles

### Fase 2 - Estrategias
✅ Al menos 5 estrategias diferentes implementadas  
✅ Comparación clara entre estrategias  
✅ Sistema extensible para agregar más

### Fase 3 - Trading Real
✅ Paper trading funcionando 24/7 sin errores  
✅ 0 trades no intencionados en modo real  
✅ Circuit breakers funcionando correctamente

### Fase 4 - Notificaciones
✅ Recibir alertas en <5 segundos del evento  
✅ 0 notificaciones perdidas  
✅ Formato claro y accionable

### Fase 5 - Base de Datos
✅ Queries de historial <500ms  
✅ 100% de trades persistidos  
✅ Backups automáticos funcionando

### Fase 6 - Dashboard
✅ Interface responsive y rápida  
✅ Updates en tiempo real sin lag  
✅ Usable en móvil

### Fase 7 - Producción
✅ Uptime >99%  
✅ Cobertura de tests >80%  
✅ 0 secrets en código  
✅ Logs estructurados y analizables  
✅ Recovery automático de errores comunes

---

## 📅 Estimación de Tiempo

| Fase | Complejidad | Tiempo Estimado |
|------|-------------|-----------------|
| 0. Indicadores Configurables | Baja | 2-3 días |
| 0.5. Detector de Tendencias | Media | 4-6 días |
| 1. Optimización Automática | Media | 5-7 días |
| 2. Más Estrategias | Media-Alta | 10-14 días |
| 3. Trading Real | Alta | 14-21 días |
| 4. Notificaciones | Baja | 3-5 días |
| 5. Base de Datos | Media | 7-10 días |
| 6. Dashboard | Media-Alta | 14-21 días |
| 7. Producción | Media | 10-14 días |

**Total estimado:** 2.5-3.5 meses trabajando consistentemente

---

## 🎓 Aprendizajes Esperados

- Arquitectura de trading bots robustos
- Análisis técnico avanzado
- Optimización algorítmica
- Gestión de riesgo
- APIs financieras en producción
- Monitoreo y observabilidad
- Testing de sistemas críticos

---

## ⚠️ Riesgos y Consideraciones

1. **Overfitting en optimización:** Los parámetros óptimos en backtest pueden no funcionar en forward testing
2. **Cambios de mercado:** Las estrategias deben adaptarse a diferentes condiciones
3. **Límites de API:** Respetar rate limits de Binance
4. **Slippage:** Diferencia entre precio esperado y ejecutado
5. **Latencia:** El tiempo importa en trading
6. **Costos de comisiones:** Pueden eliminar rentabilidad en estrategias de alta frecuencia

---

## 📚 Recursos Útiles

- [Binance API Documentation](https://binance-docs.github.io/apidocs/)
- [Technical Indicators Library](https://github.com/anandanand84/technicalindicators)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Nx Monorepo Guide](https://nx.dev/)
- [Trading Strategy Design Patterns](https://www.investopedia.com/articles/active-trading/11/four-types-of-active-traders.asp)

---

**Documento vivo - Se actualizará conforme avancemos** 🚀
