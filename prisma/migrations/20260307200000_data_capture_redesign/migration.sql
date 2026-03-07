-- AlterTable: submissions
-- Make equity_percentage nullable (shares-only submissions may not have it)
ALTER TABLE "submissions" ALTER COLUMN "equity_percentage" DROP NOT NULL;

-- Drop old range-based columns
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "cash_comp_range";
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "annual_bonus_range";
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "commission_range";
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "retention_range";
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "sign_on_range";

-- Add new direct-amount columns
ALTER TABLE "submissions" ADD COLUMN "contract_type" TEXT;
ALTER TABLE "submissions" ADD COLUMN "monthly_salary" DECIMAL(12,2);
ALTER TABLE "submissions" ADD COLUMN "annual_bonus" DECIMAL(12,2);
ALTER TABLE "submissions" ADD COLUMN "commission" DECIMAL(12,2);
ALTER TABLE "submissions" ADD COLUMN "retention_amount" DECIMAL(12,2);
ALTER TABLE "submissions" ADD COLUMN "sign_on_amount" DECIMAL(12,2);

-- AlterTable: grants
-- Make equity_percentage nullable
ALTER TABLE "grants" ALTER COLUMN "equity_percentage" DROP NOT NULL;

-- Add valuation context columns
ALTER TABLE "grants" ADD COLUMN "current_share_price" DECIMAL(14,2);
ALTER TABLE "grants" ADD COLUMN "last_valuation" DECIMAL(16,2);
