# 🤖 Nemesis Trading Bot - Estado Actual del Proyecto

**Fecha:** 23 de Octubre, 2025  
**Versión:** Fase 0 Completada + Infraestructura Avanzada  
**Próximo paso:** Fase 0.5 - Detector de Tendencias del Mercado

---

## 📊 Estado General

### ✅ Completado

#### 1. **MVP Base (100%)**
- ✅ Integración con Binance API (Testnet y Mainnet)
- ✅ Obtención de precios en tiempo real
- ✅ Lectura de klines (velas históricas)
- ✅ Health check de conexión
- ✅ Información de cuenta

#### 2. **Análisis Técnico**
- ✅ RSI (Relative Strength Index) - Configurable
- ✅ MACD (Moving Average Convergence Divergence) - Configurable
- ✅ SMA (Simple Moving Average) - Configurable
- ✅ EMA (Exponential Moving Average) - Configurable

#### 3. **Sistema de Señales**
- ✅ Generación de señales BUY/SELL/HOLD
- ✅ Niveles de confianza (0-100%)
- ✅ Explicación detallada de cada señal
- ✅ Sistema de puntuación por indicadores:
  - RSI extremo: 40 puntos
  - RSI moderado: 20 puntos
  - MACD crossover: 30 puntos
  - Posición vs medias: 20 puntos

#### 4. **Backtesting Completo**
- ✅ Simulación de trading con datos históricos
- ✅ Métricas implementadas:
  - Profit/Loss (absoluto y porcentual)
  - Win Rate
  - Max Drawdown
  - Average Win/Loss
  - Profit Factor
  - Equity curve (evolución del capital)
  - Total de operaciones
  - Trades ganadores/perdedores
- ✅ Comisiones configurables (default: 0.1%)
- ✅ Historial detallado de trades

#### 5. **Gestión de Riesgo**
- ✅ Stop-loss fijo configurable
- ✅ Trailing stop-loss (stop dinámico)
- ✅ Take-profit configurable
- ✅ Contadores de SL/TP activados
- ✅ P/L por trade individual

#### 6. **🆕 Fase 0: Indicadores Configurables (100%)**
- ✅ Interfaces `IndicatorSettings` en nemesis-commons
- ✅ Constantes `DEFAULT_INDICATOR_SETTINGS`
- ✅ Validación de rangos para cada indicador
- ✅ DTOs con validación completa
- ✅ `AnalysisService` acepta configuración personalizada
- ✅ `TradingService` usa configuración
- ✅ `BacktestingService` usa configuración
- ✅ Documentación de parámetros recomendados

#### 7. **🆕 Infraestructura Avanzada (100%)**
- ✅ **Docker Compose** con MariaDB y Redis
- ✅ **Prisma ORM** configurado y funcionando
- ✅ **PrismaModule** (Global)
- ✅ **RedisModule** (Global)
- ✅ **ConfigurationModule** completo
- ✅ Esquema de BD con modelos:
  - `BotConfig` (configuración persistente)
  - `Trade` (para futuro)
  - `Signal` (para futuro)
  - `BacktestResult` (para futuro)

#### 8. **🆕 Sistema de Configuración Global (100%)**
- ✅ `ConfigurationService` con cache y persistencia
- ✅ Carga inicial desde BD o defaults
- ✅ Cache en Redis (24h TTL)
- ✅ Escritura en BD + actualización de cache
- ✅ API REST para gestión de configuración:
  - `GET /config` - Ver configuración completa
  - `GET /config/indicators` - Ver indicadores
  - `GET /config/trend-detection` - Ver detección de tendencias
  - `GET /config/trading` - Ver configuración de trading
  - `PUT /config/indicators` - Actualizar indicadores
  - `PUT /config/trend-detection` - Actualizar tendencias
  - `PUT /config/trading` - Actualizar trading
  - `POST /config/reset` - Resetear a defaults
- ✅ Integración completa en servicios existentes

#### 9. **Arquitectura y Código**
- ✅ Monorepo con Nx
- ✅ Backend NestJS profesional
- ✅ DTOs con validación (class-validator)
- ✅ Biblioteca compartida (nemesis-commons)
- ✅ Método POST con validación para todos los endpoints
- ✅ Estructura modular y escalable
- ✅ Módulos Core globales (Prisma, Redis)
- ✅ Separación de concerns clara

---

## 🏗️ Estructura del Proyecto

```
nemesis/
├── apps/
│   ├── nemesis-server/               ✅ Backend funcional
│   │   ├── core/                     ✅ Módulos Core
│   │   │   ├── prisma/               ✅ PrismaModule + Service
│   │   │   └── redis/                ✅ RedisModule + Service
│   │   ├── features/
│   │   │   ├── binance/              ✅ Integración Binance API
│   │   │   ├── strategy/             ✅ Análisis técnico + Trading
│   │   │   ├── backtesting/          ✅ Sistema de backtesting
│   │   │   └── configuration/        ✅ Gestión de configuración
│   │   └── app.module.ts             ✅ Módulo principal
│   │
│   └── nemesis-app/                  📋 Scaffold básico (sin desarrollo)
│
├── libs/
│   └── nemesis-commons/              ✅ Tipos, interfaces, constantes
│       ├── types.ts                  ✅ Enums y tipos básicos
│       ├── interfaces.ts             ✅ Interfaces del dominio
│       └── constants.ts              ✅ Valores por defecto
│
├── prisma/
│   └── schema.prisma                 ✅ Esquema de BD
│
├── docker-compose.yml                ✅ MariaDB + Redis
├── .env                              ✅ Configuración de API keys y BD
├── README.md                         ✅ Documentación profesional
└── package.json                      ✅ Dependencias instaladas
```

---

## 🔌 API Endpoints Disponibles

### Health & Status
```bash
GET /api/health
# Verifica conexión con Binance
```

### Configuration Management (🆕 NUEVO)
```bash
# Ver configuración completa
GET /api/config

# Ver configuración de indicadores
GET /api/config/indicators

# Ver configuración de detección de tendencias
GET /api/config/trend-detection

# Ver configuración de trading
GET /api/config/trading

# Actualizar indicadores
PUT /api/config/indicators
Body: {
  "rsi": { "period": 10 },
  "macd": { "fastPeriod": 8, "slowPeriod": 21, "signalPeriod": 5 },
  "sma": { "period": 50 },
  "ema": { "period": 21 }
}

# Actualizar configuración de trading
PUT /api/config/trading
Body: {
  "defaultStopLossPercentage": 2.5,
  "defaultTakeProfitPercentage": 6.0,
  "enableTrendFilter": true,
  "minConfidenceToBuy": 65
}

# Resetear a valores por defecto
POST /api/config/reset
```

### Trading Analysis
```bash
POST /api/trading/analyze
Body: {
  "symbol": "BTCUSDT",
  "interval": "1h",
  "limit": 100
}
# Analiza un símbolo y genera señal
# Usa configuración global automáticamente

POST /api/trading/signals
Body: {
  "symbols": ["BTCUSDT", "ETHUSDT"],
  "interval": "15m"
}
# Analiza múltiples símbolos
```

### Backtesting
```bash
POST /api/backtest/run
Body: {
  "symbol": "BTCUSDT",
  "interval": "1h",
  "initialBalance": 10000,
  "limit": 500
}
# Ejecuta backtest completo
# Usa configuración global automáticamente
# SL, TP, comisiones opcionales (usa defaults si no se especifican)

POST /api/backtest/compare
Body: {
  "symbols": ["BTCUSDT", "ETHUSDT"],
  "interval": "1h",
  "initialBalance": 10000,
  "limit": 500
}
# Compara múltiples símbolos
```

---

## 📦 Tecnologías y Dependencias

### Core
- **Node.js**: v22.16.0
- **NPM**: 11.4.1
- **NestJS**: 11.0.10
- **Nx**: 21.6.5
- **TypeScript**: Latest

### Database & Cache
- **Prisma**: ^6.x (ORM)
- **MariaDB**: 11.5.2-ubi9 (Docker)
- **Redis**: 7-alpine (Docker)
- **ioredis**: ^5.x (Cliente Redis)

### Trading & Analysis
- **binance-api-node**: Cliente oficial de Binance
- **technicalindicators**: Librería de indicadores técnicos

### Validation & Utils
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos
- **dotenv**: Gestión de variables de entorno

---

## ⚙️ Configuración Actual

### Variables de Entorno (.env)
```env
# Binance API Configuration
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
BINANCE_USE_TESTNET=true

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="mysql://nemesis_user:nemesis_pass_2024@localhost:3306/nemesis"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Configuración Global por Defecto

La configuración se guarda en BD y se cachea en Redis. Valores por defecto:

#### Indicadores Técnicos
```json
{
  "rsi": { "period": 14 },
  "macd": { "fastPeriod": 12, "slowPeriod": 26, "signalPeriod": 9 },
  "sma": { "period": 20 },
  "ema": { "period": 20 }
}
```

#### Detección de Tendencias (preparado para Fase 0.5)
```json
{
  "adxPeriod": 14,
  "adxThreshold": 25,
  "ema20Period": 20,
  "ema50Period": 50,
  "ema200Period": 200,
  "lookbackPeriod": 20
}
```

#### Trading
```json
{
  "defaultStopLossPercentage": 2.0,
  "defaultTakeProfitPercentage": 5.0,
  "defaultUseTrailingStop": false,
  "defaultCommissionRate": 0.001,
  "enableTrendFilter": true,
  "minConfidenceToBuy": 60,
  "minConfidenceToSell": 50
}
```

---

## 📈 Flujo de Ejecución Actual

### Flujo de Trading
```
1. Usuario envía POST /api/trading/analyze
   ↓
2. TradingService obtiene config global desde ConfigurationService
   ↓
3. Validación de DTO (class-validator)
   ↓
4. BinanceService obtiene klines históricos
   ↓
5. AnalysisService calcula indicadores con config global
   ↓
6. AnalysisService genera señal con nivel de confianza
   ↓
7. Retorna señal con indicatorSettings usados
```

### Flujo de Backtesting
```
1. Usuario envía POST /api/backtest/run
   ↓
2. BacktestingService obtiene config global
   ↓
3. Usa valores del request o defaults de config global
   ↓
4. Simula trading con configuración:
   - Ejecuta compras cuando señal = BUY (confidence ≥ minConfidenceToBuy)
   - Ejecuta ventas cuando señal = SELL (confidence ≥ minConfidenceToSell)
   - Aplica stop-loss si está configurado
   - Aplica take-profit si está configurado
   - Calcula equity en cada vela
   ↓
5. Retorna resultado con métricas completas
```

### Flujo de Configuración
```
1. Servidor arranca
   ↓
2. ConfigurationService.onModuleInit()
   ↓
3. ¿Existe en Redis? 
   SÍ → Cargar y continuar
   NO → ↓
4. ¿Existe en BD?
   SÍ → Cargar en Redis y continuar
   NO → ↓
5. Crear defaults en BD
   ↓
6. Cargar en Redis
   ↓
7. Sistema listo

---

Cuando se actualiza:
1. Usuario envía PUT /api/config/*
   ↓
2. ConfigurationService actualiza BD
   ↓
3. ConfigurationService actualiza Redis
   ↓
4. Cambios disponibles inmediatamente
```

---

## 🎯 Próximos Pasos Inmediatos

### **FASE 0.5: Detector de Tendencias del Mercado** (0% - PRÓXIMO)

**Objetivo:** Detectar automáticamente la tendencia y adaptar estrategia

**Tareas principales:**

1. **Crear TrendAnalysisService**
   ```typescript
   - detectTrend(klines, settings): MarketTrend
   - calculateADX(klines, period): number
   - calculateEMAs(klines): { ema20, ema50, ema200 }
   - analyzePriceAction(klines): PriceActionResult
   ```

2. **Integrar con AnalysisService**
   ```typescript
   - generateSignal(..., marketTrend): TradeSignal
   - Si BEARISH → return HOLD
   - Si BULLISH → TREND_FOLLOWING
   - Si SIDEWAYS → MEAN_REVERSION
   ```

3. **Actualizar interfaces existentes**
  - Ya tenemos `MarketTrend` interface ✅
  - Ya tenemos `TradingStrategyType` ✅
  - Ya tenemos constantes de tendencias ✅

4. **Testing**
  - Endpoint `/trading/analyze-trend` para probar
  - Validar detección en diferentes mercados
  - Comparar backtest con/sin filtro

**Interfaces ya preparadas:**
```typescript
interface MarketTrend {
  type: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  strength: number;
  confidence: number;
  reason: string;
  indicators: TrendIndicators;
  recommendedStrategy: 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'HOLD';
}
```

---

## 💡 Aprendizajes Clave

### Técnicos
- Cómo funcionan los indicadores técnicos en trading
- Importancia del backtesting con datos reales
- Gestión de riesgo con SL/TP
- Diferencia entre precio de entrada y mark-to-market
- **NUEVO:** Arquitectura de microservicios con módulos globales
- **NUEVO:** Patrón de cache con BD + Redis
- **NUEVO:** Separación de configuración del código

### Arquitectura
- Beneficios del monorepo para compartir código
- Importancia de DTOs para validación
- Separación de concerns (Binance, Analysis, Trading, Backtesting, Configuration)
- Reutilización de lógica entre backtest/paper/live
- **NUEVO:** Módulos Core globales (Prisma, Redis)
- **NUEVO:** Configuración centralizada y persistente
- **NUEVO:** Lazy loading vs Eager loading en cache

### Trading
- El mercado bajista debe evitarse (sin shorts)
- Mercado lateral genera muchas señales falsas
- Trailing stop mejor que stop fijo en tendencias
- Comisiones impactan significativamente en alta frecuencia
- **NUEVO:** Importancia de configuración flexible
- **NUEVO:** Testing con diferentes parámetros revela patrones

### Base de Datos
- **NUEVO:** Prisma facilita enormemente el trabajo con BD
- **NUEVO:** Redis como cache acelera significativamente
- **NUEVO:** Modelado de datos para trading bots
- **NUEVO:** Estrategia de TTL para cache

---

## 🚀 Para el Siguiente Chat

### Contexto rápido:
"Hemos completado la **Fase 0: Indicadores Configurables** incluyendo un sistema avanzado de configuración global con BD (Prisma + MariaDB) y cache (Redis). El bot ahora carga la configuración al inicio desde BD/cache, y la usa automáticamente en todos los requests. Tenemos endpoints CRUD para gestionar la configuración.

Ahora vamos a implementar la **Fase 0.5: Detector de Tendencias del Mercado** para que el bot detecte automáticamente si el mercado está BULLISH/BEARISH/SIDEWAYS y adapte su estrategia de trading. Ya tenemos todas las interfaces y constantes preparadas."

### Archivos clave del sistema:

**Configuración:**
- `libs/nemesis-commons/src/interfaces.ts` (interfaces completas)
- `libs/nemesis-commons/src/constants.ts` (defaults y validaciones)
- `apps/nemesis-server/src/app/features/configuration/configuration.service.ts`
- `apps/nemesis-server/src/app/core/prisma/prisma.service.ts`
- `apps/nemesis-server/src/app/core/redis/redis.service.ts`

**Trading:**
- `apps/nemesis-server/src/app/features/strategy/analysis.service.ts`
- `apps/nemesis-server/src/app/features/strategy/trading.service.ts`
- `apps/nemesis-server/src/app/features/backtesting/backtesting.service.ts`

**Base de Datos:**
- `prisma/schema.prisma`

### Comandos útiles:

```bash
# Iniciar infraestructura
docker-compose up -d

# Iniciar servidor
npx nx serve nemesis-server

# Ver BD
npx prisma studio

# Test de análisis
curl -X POST http://localhost:3000/api/trading/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","interval":"1h","limit":100}'

# Ver configuración actual
curl http://localhost:3000/api/config

# Actualizar configuración
curl -X PUT http://localhost:3000/api/config/indicators \
  -H "Content-Type: application/json" \
  -d '{"rsi":{"period":10}}'

# Test de backtest
curl -X POST http://localhost:3000/api/backtest/run \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","interval":"1h","initialBalance":10000,"limit":500}'

# Conectar a Redis
docker exec -it nemesis-redis redis-cli
GET bot:configuration
```

### Estado de Docker:
```bash
# Verificar contenedores
docker-compose ps

# Deberías ver:
# nemesis-mariadb - Up - 3306
# nemesis-redis   - Up - 6379
```

---

## 📚 Documentación Relacionada

- [README.md](README.md) - Documentación principal del proyecto
- [ROADMAP.md](ROADMAP.md) - Plan completo de desarrollo actualizado
- [Binance API Docs](https://binance-docs.github.io/apidocs/)
- [Technical Indicators Docs](https://github.com/anandanand84/technicalindicators)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)

---

## 🐛 Issues Conocidos

Ninguno por el momento. El sistema funciona perfectamente.

---

## 📝 Decisiones de Diseño Importantes

### 1. **Sistema de Configuración Global**
- Configuración persistente en BD (MariaDB)
- Cache en Redis (24h TTL) para performance
- Carga al inicio del servidor (onModuleInit)
- Actualización atómica (BD → Redis)
- Sin archivos JSON locales

**Ventajas:**
- Un solo lugar de verdad (BD)
- Alta performance (cache)
- Fácil de cambiar sin reiniciar
- Preparado para multi-instancia

### 2. **Módulos Core Globales**
- PrismaModule y RedisModule son @Global()
- Se inyectan en cualquier servicio sin importar
- Conexión única compartida
- Desconexión automática al cerrar app

### 3. **Configuración Opcional en Requests**
- Requests NO envían indicatorSettings
- Sistema usa config global automáticamente
- SL/TP/comisiones opcionales en backtest
- Si no se envían, usa defaults de config global

### 4. **Equity se calcula en cada vela**
- Representa el valor mark-to-market de la cuenta
- Incluye balance + valor de posiciones abiertas
- Permite calcular drawdown preciso
- Útil para visualización de curva de capital

### 5. **Trades vs Operations**
- `totalOperations`: Suma de todas las BUY + SELL
- `completedTrades`: Pares completos (BUY + SELL)
- `winningTrades`/`losingTrades`: Se cuentan solo pares completos

### 6. **Estrategia de señales actual**
- Sistema de puntuación acumulativa
- Múltiples indicadores contribuyen al score
- Umbrales configurables (minConfidenceToBuy, minConfidenceToSell)
- Explicación clara del razonamiento

### 7. **Gestión de posiciones**
- Por ahora: Solo LONG (compra)
- Futuro: Agregar SHORT (venta)
- Una posición a la vez
- 95% del balance por operación (5% de margen)

### 8. **Preparación para Fase 0.5**
- Interfaces `MarketTrend` ya creadas
- Tipos `MarketTrendType` y `TradingStrategyType` listos
- Constantes `DEFAULT_TREND_DETECTION_SETTINGS` definidas
- Campos en `TradeSignal` y `BacktestResult` agregados
- Solo falta implementar TrendAnalysisService

---

**Última actualización:** 23 Oct 2025 23:59  
**Estado:** ✅ Fase 0 Completada | 🚧 Fase 0.5 Lista para Comenzar  
**Próxima sesión:** Implementar TrendAnalysisService y detector de tendencias
