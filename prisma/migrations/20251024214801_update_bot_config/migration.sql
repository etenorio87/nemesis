/*
  Warnings:

  - You are about to drop the column `defaultStopLoss` on the `bot_config` table. All the data in the column will be lost.
  - You are about to drop the column `defaultTakeProfit` on the `bot_config` table. All the data in the column will be lost.
  - You are about to drop the column `useTrailingStop` on the `bot_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `bot_config` DROP COLUMN `defaultStopLoss`,
    DROP COLUMN `defaultTakeProfit`,
    DROP COLUMN `useTrailingStop`,
    ADD COLUMN `breakevenThreshold` DOUBLE NOT NULL DEFAULT 0.015,
    ADD COLUMN `maxPositionSize` DOUBLE NOT NULL DEFAULT 0.95,
    ADD COLUMN `stopLossPercent` DOUBLE NOT NULL DEFAULT 0.015,
    ADD COLUMN `takeProfitPercent` DOUBLE NOT NULL DEFAULT 0.03,
    ADD COLUMN `trailingStopPercent` DOUBLE NOT NULL DEFAULT 0.008,
    MODIFY `minConfidenceBuy` INTEGER NOT NULL DEFAULT 65,
    MODIFY `minConfidenceSell` INTEGER NOT NULL DEFAULT 55;
