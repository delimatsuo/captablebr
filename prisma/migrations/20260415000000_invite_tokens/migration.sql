-- Add invite_token (nullable, unique) and invited_email (nullable)
ALTER TABLE "invitations" ADD COLUMN "invite_token" TEXT;
ALTER TABLE "invitations" ADD COLUMN "invited_email" TEXT;

-- Backfill tokens for all existing rows
UPDATE "invitations" SET "invite_token" = gen_random_uuid()::text WHERE "invite_token" IS NULL;

-- Unique index (allows multiple NULLs per PostgreSQL semantics)
CREATE UNIQUE INDEX "invitations_invite_token_key" ON "invitations"("invite_token");

-- Default for future inserts
ALTER TABLE "invitations" ALTER COLUMN "invite_token" SET DEFAULT gen_random_uuid()::text;
