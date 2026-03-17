import { PrismaClient } from "@prisma/client";
import { ALLOCATION_MATRIX } from "./seed-data.ts";
import { seededRandom, generateSubmission } from "./seed-generators.ts";

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");
const CLEAR = process.argv.includes("--clear");
const SEED_PREFIX = "seed-";

if (process.env.NODE_ENV === "production") {
  console.error("ERROR: seed.ts must not run in production");
  process.exit(1);
}

async function main() {
  console.log(`Seed mode: ${DRY_RUN ? "DRY RUN (no DB writes)" : "LIVE"}`);

  if (CLEAR && !DRY_RUN) {
    console.log("Clearing existing seed data...");
    // Grants cascade via onDelete: Cascade
    const { count } = await prisma.submission.deleteMany({
      where: { userId: { startsWith: SEED_PREFIX } },
    });
    console.log(`  Deleted ${count} seed submissions`);
  }

  // Upsert invitations
  if (!DRY_RUN) {
    for (const { email, status } of [
      { email: "dev@captablebr.com", status: "accepted" },
      { email: "deli@ellaexecutivesearch.com", status: "pending" },
      { email: "delimatsuo@gmail.com", status: "pending" },
    ]) {
      await prisma.invitation.upsert({
        where: { email },
        create: { email, status },
        update: {},
      });
    }
    console.log("Invitations upserted");
  }

  // Dev user submission
  if (!DRY_RUN) {
    const existingDev = await prisma.submission.findUnique({
      where: { userId: "dev-user-001" },
    });
    if (!existingDev) {
      await prisma.submission.create({
        data: {
          userId: "dev-user-001",
          stage: "Series A",
          businessModel: "B2B",
          sector: "Fintech",
          headcountRange: "11-50",
          role: "CTO",
          roleLevel: "C-Level",
          roleFunction: "Engineering",
          country: "US",
          currency: "USD",
          fxRateUsed: 1.0,
          annualSalary: 280000,
          hasAnnualBonus: true,
          annualBonus: 120000,
          contractType: "CLT",
          yearsExperience: "10-15",
          hireYear: 2023,
          instrumentType: "Stock Options",
          equityPercentage: 1.5,
          vestingTotalMonths: 48,
          cliffMonths: 12,
          vestingSchedule: "Monthly after cliff",
          grantType: "New-hire",
          isFirstInRole: true,
          confirmedByUser: true,
          grants: {
            create: {
              instrumentType: "Stock Options",
              equityPercentage: 1.5,
              vestingTotalMonths: 48,
              cliffMonths: 12,
              vestingSchedule: "Monthly after cliff",
              grantType: "New-hire",
              isFirstInRole: true,
              inputMode: "percentage",
              strikePrice: 2.50,
              strikeCurrency: "USD",
            },
          },
        },
      });
      console.log("Dev user submission created");
    } else {
      console.log("Dev user submission already exists, skipping");
    }
  }

  // Generate synthetic submissions
  const rng = seededRandom(42);
  let totalCreated = 0;
  const distribution: Record<string, Record<string, number>> = {};

  for (const { role, stage, count } of ALLOCATION_MATRIX) {
    if (!distribution[role]) distribution[role] = {};
    distribution[role][stage] = count;

    for (let i = 0; i < count; i++) {
      const { submission, grants } = generateSubmission(role, stage, i, rng);

      if (!DRY_RUN) {
        await prisma.submission.create({
          data: {
            userId: submission.userId,
            stage: submission.stage,
            businessModel: submission.businessModel,
            sector: submission.sector,
            headcountRange: submission.headcountRange,
            role: submission.role,
            roleLevel: submission.roleLevel,
            roleFunction: submission.roleFunction,
            country: submission.country,
            currency: submission.currency,
            fxRateUsed: submission.fxRateUsed,
            contractType: submission.contractType,
            annualSalary: submission.annualSalary,
            hasAnnualBonus: submission.hasAnnualBonus,
            annualBonus: submission.annualBonus,
            hasCommission: submission.hasCommission,
            commission: submission.commission,
            hasRetentionPlan: submission.hasRetentionPlan,
            retentionAmount: submission.retentionAmount,
            hasSignOn: submission.hasSignOn,
            signOnAmount: submission.signOnAmount,
            hireYear: submission.hireYear,
            yearsExperience: submission.yearsExperience,
            confirmedByUser: submission.confirmedByUser,
            instrumentType: submission.instrumentType,
            equityPercentage: submission.equityPercentage,
            vestingTotalMonths: submission.vestingTotalMonths,
            cliffMonths: submission.cliffMonths,
            vestingSchedule: submission.vestingSchedule,
            grantType: submission.grantType,
            isFirstInRole: submission.isFirstInRole,
            grants: {
              create: grants.map((g) => ({
                instrumentType: g.instrumentType,
                equityPercentage: g.equityPercentage,
                vestingTotalMonths: g.vestingTotalMonths,
                cliffMonths: g.cliffMonths,
                vestingSchedule: g.vestingSchedule,
                grantType: g.grantType,
                isFirstInRole: g.isFirstInRole,
                inputMode: g.inputMode,
                strikePrice: g.strikePrice,
                strikeCurrency: g.strikeCurrency,
              })),
            },
          },
        });
      }
      totalCreated++;
    }
  }

  // Print distribution summary
  console.log("\n--- Distribution Summary ---");
  const stages = ["Pre-Seed/Seed", "Series A", "Series B", "Series C+"];
  const header = ["Role", ...stages, "Total"].map((s) => s.padEnd(16)).join(" | ");
  console.log(header);
  console.log("-".repeat(header.length));

  let grandTotal = 0;
  for (const role of Object.keys(distribution)) {
    const row = distribution[role];
    const roleTotal = stages.reduce((sum, s) => sum + (row[s] || 0), 0);
    grandTotal += roleTotal;
    const cells = [
      role.padEnd(16),
      ...stages.map((s) => String(row[s] || 0).padEnd(16)),
      String(roleTotal).padEnd(16),
    ];
    console.log(cells.join(" | "));
  }
  console.log("-".repeat(header.length));
  console.log(`Grand total: ${grandTotal} submissions (+ 1 dev user = ${grandTotal + 1})`);

  if (DRY_RUN) {
    // Print a few sample submissions for verification
    console.log("\n--- Sample Submissions (first 3) ---");
    const sampleRng = seededRandom(42);
    const first = ALLOCATION_MATRIX[0];
    for (let i = 0; i < Math.min(3, first.count); i++) {
      const { submission, grants } = generateSubmission(first.role, first.stage, i, sampleRng);
      console.log(`\n${submission.userId}:`);
      console.log(`  Salary: $${submission.annualSalary.toLocaleString()}`);
      console.log(`  Bonus: ${submission.annualBonus ? `$${submission.annualBonus.toLocaleString()}` : "none"}`);
      console.log(`  Total equity: ${submission.equityPercentage}%`);
      console.log(`  Grants: ${grants.length}`);
      for (const [gi, g] of grants.entries()) {
        console.log(`    Grant ${gi}: ${g.instrumentType} ${g.equityPercentage}% ${g.grantType} (${g.vestingTotalMonths}mo / ${g.cliffMonths}mo cliff)`);
      }
    }
  }

  console.log(`\nSeed complete! ${totalCreated} submissions ${DRY_RUN ? "(dry run)" : "created"}.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
