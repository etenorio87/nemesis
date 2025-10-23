# 🚀 Guía de Inicio Rápido - Nemesis Trading Bot

**Para comenzar en el próximo chat**

---

## ✅ Estado Actual del Proyecto

- ✅ **Fase 0 COMPLETADA** - Indicadores configurables con BD + Redis
- 🚧 **Fase 0.5 LISTA** - Detector de tendencias (interfaces preparadas)
- ✅ Infraestructura completa (Docker, Prisma, Redis)
- ✅ Sistema de configuración global funcionando

---

## 🎯 Próximo Objetivo: Fase 0.5

**Implementar Detector de Tendencias del Mercado**

### ¿Qué hay que hacer?

1. Crear `TrendAnalysisService` con:
  - Cálculo de ADX (Average Directional Index)
  - Cálculo de EMAs múltiples (20, 50, 200)
  - Análisis de Price Action (Higher Highs/Lows)
  - Determinación de tendencia (BULLISH/BEARISH/SIDEWAYS)

2. Integrar en `AnalysisService`:
  - Llamar a TrendAnalysisService antes de generar señal
  - Filtrar mercados BEARISH (retornar HOLD)
  - Adaptar estrategia según tendencia

3. Actualizar servicios existentes:
  - TradingService: agregar detección de tendencia
  - BacktestingService: trackear métricas por tendencia

4. Crear endpoint de prueba:
  - `POST /api/trading/analyze-trend` - solo ver tendencia

---

## 🔧 Comandos Iniciales

### 1. Iniciar Infraestructura
```bash
# Iniciar Docker (MariaDB + Redis)
docker-compose up -d

# Verificar que estén corriendo
docker-compose ps
```

### 2. Compilar y Arrancar
```bash
# Compilar nemesis-commons
npx nx build nemesis-commons

# Iniciar servidor
npx nx serve nemesis-server
```

### 3. Verificar que todo funciona
```bash
# Health check
curl http://localhost:3000/api/health

# Ver configuración actual
curl http://localhost:3000/api/config

# Test de análisis
curl -X POST http://localhost:3000/api/trading/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","interval":"1h","limit":100}'
```

---

## 📁 Archivos Clave

### Para leer primero:
1. `ROADMAP.md` - Plan completo actualizado
2. `CLAUDE_STATUS.md` - Estado detallado del proyecto
3. `libs/nemesis-commons/src/interfaces.ts` - Ver interfaces preparadas

### Para modificar en Fase 0.5:
1. `apps/nemesis-server/src/app/features/strategy/trend-analysis.service.ts` (CREAR)
2. `apps/nemesis-server/src/app/features/strategy/analysis.service.ts` (MODIFICAR)
3. `apps/nemesis-server/src/app/features/strategy/trading.service.ts` (MODIFICAR)

---

## 🗂️ Estructura de Carpetas Actual

```
nemesis/
├── apps/
│   └── nemesis-server/
│       ├── core/
│       │   ├── prisma/          ✅ PrismaService
│       │   └── redis/           ✅ RedisService
│       └── features/
│           ├── binance/         ✅ BinanceService
│           ├── strategy/        ✅ AnalysisService, TradingService
│           ├── backtesting/     ✅ BacktestingService
│           └── configuration/   ✅ ConfigurationService
│
├── libs/
│   └── nemesis-commons/         ✅ Interfaces completas
│
├── prisma/
│   └── schema.prisma            ✅ Esquema de BD
│
├── docker-compose.yml           ✅ MariaDB + Redis
└── .env                         ✅ Configuración
```

---

## 💾 Tecnologías Usadas

- **Node.js** v22.16.0
- **NestJS** 11.0.10
- **Nx** 21.6.5
- **Prisma** (ORM para MariaDB)
- **Redis** (Cache)
- **MariaDB** 11.5.2 (Base de datos)
- **Docker** (Contenedores)
- **TypeScript**

---

## 🔑 Conceptos Clave

### Sistema de Configuración Global
- Configuración en BD (MariaDB via Prisma)
- Cache en Redis (24h TTL)
- Se carga al inicio del servidor
- Se usa automáticamente en todos los requests
- No se envía en cada request

### Flujo de Detección de Tendencias (Fase 0.5)
```
Request → Obtener klines → Detectar tendencia → 
Si BEARISH: return HOLD → 
Si BULLISH: TREND_FOLLOWING → 
Si SIDEWAYS: MEAN_REVERSION → 
Calcular indicadores → Generar señal
```

### Interfaces Preparadas
```typescript
// Ya están creadas en nemesis-commons:
interface MarketTrend {
  type: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  strength: number;
  confidence: number;
  reason: string;
  indicators: TrendIndicators;
  recommendedStrategy: TradingStrategyType;
}

interface TrendDetectionSettings {
  adxPeriod: number;
  adxThreshold: number;
  ema20Period: number;
  ema50Period: number;
  ema200Period: number;
  lookbackPeriod: number;
}
```

---

## 🧪 Tests Rápidos

### Ver configuración actual
```bash
curl http://localhost:3000/api/config
```

### Actualizar configuración
```bash
curl -X PUT http://localhost:3000/api/config/indicators \
  -H "Content-Type: application/json" \
  -d '{"rsi":{"period":10},"macd":{"fastPeriod":8,"slowPeriod":21,"signalPeriod":5}}'
```

### Análisis de símbolo
```bash
curl -X POST http://localhost:3000/api/trading/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","interval":"1h","limit":100}'
```

### Backtest
```bash
curl -X POST http://localhost:3000/api/backtest/run \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","interval":"1h","initialBalance":10000,"limit":500}'
```

---

## 📚 Documentación Útil

- [Binance API](https://binance-docs.github.io/apidocs/)
- [Technical Indicators Library](https://github.com/anandanand84/technicalindicators)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Redis Docs](https://redis.io/docs/)
- [NestJS Docs](https://docs.nestjs.com/)

---

## 🎓 Para Recordar

### Librería `technicalindicators` ya instalada
- Incluye ADX, todas las EMAs, RSI, MACD, etc.
- Documentación: https://github.com/anandanand84/technicalindicators
- Importar: `import { ADX, EMA } from 'technicalindicators';`

### Patrón de los servicios
```typescript
// Todos los servicios siguen este patrón:
constructor(
  private readonly configService: ConfigurationService,
  // ... otros servicios
) {}

// Obtener config:
const config = await this.configService.getIndicatorSettings();
```

### Logging
```typescript
private readonly logger = new Logger(NombreDelServicio.name);

this.logger.log('Mensaje informativo');
this.logger.debug('Mensaje de debug');
this.logger.error('Mensaje de error', error);
this.logger.warn('Mensaje de advertencia');
```

---

## ⚡ Inicio Rápido en Nuevo Chat

**Dile a Claude:**

> "Tenemos el bot de trading Nemesis con la Fase 0 completada (indicadores configurables + BD + Redis). Ahora vamos a implementar la **Fase 0.5: Detector de Tendencias del Mercado**.
>
> Ya tenemos las interfaces `MarketTrend` y `TrendDetectionSettings` creadas en nemesis-commons, y las constantes por defecto definidas.
>
> Necesitamos crear el `TrendAnalysisService` que:
> 1. Calcule ADX para detectar fuerza de tendencia
> 2. Calcule EMAs 20/50/200 para detectar dirección
> 3. Analice price action (Higher Highs/Lows)
> 4. Combine todo para determinar BULLISH/BEARISH/SIDEWAYS
>
> Luego integrar esto en `AnalysisService` para que filtre mercados BEARISH y adapte la estrategia según la tendencia.
>
> ¿Empezamos con el `TrendAnalysisService`?"

---

## 🎯 Objetivo de la Sesión

Al final de la próxima sesión deberíamos tener:
- ✅ TrendAnalysisService implementado y funcionando
- ✅ Integración en AnalysisService
- ✅ Endpoint `/trading/analyze-trend` para testing
- ✅ Tests mostrando detección correcta de tendencias
- ✅ Filtro BEARISH funcionando (no opera en bajista)

---

**¡Buena suerte con la siguiente fase!** 🚀

---

**Creado:** 23 Oct 2025  
**Última actualización:** 23 Oct 2025  
**Versión:** 1.0
