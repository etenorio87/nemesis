# ROADMAP Proyecto Nemesis

## Fase 0: Fundación y Backtesting Básico (Completado)

- [x] **Arquitectura Monorepo (Nx)**: Configuración inicial del *workspace* de Nx.
- [x] **`nemesis-server` (NestJS)**: Creación de la aplicación backend.
- [x] **`nemesis-app` (Angular)**: Creación de la aplicación frontend (placeholder).
- [x] **`nemesis-commons` (Lib)**: Creación de la librería compartida de TypeScript.
- [x] **Infraestructura Docker**: `docker-compose.yml` funcional con MariaDB y Redis.
- [x] **`PrismaModule`**: Integración de Prisma ORM con MariaDB.
- [x] **`RedisModule`**: Integración de Redis (para caching y gestión de estado futura).
- [x] **`SettingsService`**: Servicio global para gestionar la configuración del bot (indicadores, trading) desde la DB.
- [x] **`BinanceService`**: Conector de API para obtener datos de mercado (Klines).
- [x] **`AnalysisService` (v1)**: Lógica inicial de indicadores (RSI, MACD) usando `technicalindicators`.
- [x] **`BacktestingService` (v1)**: Implementación de un backtester simple que itera sobre Klines y simula trades basado en `AnalysisService`.
- [x] **Endpoint API**: `POST /api/backtesting/run` para ejecutar simulaciones.

### ✅ Fase 0.5: Detector de Tendencias y Estrategia Dual (Completado)

- [x] **TrendAnalysisService**: Implementado servicio de detección de tendencia (Macro) usando EMA (200) y ADX (Fuerza).
- [x] **Filtro de Régimen**: El sistema clasifica el mercado en `BULLISH`, `BEARISH`, `SIDEWAYS`.
- [x] **Regla de Negocio (HOLD)**: El `BacktestingService` implementa la regla de `HOLD` (no operar) en mercados `BEARISH`.
- [x] **Estrategia Dual (Micro)**: `AnalysisService` refactorizado para ejecutar lógica de señales basada en la estrategia dictada por el contexto macro:
  - `MEAN_REVERSION` (Rango): Usa señales de Oscilador (RSI < 30).
  - `TREND_FOLLOWING` (Alcista): Usa señales de Momentum (MACD Crossover).
- [x] **Reporte de Backtest**: `BacktestResult` ahora incluye métricas de rendimiento completas (PnL, WinRate, MaxDrawdown) y estadísticas de `trendAnalysis`.

### ➡️ Fase 1.0: Optimización de Estrategias y Gestión de Riesgo (Siguiente)

- [ ] **Gestión de Riesgo (Backtest)**: Implementar lógica de Stop Loss (SL) y Take Profit (TP) en el `simulateTrades` del `BacktestingService`.
- [ ] **Optimización (Brute-Force)**: Crear un nuevo módulo/endpoint (`/backtesting/optimize`) que ejecute `runBacktest` iterativamente sobre un rango de parámetros (ej. RSI: 10-20, ADX: 20-30) para encontrar la configuración más rentable.
- [ ] **Refactor (SettingsService)**: Permitir que el `BacktestingService` acepte `IndicatorSettings` como parte del DTO, en lugar de usar siempre los globales del `SettingsService`.

### Fase 2.0: Bot en Vivo (Testnet)

- [ ] **BotService**: Crear el servicio principal del bot que opere en un bucle (`setInterval`).
- [ ] **Gestión de Estado (Redis)**: Almacenar la posición actual, balance, y estado del bot en Redis.
- [ ] **Binance Testnet**: Integrar el `BinanceService` para ejecutar órdenes reales (Crear/Cancelar/Consultar) en el entorno de Testnet.

### Fase 3.0: Interfaz de Usuario

- [ ] **`nemesis-app`**: Conectar la app Angular al `nemesis-server`.
- [ ] **Dashboard**: Visualizar el estado del bot (P/L, trades actuales).
- [ ] **Configuración**: Permitir al usuario modificar `BotSettings` desde la UI.
- [ ] **Resultados de Backtest**: Visualizar los reportes de `BacktestResult` con gráficos (Equity Curve).
