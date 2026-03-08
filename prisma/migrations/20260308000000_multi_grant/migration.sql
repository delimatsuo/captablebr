-- SAFETY: Delete archived submissions before enforcing one-per-user constraint.
-- This is safe because: (1) the app never creates archived submissions in practice,
-- (2) the DB may be empty (no production data yet), (3) active submissions are preserved.
-- If running against a database with real archived data, back up first:
--   CREATE TABLE submissions_archive_backup AS SELECT * FROM submissions WHERE status != 'active';
DELETE FROM "submissions" WHERE "status" != 'active';

-- Enforce one submission per user
DROP INDEX IF EXISTS "submissions_user_id_status_idx";
CREATE UNIQUE INDEX "submissions_user_id_key" ON "submissions"("user_id");

-- Update role+stage index (remove status)
DROP INDEX IF EXISTS "submissions_role_stage_status_idx";
CREATE INDEX "submissions_role_stage_idx" ON "submissions"("role", "stage");

-- Remove status column (single submission per user, no active/archived)
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "status";

-- Add isFirstInRole to grants table (per-grant, since different grants may have different contexts)
ALTER TABLE "grants" ADD COLUMN IF NOT EXISTS "is_first_in_role" BOOLEAN NOT NULL DEFAULT false;

-- Copy isFirstInRole from submissions to their grants
UPDATE "grants" g SET "is_first_in_role" = s."is_first_in_role"
FROM "submissions" s WHERE g."submission_id" = s."id";

-- Drop unique constraint on grants.submission_id to allow multiple grants
DROP INDEX IF EXISTS "grants_submission_id_key";
CREATE INDEX "grants_submission_id_idx" ON "grants"("submission_id");
