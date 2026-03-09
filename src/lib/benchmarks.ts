import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { ROLES, STAGES, BUSINESS_MODELS, SECTORS, COUNTRIES, COUNTRY_CODES } from "./types";
import { getReferenceBenchmark } from "./benchmark-data";

export interface BenchmarkResult {
  segmentLabel: string;
  sampleSize: number;
  dataSource: "market-reference" | "user-collected";
  equityPercentiles: { p25: number; p50: number; p75: number; avg: number } | null;
  vestingPercentiles: { p25: number; p50: number; p75: number; avg: number } | null;
  cashPercentiles: {
    annualSalary: { p25: number; p50: number; p75: number; avg: number };
    totalCash: { p25: number; p50: number; p75: number; avg: number };
  } | null;
  commonCliff: number | null;
  instrumentDistribution: Record<string, number>;
  grantTypeDistribution: Record<string, number>;
  firstInRolePremium: { firstInRole: number; notFirstInRole: number } | null;
}

interface SegmentFilter {
  role: string;
  stage?: string;
  businessModel?: string;
  sector?: string;
  // Country is orthogonal — it never relaxes in the rollup cascade
  country?: string;
}

const MIN_SUBMISSIONS_PERCENTILES = 10;
const MIN_SUBMISSIONS_AVERAGES = 7;
const MIN_SUBMISSIONS_DISPLAY = 5;

const VALID_ROLES = ROLES as readonly string[];
const VALID_STAGES = STAGES as readonly string[];
const VALID_BUSINESS_MODELS = BUSINESS_MODELS as readonly string[];
const VALID_SECTORS = SECTORS as readonly string[];
const VALID_COUNTRIES = COUNTRY_CODES as readonly string[];

function validateFilter(filter: SegmentFilter): void {
  if (!VALID_ROLES.includes(filter.role)) throw new Error("Invalid role");
  if (filter.stage && !VALID_STAGES.includes(filter.stage)) throw new Error("Invalid stage");
  if (filter.businessModel && !VALID_BUSINESS_MODELS.includes(filter.businessModel)) throw new Error("Invalid businessModel");
  if (filter.sector && !VALID_SECTORS.includes(filter.sector)) throw new Error("Invalid sector");
  if (filter.country && !VALID_COUNTRIES.includes(filter.country)) throw new Error("Invalid country");
}

function buildSegmentLabel(filter: SegmentFilter): string {
  const parts: string[] = [];
  if (filter.country) {
    const countryLabel = COUNTRIES.find((c) => c.code === filter.country)?.label;
    if (countryLabel) parts.push(countryLabel);
  }
  parts.push(filter.role);
  if (filter.stage) parts.push(filter.stage);
  if (filter.businessModel) parts.push(filter.businessModel);
  if (filter.sector) parts.push(filter.sector);
  return parts.join(" / ");
}

function buildBaseWhere(filter: SegmentFilter): Prisma.Sql {
  let where = Prisma.sql`s.role = ${filter.role} AND s.confirmed_by_user = true`;
  // Country filter: when undefined ("Todos os mercados"), no clause is added —
  // rows with country IS NULL are included. When a specific country is set,
  // WHERE s.country = 'BR' naturally excludes NULLs via SQL semantics.
  if (filter.country) {
    where = Prisma.sql`${where} AND s.country = ${filter.country}`;
  }
  if (filter.stage) {
    where = Prisma.sql`${where} AND s.stage = ${filter.stage}`;
  }
  if (filter.businessModel) {
    where = Prisma.sql`${where} AND s.business_model = ${filter.businessModel}`;
  }
  if (filter.sector) {
    where = Prisma.sql`${where} AND s.sector = ${filter.sector}`;
  }
  return where;
}

async function getSubmissionCount(filter: SegmentFilter): Promise<number> {
  validateFilter(filter);
  const where = buildBaseWhere(filter);
  const result = await prisma.$queryRaw<[{ count: bigint }]>(
    Prisma.sql`SELECT COUNT(*) as count FROM submissions s WHERE ${where}`
  );
  return Number(result[0].count);
}

function findBestSegment(
  role: string,
  stage?: string,
  businessModel?: string,
  sector?: string,
  country?: string
): SegmentFilter[] {
  // Country stays pinned at every cascade level — it never relaxes
  const levels: SegmentFilter[] = [];
  if (stage && businessModel && sector) {
    levels.push({ role, stage, businessModel, sector, country });
  }
  if (stage && businessModel) {
    levels.push({ role, stage, businessModel, country });
  }
  if (stage) {
    levels.push({ role, stage, country });
  }
  levels.push({ role, country });
  return levels;
}

// ---------------------------------------------------------------------------
// Static reference data path (Radford Pre-IPO Survey)
// ---------------------------------------------------------------------------

function getStaticBenchmarks(
  role: string,
  stage?: string,
): BenchmarkResult | null {
  // Static data is keyed by role × stage. Without a stage, we can't look up.
  if (!stage) return null;

  const ref = getReferenceBenchmark(role, stage);
  if (!ref) return null;

  return {
    segmentLabel: `${role} / ${stage}`,
    sampleSize: 0,
    dataSource: "market-reference",
    ...ref,
  };
}

// ---------------------------------------------------------------------------
// User-collected data path (DB queries)
// ---------------------------------------------------------------------------

async function getUserCollectedBenchmarks(
  role: string,
  stage?: string,
  businessModel?: string,
  sector?: string,
  country?: string,
): Promise<BenchmarkResult | null> {
  // TODO: Add database index on `country` column when volume justifies it
  const segments = findBestSegment(role, stage, businessModel, sector, country);

  let bestFilter: SegmentFilter | null = null;
  let submissionCount = 0;

  for (const filter of segments) {
    const count = await getSubmissionCount(filter);
    if (count >= MIN_SUBMISSIONS_DISPLAY) {
      bestFilter = filter;
      submissionCount = count;
      break;
    }
  }

  if (!bestFilter) return null;

  const where = buildBaseWhere(bestFilter);

  let equityPercentiles = null;
  let vestingPercentiles = null;
  let cashPercentiles = null;

  const whereWithEquity = Prisma.sql`${where} AND s.equity_percentage IS NOT NULL`;

  const equityCountResult = await prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
    SELECT COUNT(*) as count FROM submissions s WHERE ${whereWithEquity}
  `);
  const equityCount = Number(equityCountResult[0].count);

  if (equityCount >= MIN_SUBMISSIONS_PERCENTILES) {
    const equityResult = await prisma.$queryRaw<
      [{ p25: number; p50: number; p75: number; avg: number }]
    >(Prisma.sql`
      SELECT
        ROUND(percentile_cont(0.25) WITHIN GROUP (ORDER BY s.equity_percentage)::numeric, 3) as p25,
        ROUND(percentile_cont(0.50) WITHIN GROUP (ORDER BY s.equity_percentage)::numeric, 3) as p50,
        ROUND(percentile_cont(0.75) WITHIN GROUP (ORDER BY s.equity_percentage)::numeric, 3) as p75,
        ROUND(AVG(s.equity_percentage)::numeric, 3) as avg
      FROM submissions s
      WHERE ${whereWithEquity}
    `);
    equityPercentiles = {
      p25: Number(equityResult[0].p25),
      p50: Number(equityResult[0].p50),
      p75: Number(equityResult[0].p75),
      avg: Number(equityResult[0].avg),
    };
  } else if (equityCount >= MIN_SUBMISSIONS_AVERAGES) {
    const equityResult = await prisma.$queryRaw<[{ avg: number }]>(Prisma.sql`
      SELECT ROUND(AVG(s.equity_percentage)::numeric, 3) as avg
      FROM submissions s
      WHERE ${whereWithEquity}
    `);
    equityPercentiles = {
      p25: 0, p50: 0, p75: 0,
      avg: Number(equityResult[0].avg),
    };
  }

  if (submissionCount >= MIN_SUBMISSIONS_PERCENTILES) {
    const vestingResult = await prisma.$queryRaw<
      [{ p25: number; p50: number; p75: number; avg: number }]
    >(Prisma.sql`
      SELECT
        percentile_cont(0.25) WITHIN GROUP (ORDER BY s.vesting_total_months) as p25,
        percentile_cont(0.50) WITHIN GROUP (ORDER BY s.vesting_total_months) as p50,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY s.vesting_total_months) as p75,
        ROUND(AVG(s.vesting_total_months)::numeric, 1) as avg
      FROM submissions s
      WHERE ${where}
    `);
    vestingPercentiles = {
      p25: Number(vestingResult[0].p25),
      p50: Number(vestingResult[0].p50),
      p75: Number(vestingResult[0].p75),
      avg: Number(vestingResult[0].avg),
    };
  } else if (submissionCount >= MIN_SUBMISSIONS_AVERAGES) {
    const vestingResult = await prisma.$queryRaw<[{ avg: number }]>(Prisma.sql`
      SELECT ROUND(AVG(s.vesting_total_months)::numeric, 1) as avg
      FROM submissions s
      WHERE ${where}
    `);
    vestingPercentiles = {
      p25: 0, p50: 0, p75: 0,
      avg: Number(vestingResult[0].avg),
    };
  }

  // Cash compensation percentiles (converted to USD using fx_rate_used)
  const salaryUsd = Prisma.sql`CASE WHEN s.currency = 'BRL' AND s.fx_rate_used IS NOT NULL THEN s.annual_salary / s.fx_rate_used ELSE s.annual_salary END`;
  const bonusUsd = Prisma.sql`CASE WHEN s.currency = 'BRL' AND s.fx_rate_used IS NOT NULL THEN COALESCE(s.annual_bonus, 0) / s.fx_rate_used ELSE COALESCE(s.annual_bonus, 0) END`;

  const whereWithSalary = Prisma.sql`${where} AND s.annual_salary IS NOT NULL`;
  const salaryCountResult = await prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
    SELECT COUNT(*) as count FROM submissions s WHERE ${whereWithSalary}
  `);
  const salaryCount = Number(salaryCountResult[0].count);

  if (salaryCount >= MIN_SUBMISSIONS_PERCENTILES) {
    const salaryResult = await prisma.$queryRaw<
      [{ p25: number; p50: number; p75: number; avg: number }]
    >(Prisma.sql`
      SELECT
        ROUND(percentile_cont(0.25) WITHIN GROUP (ORDER BY ${salaryUsd})::numeric, 0) as p25,
        ROUND(percentile_cont(0.50) WITHIN GROUP (ORDER BY ${salaryUsd})::numeric, 0) as p50,
        ROUND(percentile_cont(0.75) WITHIN GROUP (ORDER BY ${salaryUsd})::numeric, 0) as p75,
        ROUND(AVG(${salaryUsd})::numeric, 0) as avg
      FROM submissions s
      WHERE ${whereWithSalary}
    `);
    const totalCashResult = await prisma.$queryRaw<
      [{ p25: number; p50: number; p75: number; avg: number }]
    >(Prisma.sql`
      SELECT
        ROUND(percentile_cont(0.25) WITHIN GROUP (ORDER BY ${salaryUsd} + ${bonusUsd})::numeric, 0) as p25,
        ROUND(percentile_cont(0.50) WITHIN GROUP (ORDER BY ${salaryUsd} + ${bonusUsd})::numeric, 0) as p50,
        ROUND(percentile_cont(0.75) WITHIN GROUP (ORDER BY ${salaryUsd} + ${bonusUsd})::numeric, 0) as p75,
        ROUND(AVG(${salaryUsd} + ${bonusUsd})::numeric, 0) as avg
      FROM submissions s
      WHERE ${whereWithSalary}
    `);
    cashPercentiles = {
      annualSalary: {
        p25: Number(salaryResult[0].p25),
        p50: Number(salaryResult[0].p50),
        p75: Number(salaryResult[0].p75),
        avg: Number(salaryResult[0].avg),
      },
      totalCash: {
        p25: Number(totalCashResult[0].p25),
        p50: Number(totalCashResult[0].p50),
        p75: Number(totalCashResult[0].p75),
        avg: Number(totalCashResult[0].avg),
      },
    };
  } else if (salaryCount >= MIN_SUBMISSIONS_AVERAGES) {
    const salaryResult = await prisma.$queryRaw<[{ avg: number }]>(Prisma.sql`
      SELECT ROUND(AVG(${salaryUsd})::numeric, 0) as avg
      FROM submissions s
      WHERE ${whereWithSalary}
    `);
    const totalCashResult = await prisma.$queryRaw<[{ avg: number }]>(Prisma.sql`
      SELECT ROUND(AVG(${salaryUsd} + ${bonusUsd})::numeric, 0) as avg
      FROM submissions s
      WHERE ${whereWithSalary}
    `);
    cashPercentiles = {
      annualSalary: {
        p25: 0, p50: 0, p75: 0,
        avg: Number(salaryResult[0].avg),
      },
      totalCash: {
        p25: 0, p50: 0, p75: 0,
        avg: Number(totalCashResult[0].avg),
      },
    };
  }

  const instrumentRows = await prisma.$queryRaw<
    { instrument_type: string; count: bigint }[]
  >(Prisma.sql`
    SELECT s.instrument_type, COUNT(*) as count
    FROM submissions s
    WHERE ${where}
    GROUP BY s.instrument_type
  `);
  const totalInstruments = instrumentRows.reduce((sum, r) => sum + Number(r.count), 0);
  const instrumentDistribution: Record<string, number> = {};
  for (const row of instrumentRows) {
    instrumentDistribution[row.instrument_type] = Math.round((Number(row.count) / totalInstruments) * 100);
  }

  const grantTypeRows = await prisma.$queryRaw<
    { grant_type: string; count: bigint }[]
  >(Prisma.sql`
    SELECT s.grant_type, COUNT(*) as count
    FROM submissions s
    WHERE ${where}
    GROUP BY s.grant_type
  `);
  const totalGrants = grantTypeRows.reduce((sum, r) => sum + Number(r.count), 0);
  const grantTypeDistribution: Record<string, number> = {};
  for (const row of grantTypeRows) {
    grantTypeDistribution[row.grant_type] = Math.round((Number(row.count) / totalGrants) * 100);
  }

  const cliffResult = await prisma.$queryRaw<[{ cliff_months: number }]>(Prisma.sql`
    SELECT s.cliff_months
    FROM submissions s
    WHERE ${where}
    GROUP BY s.cliff_months
    ORDER BY COUNT(*) DESC
    LIMIT 1
  `);
  const commonCliff = cliffResult.length > 0 ? Number(cliffResult[0].cliff_months) : null;

  let firstInRolePremium = null;
  const premiumResult = await prisma.$queryRaw<
    { is_first: boolean; avg: number }[]
  >(Prisma.sql`
    SELECT s.is_first_in_role as is_first, ROUND(AVG(s.equity_percentage)::numeric, 3) as avg
    FROM submissions s
    WHERE ${whereWithEquity}
    GROUP BY s.is_first_in_role
    HAVING COUNT(*) >= ${MIN_SUBMISSIONS_DISPLAY}
  `);
  if (premiumResult.length === 2) {
    const first = premiumResult.find((r) => r.is_first);
    const notFirst = premiumResult.find((r) => !r.is_first);
    if (first && notFirst) {
      firstInRolePremium = {
        firstInRole: Number(first.avg),
        notFirstInRole: Number(notFirst.avg),
      };
    }
  }

  return {
    segmentLabel: buildSegmentLabel(bestFilter),
    sampleSize: submissionCount < 15 ? 0 : submissionCount,
    dataSource: "user-collected",
    equityPercentiles,
    vestingPercentiles,
    cashPercentiles,
    commonCliff,
    instrumentDistribution,
    grantTypeDistribution,
    firstInRolePremium,
  };
}

// ---------------------------------------------------------------------------
// Public API — tries user-collected data first, falls back to static reference
// ---------------------------------------------------------------------------

export async function getBenchmarks(
  role: string,
  stage?: string,
  businessModel?: string,
  sector?: string,
  country?: string
): Promise<BenchmarkResult | null> {
  // Try user-collected data first
  const userResult = await getUserCollectedBenchmarks(role, stage, businessModel, sector, country);
  if (userResult) return userResult;

  // Fall back to static Radford reference data (US market, requires stage)
  return getStaticBenchmarks(role, stage);
}
