import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STAGES = ["Pre-Seed/Seed", "Series A", "Series B", "Series C+"];
const MODELS = ["B2B", "B2C", "B2B2C", "Marketplace", "Platform"];
const SECTORS = ["Fintech", "Healthtech", "Edtech", "Agritech", "Logtech", "HRTech"];
const HEADCOUNTS = ["1-10", "11-50", "51-150"];
const ROLES = ["CEO", "COO", "CFO", "CTO", "CMO", "CRO/VP Sales", "CPO/VP Product", "VP Engineering"];
const INSTRUMENTS = ["Stock Options", "Phantom Stock", "RSU", "Partnership Quotas (Cotas)", "Vesting Shares"];
const SCHEDULES = ["Monthly after cliff", "Quarterly after cliff", "Annual"];
const GRANT_TYPES = ["New-hire", "Ongoing/Refresh", "Promotion"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 1000) / 1000;
}

async function main() {
  console.log("Seeding database...");

  // Create invitations
  await prisma.invitation.upsert({
    where: { email: "dev@captablebr.com" },
    create: { email: "dev@captablebr.com", status: "accepted" },
    update: {},
  });
  await prisma.invitation.upsert({
    where: { email: "deli@ellaexecutivesearch.com" },
    create: { email: "deli@ellaexecutivesearch.com", status: "pending" },
    update: {},
  });
  await prisma.invitation.upsert({
    where: { email: "delimatsuo@gmail.com" },
    create: { email: "delimatsuo@gmail.com", status: "pending" },
    update: {},
  });

  // Dev user submission
  await prisma.submission.create({
    data: {
      userId: "dev-user-001",
      stage: "Series A",
      businessModel: "B2B",
      sector: "Fintech",
      headcountRange: "11-50",
      role: "CTO",
      instrumentType: "Stock Options",
      equityPercentage: 1.5,
      vestingTotalMonths: 48,
      cliffMonths: 12,
      vestingSchedule: "Monthly after cliff",
      grantType: "New-hire",
      isFirstInRole: true,
      hireYear: 2023,
      confirmedByUser: true,
    },
  });

  // Create 15 test submissions (one per user/exec)
  for (let i = 1; i <= 15; i++) {
    const userId = `seed-user-${String(i).padStart(3, "0")}`;
    const stage = pick(STAGES);

    let equityMin = 0.1, equityMax = 2.0;
    if (stage === "Pre-Seed/Seed") { equityMin = 0.5; equityMax = 5.0; }
    else if (stage === "Series A") { equityMin = 0.2; equityMax = 3.0; }
    else if (stage === "Series B") { equityMin = 0.1; equityMax = 1.5; }

    const vestingMonths = pick([24, 36, 48, 60]);
    const cliffMonths = pick([0, 6, 12]);

    await prisma.submission.create({
      data: {
        userId,
        stage,
        businessModel: pick(MODELS),
        sector: pick(SECTORS),
        headcountRange: pick(HEADCOUNTS),
        role: pick(ROLES),
        instrumentType: pick(INSTRUMENTS),
        equityPercentage: randBetween(equityMin, equityMax),
        vestingTotalMonths: vestingMonths,
        cliffMonths,
        vestingSchedule: pick(SCHEDULES),
        grantType: pick(GRANT_TYPES),
        isFirstInRole: Math.random() > 0.4,
        hireYear: 2022 + Math.floor(Math.random() * 4),
        confirmedByUser: true,
        hasAnnualBonus: Math.random() > 0.5 ? true : null,
        hasSignOn: Math.random() > 0.7 ? true : null,
      },
    });

    console.log(`  Created submission ${i}`);
  }

  console.log("Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
