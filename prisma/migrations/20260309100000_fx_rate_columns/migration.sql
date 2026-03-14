-- AlterTable: add FX rate columns to submissions
ALTER TABLE "submissions" ADD COLUMN "fx_rate_used" DECIMAL(10,4);
ALTER TABLE "submissions" ADD COLUMN "fx_rate_date" TIMESTAMP(3);

-- Backfill: all existing rows are USD, so fxRateUsed = 1.0
UPDATE "submissions" SET "fx_rate_used" = 1.0 WHERE "fx_rate_used" IS NULL;
