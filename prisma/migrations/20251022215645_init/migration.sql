-- CreateTable
CREATE TABLE `bot_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `version` VARCHAR(191) NOT NULL DEFAULT '1.0.0',
    `rsiPeriod` INTEGER NOT NULL DEFAULT 14,
    `macdFastPeriod` INTEGER NOT NULL DEFAULT 12,
    `macdSlowPeriod` INTEGER NOT NULL DEFAULT 26,
    `macdSignalPeriod` INTEGER NOT NULL DEFAULT 9,
    `smaPeriod` INTEGER NOT NULL DEFAULT 20,
    `emaPeriod` INTEGER NOT NULL DEFAULT 20,
    `adxPeriod` INTEGER NOT NULL DEFAULT 14,
    `adxThreshold` INTEGER NOT NULL DEFAULT 25,
    `ema20Period` INTEGER NOT NULL DEFAULT 20,
    `ema50Period` INTEGER NOT NULL DEFAULT 50,
    `ema200Period` INTEGER NOT NULL DEFAULT 200,
    `lookbackPeriod` INTEGER NOT NULL DEFAULT 20,
    `defaultStopLoss` DOUBLE NOT NULL DEFAULT 2.0,
    `defaultTakeProfit` DOUBLE NOT NULL DEFAULT 5.0,
    `useTrailingStop` BOOLEAN NOT NULL DEFAULT false,
    `commissionRate` DOUBLE NOT NULL DEFAULT 0.001,
    `enableTrendFilter` BOOLEAN NOT NULL DEFAULT true,
    `minConfidenceBuy` INTEGER NOT NULL DEFAULT 60,
    `minConfidenceSell` INTEGER NOT NULL DEFAULT 50,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `reason` TEXT NOT NULL,
    `profitLoss` DOUBLE NULL,
    `profitLossPercent` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trades_symbol_idx`(`symbol`),
    INDEX `trades_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `signals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `signal` VARCHAR(191) NOT NULL,
    `confidence` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `signals_symbol_idx`(`symbol`),
    INDEX `signals_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backtest_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `interval` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `initialBalance` DOUBLE NOT NULL,
    `finalBalance` DOUBLE NOT NULL,
    `profitLoss` DOUBLE NOT NULL,
    `profitLossPercent` DOUBLE NOT NULL,
    `winRate` DOUBLE NOT NULL,
    `totalTrades` INTEGER NOT NULL,
    `winningTrades` INTEGER NOT NULL,
    `losingTrades` INTEGER NOT NULL,
    `maxDrawdown` DOUBLE NOT NULL,
    `configSnapshot` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `backtest_results_symbol_idx`(`symbol`),
    INDEX `backtest_results_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
