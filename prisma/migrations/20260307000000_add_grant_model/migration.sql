-- CreateTable
CREATE TABLE "grants" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "grant_type" TEXT NOT NULL,
    "grant_date" TIMESTAMP(3),
    "grant_label" TEXT,
    "equity_percentage" DECIMAL(10,6) NOT NULL,
    "input_mode" TEXT NOT NULL DEFAULT 'percentage',
    "number_of_shares" INTEGER,
    "total_shares_outstanding" INTEGER,
    "instrument_type" TEXT NOT NULL,
    "strike_price" DECIMAL(14,2),
    "strike_currency" TEXT NOT NULL DEFAULT 'BRL',
    "vesting_total_months" INTEGER NOT NULL,
    "cliff_months" INTEGER NOT NULL,
    "vesting_schedule" TEXT NOT NULL,
    "vesting_start_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (enforces 1:1 in Phase 1)
CREATE UNIQUE INDEX "grants_submission_id_key" ON "grants"("submission_id");

-- AddForeignKey (cascade delete)
ALTER TABLE "grants" ADD CONSTRAINT "grants_submission_id_fkey"
    FOREIGN KEY ("submission_id") REFERENCES "submissions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: create a Grant for each active submission
INSERT INTO "grants" (
    "id", "submission_id", "grant_type", "equity_percentage",
    "instrument_type", "vesting_total_months", "cliff_months",
    "vesting_schedule", "updated_at"
)
SELECT
    gen_random_uuid()::text,
    "id",
    "grant_type",
    "equity_percentage",
    "instrument_type",
    "vesting_total_months",
    "cliff_months",
    "vesting_schedule",
    NOW()
FROM "submissions"
WHERE "status" = 'active';
