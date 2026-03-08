-- AlterTable: make message optional, add LinkedIn verification fields
ALTER TABLE "access_requests" ALTER COLUMN "message" DROP NOT NULL;

ALTER TABLE "access_requests" ADD COLUMN "linkedin_url" TEXT;
ALTER TABLE "access_requests" ADD COLUMN "linkedin_data" JSONB;
ALTER TABLE "access_requests" ADD COLUMN "role" TEXT;
ALTER TABLE "access_requests" ADD COLUMN "detected_title" TEXT;
ALTER TABLE "access_requests" ADD COLUMN "verification_result" TEXT;
ALTER TABLE "access_requests" ADD COLUMN "verification_reason" TEXT;
ALTER TABLE "access_requests" ADD COLUMN "auto_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "access_requests" ADD COLUMN "request_token" TEXT NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "access_requests" ADD COLUMN "lgpd_consent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "access_requests" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
