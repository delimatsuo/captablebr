-- Phase 1: Add nullable columns for role_level and role_function taxonomy
-- DO NOT SET NOT NULL — deferred to phase 2 after both envs run new code

-- Add columns
ALTER TABLE "submissions" ADD COLUMN "role_level" TEXT;
ALTER TABLE "submissions" ADD COLUMN "role_function" TEXT;

-- Backfill from legacy role column
UPDATE "submissions" SET
  role_level = CASE role
    WHEN 'CEO' THEN 'CEO'
    WHEN 'COO' THEN 'C-Level'
    WHEN 'CFO' THEN 'C-Level'
    WHEN 'CTO' THEN 'C-Level'
    WHEN 'CMO' THEN 'C-Level'
    WHEN 'CRO/VP Sales' THEN 'C-Level'
    WHEN 'CPO/VP Product' THEN 'C-Level'
    WHEN 'CHRO/VP People' THEN 'C-Level'
    WHEN 'VP Engineering' THEN 'VP'
    WHEN 'Other C-Level' THEN 'C-Level'
    WHEN 'Other VP' THEN 'VP'
    ELSE 'C-Level'
  END,
  role_function = CASE role
    WHEN 'CEO' THEN NULL
    WHEN 'COO' THEN 'Operations'
    WHEN 'CFO' THEN 'Finance'
    WHEN 'CTO' THEN 'Engineering'
    WHEN 'CMO' THEN 'Marketing'
    WHEN 'CRO/VP Sales' THEN 'Sales/Revenue'
    WHEN 'CPO/VP Product' THEN 'Product'
    WHEN 'CHRO/VP People' THEN 'People/HR'
    WHEN 'VP Engineering' THEN 'Engineering'
    WHEN 'Other C-Level' THEN 'Other'
    WHEN 'Other VP' THEN 'Other'
    ELSE 'Other'
  END;

-- New composite index (additive — do NOT drop old role+stage index)
CREATE INDEX "submissions_role_level_function_stage_idx"
  ON "submissions" ("role_level", "role_function", "stage");
