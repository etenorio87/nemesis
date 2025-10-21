# Nemesis Trading Bot 🤖📈

> Sistema automatizado de trading para Binance con análisis técnico y backtesting

[![Node.js](https://img.shields.io/badge/node-v22.16.0-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-v11.0-red.svg)](https://nestjs.com/)
[![Nx](https://img.shields.io/badge/Nx-v21.6.5-blue.svg)](https://nx.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estrategia de Trading](#-estrategia-de-trading)
- [Roadmap](#-roadmap)
- [Contribución](#-contribución)

## ✨ Características

### Versión Actual (MVP)

- 🔍 **Análisis Técnico Avanzado**
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
  - SMA y EMA (Simple & Exponential Moving Averages)

- 📊 **Sistema de Señales**
  - Generación automática de señales BUY/SELL/HOLD
  - Niveles de confianza (0-100%)
  - Explicación detallada de cada señal

- 📈 **Backtesting Completo**
  - Simulación de trading con datos históricos
  - Cálculo de métricas: P/L, Win Rate, Max Drawdown
  - Comisiones de trading configurables
  - Comparación entre múltiples símbolos

- 🔌 **Integración con Binance**
  - Soporte para Testnet y Mainnet
  - Obtención de datos en tiempo real
  - Múltiples intervalos de tiempo (1m, 5m, 15m, 1h, 4h, 1d)

### En Desarrollo

- 📱 App móvil para gestión del bot
- 🤖 Ejecución automática de trades
- 📧 Sistema de notificaciones
- 💾 Almacenamiento persistente (Redis + MariaDB)

## 🏗️ Arquitectura

Este proyecto utiliza **Nx Monorepo** con la siguiente estructura:

```
nemesis/
├── apps/
│   ├── nemesis-server/      # Backend NestJS
│   │   ├── binance/          # Integración con Binance API
│   │   ├── analysis/         # Análisis técnico
│   │   ├── trading/          # Lógica de trading
│   │   └── backtesting/      # Sistema de backtesting
│   │
│   └── nemesis-app/          # App móvil (Angular/Ionic) - WIP
│
├── libs/
│   └── nemesis-commons/      # Tipos y utilidades compartidas
│
└── docker-compose.yml        # Redis + MariaDB (futuro)
```

## 🔧 Requisitos

- **Node.js**: v22.16.0 o superior
- **NPM**: v11.4.1 o superior
- **Cuenta Binance**: Para obtener API keys ([Testnet](https://testnet.binance.vision/))

## 📦 Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/nemesis.git
cd nemesis
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Binance API Configuration
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
BINANCE_USE_TESTNET=true

# Server Configuration
PORT=3000
NODE_ENV=development
```

4. **Obtener API Keys de Binance**

Para testing seguro, usa [Binance Testnet](https://testnet.binance.vision/):
- Accede con tu cuenta GitHub
- Genera tus API Keys
- Copia las credenciales al archivo `.env`

## 🚀 Uso

### Iniciar el servidor

```bash
npm run serve:server
# o
npx nx serve nemesis-server
```

El servidor estará disponible en `http://localhost:3000`

### Verificar conexión

```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "binanceConnected": true,
  "timestamp": "2025-10-21T10:00:00.000Z"
}
```

## 🔌 API Endpoints

### Health Check

```bash
GET /health
```

Verifica el estado del servidor y la conexión con Binance.

### Análisis de Símbolos

```bash
GET /trading/analyze?symbol=BTCUSDT&interval=15m&limit=100
```

**Parámetros:**
- `symbol`: Par de trading (ej: BTCUSDT, ETHUSDT)
- `interval`: 1m, 5m, 15m, 1h, 4h, 1d
- `limit`: Número de velas (default: 100)

**Respuesta:**
```json
{
  "symbol": "BTCUSDT",
  "signal": "BUY",
  "confidence": 75,
  "reason": "Señal de COMPRA: RSI sobreventa (<30), MACD crossover alcista",
  "price": 67500.00,
  "timestamp": "2025-10-21T10:00:00.000Z",
  "indicators": {
    "rsi": 28.5,
    "macd": {
      "MACD": 150.23,
      "signal": 120.45,
      "histogram": 29.78
    },
    "sma": 66800.00,
    "ema": 67000.00
  }
}
```

### Múltiples Señales

```bash
GET /trading/signals?symbols=BTCUSDT,ETHUSDT,BNBUSDT
```

Obtiene señales para múltiples símbolos simultáneamente.

### Backtesting

```bash
GET /backtest/run?symbol=BTCUSDT&interval=1h&balance=10000&limit=500
```

**Parámetros:**
- `symbol`: Par de trading
- `interval`: Intervalo temporal
- `balance`: Balance inicial en USDT (default: 10000)
- `limit`: Número de velas históricas (default: 500)
- `commission`: Comisión por trade (default: 0.001 = 0.1%)

**Respuesta:**
```json
{
  "symbol": "BTCUSDT",
  "interval": "1h",
  "startDate": "2025-09-01T00:00:00.000Z",
  "endDate": "2025-10-21T10:00:00.000Z",
  "initialBalance": 10000,
  "finalBalance": 12450.75,
  "totalTrades": 28,
  "winningTrades": 18,
  "losingTrades": 10,
  "profitLoss": 2450.75,
  "profitLossPercentage": 24.51,
  "winRate": 64.29,
  "maxDrawdown": 8.45,
  "trades": [...]
}
```

### Comparar Símbolos (Backtesting)

```bash
GET /backtest/compare?symbols=BTCUSDT,ETHUSDT,BNBUSDT&interval=1h&balance=10000
```

Ejecuta backtesting en múltiples símbolos para comparar rendimiento.

## 📊 Estrategia de Trading

### Indicadores Utilizados

1. **RSI (14 periodos)**
  - Sobreventa: RSI < 30 → Señal de compra
  - Sobrecompra: RSI > 70 → Señal de venta

2. **MACD (12, 26, 9)**
  - Crossover alcista: MACD > Signal → Señal de compra
  - Crossover bajista: MACD < Signal → Señal de venta

3. **Medias Móviles (SMA/EMA 20)**
  - Precio sobre medias → Tendencia alcista
  - Precio bajo medias → Tendencia bajista

### Sistema de Puntuación

Cada señal tiene un nivel de confianza (0-100%) basado en:
- **RSI extremo**: 40 puntos
- **RSI moderado**: 20 puntos
- **MACD crossover**: 30 puntos
- **Posición vs medias**: 20 puntos

**Umbrales de operación:**
- BUY: Confianza ≥ 60%
- SELL: Confianza ≥ 50%
- HOLD: Confianza < 50%

### Gestión de Riesgo (Backtesting)

- Inversión por trade: 95% del balance disponible
- Comisión predeterminada: 0.1% por operación
- Cierre de posiciones: Basado en señales de venta

## 🗺️ Roadmap

### Fase 1: MVP ✅
- [x] Integración con Binance API
- [x] Análisis técnico básico (RSI, MACD, SMA, EMA)
- [x] Sistema de señales
- [x] Backtesting completo

### Fase 2: Automatización 🚧
- [ ] Ejecución automática de trades
- [ ] Stop-loss y take-profit dinámicos
- [ ] Sistema de notificaciones (Telegram/Email)
- [ ] Dashboard web en tiempo real

### Fase 3: Optimización 📋
- [ ] Machine Learning para optimizar parámetros
- [ ] Múltiples estrategias de trading
- [ ] Portfolio diversificado
- [ ] Paper trading continuo

### Fase 4: Producción 📋
- [ ] Base de datos persistente (Redis + MariaDB)
- [ ] Sistema de logging avanzado
- [ ] Monitoreo y alertas
- [ ] App móvil funcional

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ⚠️ Disclaimer

Este software se proporciona "tal cual" sin garantías de ningún tipo. El trading de criptomonedas conlleva riesgos significativos. **Nunca inviertas más de lo que puedas permitirte perder.**

- Este bot es experimental y debe usarse solo con fines educativos
- Siempre prueba primero en Testnet
- Realiza tu propia investigación (DYOR)
- El rendimiento pasado no garantiza resultados futuros

## 📄 Licencia

MIT License - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@etenorio87](https://github.com/etenorio87)

---

⭐ Si este proyecto te resulta útil, considera darle una estrella!

**Construido con:**
- [NestJS](https://nestjs.com/) - Framework backend
- [Nx](https://nx.dev/) - Monorepo tooling
- [Binance API Node](https://github.com/Ashlar/binance-api-node) - Cliente de Binance
- [Technical Indicators](https://github.com/anandanand84/technicalindicators) - Análisis técnico
