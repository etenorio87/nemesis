# 🤖 Nemesis Trading Bot - Estado Actual del Proyecto

**Fecha:** 21 de Octubre, 2025  
**Versión:** MVP Completado  
**Próximo paso:** Fase 0 - Indicadores Configurables

---

## 📊 Estado General

### ✅ Completado (MVP Funcional)

El bot está **100% funcional** con las siguientes capacidades:

#### 1. **Integración con Binance API**
- ✅ Conexión a Testnet y Mainnet
- ✅ Obtención de precios en tiempo real
- ✅ Lectura de klines (velas históricas)
- ✅ Health check de conexión
- ✅ Información de cuenta

#### 2. **Análisis Técnico**
- ✅ RSI (Relative Strength Index) - 14 periodos
- ✅ MACD (Moving Average Convergence Divergence) - 12/26/9
- ✅ SMA (Simple Moving Average) - 20 periodos
- ✅ EMA (Exponential Moving Average) - 20 periodos

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

#### 6. **Arquitectura y Código**
- ✅ Monorepo con Nx
- ✅ Backend NestJS profesional
- ✅ DTOs con validación (class-validator)
- ✅ Biblioteca compartida (nemesis-commons)
- ✅ Método POST con validación para todos los endpoints
- ✅ Estructura modular y escalable

---

## 🏗️ Estructura del Proyecto

```
nemesis/
├── apps/
│   ├── nemesis-server/          ✅ Backend funcional
│   │   ├── binance/              ✅ Integración Binance API
│   │   ├── analysis/             ✅ Análisis técnico
│   │   ├── trading/              ✅ Generación de señales
│   │   ├── backtesting/          ✅ Sistema de backtesting
│   │   └── reports/              ⚠️  Creado pero descartado (futuro en app)
│   │
│   └── nemesis-app/              📋 Scaffold básico (sin desarrollo)
│
├── libs/
│   └── nemesis-commons/          ✅ Tipos compartidos, DTOs
│
├── .env                          ✅ Configuración de API keys
├── README.md                     ✅ Documentación profesional
└── package.json                  ✅ Dependencias instaladas
```

---

## 🔌 API Endpoints Disponibles

### Health & Status
```bash
GET /api/health
# Verifica conexión con Binance
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
  "limit": 500,
  "stopLossPercentage": 2,
  "takeProfitPercentage": 5,
  "useTrailingStop": false,
  "commissionRate": 0.001
}
# Ejecuta backtest completo

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

### Trading & Analysis
- **binance-api-node**: Cliente oficial de Binance
- **technicalindicators**: Librería de indicadores técnicos

### Validation & Utils
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos
- **dotenv**: Gestión de variables de entorno

### Planned (not installed)
- Redis (7-alpine) - Futuro
- MariaDB (11.5.2-ubi9) - Futuro

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
```

### Parámetros por Defecto

#### Indicadores Técnicos
- **RSI**: 14 periodos
- **MACD**: Fast 12, Slow 26, Signal 9
- **SMA**: 20 periodos
- **EMA**: 20 periodos

#### Trading
- **Comisión**: 0.1% por operación
- **Balance inicial**: 10,000 USDT
- **Inversión por trade**: 95% del balance disponible
- **Stop-loss**: No configurado por defecto
- **Take-profit**: No configurado por defecto

#### Señales
- **BUY threshold**: Confianza ≥ 60%
- **SELL threshold**: Confianza ≥ 50%
- **HOLD**: Confianza < 50%

---

## 📈 Flujo de Ejecución Actual

```
1. Usuario envía POST request
   ↓
2. Validación de DTO (class-validator)
   ↓
3. BinanceService obtiene klines históricos
   ↓
4. AnalysisService calcula indicadores técnicos
   ↓
5. AnalysisService genera señal con nivel de confianza
   ↓
6. BacktestingService simula trading:
   - Ejecuta compras cuando señal = BUY (confidence ≥ 60%)
   - Ejecuta ventas cuando señal = SELL (confidence ≥ 50%)
   - Aplica stop-loss si está configurado
   - Aplica take-profit si está configurado
   - Calcula equity en cada vela
   ↓
7. Retorna resultado con métricas completas
```

---

## 🎯 Próximos Pasos Inmediatos

### **FASE 0: Indicadores Configurables** (2-3 días)

**Objetivo:** Permitir al usuario configurar parámetros de indicadores

**Tareas pendientes:**
1. Crear `IndicatorSettings` interface en nemesis-commons
2. Actualizar DTOs para aceptar `indicatorSettings` opcional
3. Modificar `AnalysisService.analyzeTechnicals()` para usar config personalizada
4. Agregar validación de rangos
5. Probar diferentes combinaciones

**Ejemplo de request objetivo:**
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

### **FASE 0.5: Detector de Tendencias** (4-6 días)

**Objetivo:** Detectar automáticamente la tendencia del mercado y adaptar estrategia

**Flujo mejorado:**
```
1. Usuario envía request (con/sin indicatorSettings)
   ↓
2. Sistema obtiene klines
   ↓
3. ⭐ TrendAnalysisService detecta tendencia (BULLISH/BEARISH/SIDEWAYS)
   ↓
4. Si BEARISH → Retornar HOLD (no operar)
   ↓
5. Seleccionar estrategia según tendencia:
   - BULLISH → Trend Following
   - SIDEWAYS → Mean Reversion
   ↓
6. Calcular indicadores con pesos ajustados
   ↓
7. Generar señal considerando tendencia
   ↓
8. Ejecutar trade/backtest
```

**Componentes a crear:**
- `TrendAnalysisService`
- `MarketTrend` interface
- `Strategy` interface
- Adaptación de `generateSignal()` para recibir tendencia

---

## 🐛 Issues Conocidos

Ninguno por el momento. El sistema funciona correctamente.

---

## 📝 Decisiones de Diseño Importantes

### 1. **Equity se calcula en cada vela**
- Representa el valor mark-to-market de la cuenta
- Incluye balance + valor de posiciones abiertas
- Permite calcular drawdown preciso
- Útil para visualización de curva de capital

### 2. **Trades vs Operations**
- `totalOperations`: Suma de todas las BUY + SELL
- `completedTrades`: Pares completos (BUY + SELL)
- `winningTrades`/`losingTrades`: Se cuentan solo pares completos

### 3. **Estrategia de señales actual**
- Sistema de puntuación acumulativa
- Múltiples indicadores contribuyen al score
- Umbrales diferentes para BUY (60%) y SELL (50%)
- Explicación clara del razonamiento

### 4. **Gestión de posiciones**
- Por ahora: Solo LONG (compra)
- Futuro: Agregar SHORT (venta)
- Una posición a la vez
- 95% del balance por operación (5% de margen)

### 5. **Reportes descartados temporalmente**
- Se creó `ReportsModule` con generación de HTML
- Decisión: Posponer para app móvil
- Razón: Mejor UX en aplicación nativa

---

## 💡 Aprendizajes Clave

### Técnicos
- Cómo funcionan los indicadores técnicos en trading
- Importancia del backtesting con datos reales
- Gestión de riesgo con SL/TP
- Diferencia entre precio de entrada y mark-to-market

### Arquitectura
- Beneficios del monorepo para compartir código
- Importancia de DTOs para validación
- Separación de concerns (Binance, Analysis, Trading, Backtesting)
- Reutilización de lógica entre backtest/paper/live

### Trading
- El mercado bajista debe evitarse (sin shorts)
- Mercado lateral genera muchas señales falsas
- Trailing stop mejor que stop fijo en tendencias
- Comisiones impactan significativamente en alta frecuencia

---

## 🚀 Para el Siguiente Chat

### Contexto rápido:
"Tenemos un bot de trading funcional con análisis técnico, backtesting, stop-loss y take-profit. Acabamos de completar el MVP. Ahora vamos a implementar la **Fase 0: Indicadores Configurables** para permitir que el usuario personalice los parámetros de RSI, MACD, SMA y EMA desde el request."

### Archivos clave a revisar:
- `libs/nemesis-commons/src/lib/nemesis-commons.ts` (tipos y DTOs)
- `apps/nemesis-server/src/analysis/analysis.service.ts` (lógica de indicadores)
- `apps/nemesis-server/src/backtesting/backtesting.service.ts` (backtesting)
- `apps/nemesis-server/src/trading/trading.controller.ts` (endpoints)

### Comandos útiles:
```bash
# Iniciar servidor
npx nx serve nemesis-server

# Test de análisis
curl -X POST http://localhost:3000/api/trading/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","interval":"1h","limit":100}'

# Test de backtest
curl -X POST http://localhost:3000/api/backtest/run \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","interval":"1h","initialBalance":10000,"limit":500}'
```

---

## 📚 Documentación Relacionada

- [README.md](README.md) - Documentación principal del proyecto
- [Roadmap](roadmap.md) - Plan completo de desarrollo (Fases 0-7)
- [Binance API Docs](https://binance-docs.github.io/apidocs/)
- [Technical Indicators Docs](https://github.com/anandanand84/technicalindicators)

---

**Última actualización:** 21 Oct 2025  
**Estado:** ✅ MVP Funcional - Listo para Fase 0
