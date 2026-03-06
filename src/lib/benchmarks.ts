import { prisma } from "./db";
export interface BenchmarkResult {
  segmentLabel: string;
  sampleSize: number;
  equityPercentiles: { p25: number; p50: number; p75: number; avg: number } | null;
  vestingPercentiles: { p25: number; p50: number; p75: number; avg: number } | null;
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
}

const MIN_COMPANIES_PERCENTILES = 10;
const MIN_COMPANIES_AVERAGES = 7;
const MIN_COMPANIES_DISPLAY = 5;

function buildWhereClause(filter: SegmentFilter): string {
  const conditions = [`g.role = '${filter.role}'`, "g.confirmed_by_user = true"];
  if (filter.stage) conditions.push(`c.stage = '${filter.stage}'`);
  if (filter.businessModel) conditions.push(`c.business_model = '${filter.businessModel}'`);
  if (filter.sector) conditions.push(`c.sector = '${filter.sector}'`);
  return conditions.join(" AND ");
}

function buildSegmentLabel(filter: SegmentFilter): string {
  const parts = [filter.role];
  if (filter.stage) parts.push(filter.stage);
  if (filter.businessModel) parts.push(filter.businessModel);
  if (filter.sector) parts.push(filter.sector);
  return parts.join(" / ");
}

async function getDistinctCompanyCount(filter: SegmentFilter): Promise<number> {
  const where = buildWhereClause(filter);
  const result = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
    `SELECT COUNT(DISTINCT g.company_id) as count
     FROM grants g JOIN companies c ON g.company_id = c.id
     WHERE ${where}`
  );
  return Number(result[0].count);
}

function findBestSegment(
  role: string,
  stage?: string,
  businessModel?: string,
  sector?: string
): SegmentFilter[] {
  const levels: SegmentFilter[] = [];
  if (stage && businessModel && sector) {
    levels.push({ role, stage, businessModel, sector });
  }
  if (stage && businessModel) {
    levels.push({ role, stage, businessModel });
  }
  if (stage) {
    levels.push({ role, stage });
  }
  levels.push({ role });
  return levels;
}

export async function getBenchmarks(
  role: string,
  stage?: string,
  businessModel?: string,
  sector?: string
): Promise<BenchmarkResult | null> {
  const segments = findBestSegment(role, stage, businessModel, sector);

  let bestFilter: SegmentFilter | null = null;
  let companyCount = 0;

  for (const filter of segments) {
    const count = await getDistinctCompanyCount(filter);
    if (count >= MIN_COMPANIES_DISPLAY) {
      bestFilter = filter;
      companyCount = count;
      break;
    }
  }

  if (!bestFilter) return null;

  const where = buildWhereClause(bestFilter);

  let equityPercentiles = null;
  let vestingPercentiles = null;

  if (companyCount >= MIN_COMPANIES_PERCENTILES) {
    const equityResult = await prisma.$queryRawUnsafe<
      [{ p25: number; p50: number; p75: number; avg: number }]
    >(
      `SELECT
        ROUND(percentile_cont(0.25) WITHIN GROUP (ORDER BY g.equity_percentage)::numeric, 3) as p25,
        ROUND(percentile_cont(0.50) WITHIN GROUP (ORDER BY g.equity_percentage)::numeric, 3) as p50,
        ROUND(percentile_cont(0.75) WITHIN GROUP (ORDER BY g.equity_percentage)::numeric, 3) as p75,
        ROUND(AVG(g.equity_percentage)::numeric, 3) as avg
       FROM grants g JOIN companies c ON g.company_id = c.id
       WHERE ${where}`
    );
    equityPercentiles = {
      p25: Number(equityResult[0].p25),
      p50: Number(equityResult[0].p50),
      p75: Number(equityResult[0].p75),
      avg: Number(equityResult[0].avg),
    };

    const vestingResult = await prisma.$queryRawUnsafe<
      [{ p25: number; p50: number; p75: number; avg: number }]
    >(
      `SELECT
        percentile_cont(0.25) WITHIN GROUP (ORDER BY g.vesting_total_months) as p25,
        percentile_cont(0.50) WITHIN GROUP (ORDER BY g.vesting_total_months) as p50,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY g.vesting_total_months) as p75,
        ROUND(AVG(g.vesting_total_months)::numeric, 1) as avg
       FROM grants g JOIN companies c ON g.company_id = c.id
       WHERE ${where}`
    );
    vestingPercentiles = {
      p25: Number(vestingResult[0].p25),
      p50: Number(vestingResult[0].p50),
      p75: Number(vestingResult[0].p75),
      avg: Number(vestingResult[0].avg),
    };
  } else if (companyCount >= MIN_COMPANIES_AVERAGES) {
    const equityResult = await prisma.$queryRawUnsafe<[{ avg: number }]>(
      `SELECT ROUND(AVG(g.equity_percentage)::numeric, 3) as avg
       FROM grants g JOIN companies c ON g.company_id = c.id
       WHERE ${where}`
    );
    equityPercentiles = {
      p25: 0, p50: 0, p75: 0,
      avg: Number(equityResult[0].avg),
    };

    const vestingResult = await prisma.$queryRawUnsafe<[{ avg: number }]>(
      `SELECT ROUND(AVG(g.vesting_total_months)::numeric, 1) as avg
       FROM grants g JOIN companies c ON g.company_id = c.id
       WHERE ${where}`
    );
    vestingPercentiles = {
      p25: 0, p50: 0, p75: 0,
      avg: Number(vestingResult[0].avg),
    };
  }

  // Instrument distribution
  const instrumentRows = await prisma.$queryRawUnsafe<
    { instrument_type: string; count: bigint }[]
  >(
    `SELECT g.instrument_type, COUNT(*) as count
     FROM grants g JOIN companies c ON g.company_id = c.id
     WHERE ${where}
     GROUP BY g.instrument_type`
  );
  const totalInstruments = instrumentRows.reduce((sum, r) => sum + Number(r.count), 0);
  const instrumentDistribution: Record<string, number> = {};
  for (const row of instrumentRows) {
    instrumentDistribution[row.instrument_type] = Math.round((Number(row.count) / totalInstruments) * 100);
  }

  // Grant type distribution
  const grantTypeRows = await prisma.$queryRawUnsafe<
    { grant_type: string; count: bigint }[]
  >(
    `SELECT g.grant_type, COUNT(*) as count
     FROM grants g JOIN companies c ON g.company_id = c.id
     WHERE ${where}
     GROUP BY g.grant_type`
  );
  const totalGrants = grantTypeRows.reduce((sum, r) => sum + Number(r.count), 0);
  const grantTypeDistribution: Record<string, number> = {};
  for (const row of grantTypeRows) {
    grantTypeDistribution[row.grant_type] = Math.round((Number(row.count) / totalGrants) * 100);
  }

  // Most common cliff
  const cliffResult = await prisma.$queryRawUnsafe<[{ cliff_months: number }]>(
    `SELECT g.cliff_months
     FROM grants g JOIN companies c ON g.company_id = c.id
     WHERE ${where}
     GROUP BY g.cliff_months
     ORDER BY COUNT(*) DESC
     LIMIT 1`
  );
  const commonCliff = cliffResult.length > 0 ? Number(cliffResult[0].cliff_months) : null;

  // First-in-role premium
  let firstInRolePremium = null;
  const premiumResult = await prisma.$queryRawUnsafe<
    { is_first: boolean; avg: number }[]
  >(
    `SELECT g.is_first_in_role as is_first, ROUND(AVG(g.equity_percentage)::numeric, 3) as avg
     FROM grants g JOIN companies c ON g.company_id = c.id
     WHERE ${where}
     GROUP BY g.is_first_in_role
     HAVING COUNT(DISTINCT g.company_id) >= ${MIN_COMPANIES_DISPLAY}`
  );
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
    sampleSize: companyCount < 15 ? 0 : companyCount, // hide exact n when < 15
    equityPercentiles,
    vestingPercentiles,
    commonCliff,
    instrumentDistribution,
    grantTypeDistribution,
    firstInRolePremium,
  };
}
