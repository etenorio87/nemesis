/*
  Warnings:

  - You are about to drop the column `minConfidenceBuy` on the `bot_config` table. All the data in the column will be lost.
  - You are about to drop the column `minConfidenceSell` on the `bot_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `bot_config` DROP COLUMN `minConfidenceBuy`,
    DROP COLUMN `minConfidenceSell`,
    ADD COLUMN `minConfidenceToBuy` DOUBLE NOT NULL DEFAULT 65,
    ADD COLUMN `minConfidenceToSell` DOUBLE NOT NULL DEFAULT 55;
