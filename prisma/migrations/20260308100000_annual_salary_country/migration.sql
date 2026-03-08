-- Add country and currency fields for multi-market support
ALTER TABLE "submissions" ADD COLUMN "country" TEXT;
ALTER TABLE "submissions" ADD COLUMN "currency" TEXT DEFAULT 'USD';

-- Rename monthly_salary to annual_salary (now stores annual amount in USD)
ALTER TABLE "submissions" RENAME COLUMN "monthly_salary" TO "annual_salary";
