/**
 * Reference benchmark data for US pre-IPO high-technology companies (non-founder).
 * Source: Native (High Technology) job group only, by total invested capital level.
 *
 * Mapping (cumulative investment → funding stage):
 *   Series A  → Under $40M total invested (median ~$23M)
 *   Series B  → $40-$80M total invested (median ~$60M)
 *   Series C+ → Over $80M total invested (median ~$185M)
 *   Pre-Seed/Seed → Series A × 0.70 salary, × 1.40 equity (survey has no sub-$10M data)
 *
 * Equity figures are Non-Founder (excludes founder holdings).
 */

// Annual salary ranges by role × stage (USD)
export const SALARY_RANGES: Record<string, Record<string, { p25: number; p50: number; p75: number }>> = {
  CEO: {
    "Pre-Seed/Seed": { p25: 140000, p50: 175000, p75: 214000 },
    "Series A":      { p25: 200000, p50: 250000, p75: 306000 },
    "Series B":      { p25: 245000, p50: 300000, p75: 350000 },
    "Series C+":     { p25: 282000, p50: 350000, p75: 400000 },
  },
  CTO: {
    "Pre-Seed/Seed": { p25: 136500, p50: 155750, p75: 169000 },
    "Series A":      { p25: 195000, p50: 222500, p75: 241000 },
    "Series B":      { p25: 217500, p50: 245000, p75: 275000 },
    "Series C+":     { p25: 234000, p50: 265000, p75: 332000 },
  },
  CFO: {
    "Pre-Seed/Seed": { p25: 136000, p50: 157500, p75: 192500 },
    "Series A":      { p25: 194000, p50: 225000, p75: 275000 },
    "Series B":      { p25: 226000, p50: 252500, p75: 300000 },
    "Series C+":     { p25: 278000, p50: 315000, p75: 350000 },
  },
  COO: {
    "Pre-Seed/Seed": { p25: 137000, p50: 168000, p75: 221000 },
    "Series A":      { p25: 196000, p50: 240000, p75: 316000 },
    "Series B":      { p25: 236000, p50: 277500, p75: 301000 },
    "Series C+":     { p25: 300000, p50: 325000, p75: 360000 },
  },
  CMO: {
    "Pre-Seed/Seed": { p25: 148000, p50: 174500, p75: 188500 },
    "Series A":      { p25: 211000, p50: 249500, p75: 269000 },
    "Series B":      { p25: 215000, p50: 249000, p75: 260000 },
    "Series C+":     { p25: 250000, p50: 275000, p75: 316000 },
  },
  "CRO/VP Sales": {
    "Pre-Seed/Seed": { p25: 140000, p50: 150500, p75: 193000 },
    "Series A":      { p25: 200000, p50: 215000, p75: 276000 },
    "Series B":      { p25: 221000, p50: 250000, p75: 282500 },
    "Series C+":     { p25: 250000, p50: 292500, p75: 319000 },
  },
  "CPO/VP Product": {
    "Pre-Seed/Seed": { p25: 140000, p50: 158000, p75: 196000 },
    "Series A":      { p25: 200000, p50: 226000, p75: 280000 },
    "Series B":      { p25: 230000, p50: 250000, p75: 290000 },
    "Series C+":     { p25: 235000, p50: 277500, p75: 300000 },
  },
  "CHRO/VP People": {
    "Pre-Seed/Seed": { p25: 131000, p50: 157500, p75: 182000 },
    "Series A":      { p25: 187500, p50: 225000, p75: 260000 },
    "Series B":      { p25: 207500, p50: 225500, p75: 255000 },
    "Series C+":     { p25: 235000, p50: 270000, p75: 300000 },
  },
  "VP Engineering": {
    "Pre-Seed/Seed": { p25: 140000, p50: 168000, p75: 191000 },
    "Series A":      { p25: 200000, p50: 240000, p75: 272500 },
    "Series B":      { p25: 237500, p50: 275000, p75: 300000 },
    "Series C+":     { p25: 256000, p50: 300000, p75: 350000 },
  },
  "Other C-Level": {
    "Pre-Seed/Seed": { p25: 140000, p50: 158000, p75: 192000 },
    "Series A":      { p25: 200000, p50: 226000, p75: 274000 },
    "Series B":      { p25: 230000, p50: 270500, p75: 304000 },
    "Series C+":     { p25: 261000, p50: 300000, p75: 350000 },
  },
  "Other VP": {
    "Pre-Seed/Seed": { p25: 133000, p50: 157500, p75: 183000 },
    "Series A":      { p25: 190000, p50: 225000, p75: 261000 },
    "Series B":      { p25: 210000, p50: 235600, p75: 254000 },
    "Series C+":     { p25: 210000, p50: 243000, p75: 272500 },
  },
};

// Total equity ranges by role × stage (% of company, non-founder)
export const EQUITY_RANGES: Record<string, Record<string, { p25: number; p50: number; p75: number }>> = {
  CEO: {
    "Pre-Seed/Seed": { p25: 6.30, p50: 7.71, p75: 9.34 },
    "Series A":      { p25: 4.50, p50: 5.51, p75: 6.67 },
    "Series B":      { p25: 4.50, p50: 5.36, p75: 6.49 },
    "Series C+":     { p25: 2.80, p50: 4.36, p75: 5.85 },
  },
  CTO: {
    "Pre-Seed/Seed": { p25: 1.25, p50: 2.90, p75: 3.19 },
    "Series A":      { p25: 0.89, p50: 2.07, p75: 2.28 },
    "Series B":      { p25: 0.80, p50: 1.15, p75: 1.72 },
    "Series C+":     { p25: 0.29, p50: 0.63, p75: 1.08 },
  },
  CFO: {
    "Pre-Seed/Seed": { p25: 0.71, p50: 0.99, p75: 1.46 },
    "Series A":      { p25: 0.51, p50: 0.71, p75: 1.04 },
    "Series B":      { p25: 0.57, p50: 0.86, p75: 1.13 },
    "Series C+":     { p25: 0.45, p50: 0.84, p75: 1.13 },
  },
  COO: {
    "Pre-Seed/Seed": { p25: 0.81, p50: 2.21, p75: 2.72 },
    "Series A":      { p25: 0.58, p50: 1.58, p75: 1.94 },
    "Series B":      { p25: 1.17, p50: 2.02, p75: 2.68 },
    "Series C+":     { p25: 0.68, p50: 1.11, p75: 1.43 },
  },
  CMO: {
    "Pre-Seed/Seed": { p25: 0.66, p50: 1.02, p75: 1.36 },
    "Series A":      { p25: 0.47, p50: 0.73, p75: 0.97 },
    "Series B":      { p25: 0.30, p50: 0.48, p75: 0.83 },
    "Series C+":     { p25: 0.21, p50: 0.41, p75: 0.64 },
  },
  "CRO/VP Sales": {
    "Pre-Seed/Seed": { p25: 0.67, p50: 1.20, p75: 1.54 },
    "Series A":      { p25: 0.48, p50: 0.86, p75: 1.10 },
    "Series B":      { p25: 0.69, p50: 1.00, p75: 1.27 },
    "Series C+":     { p25: 0.37, p50: 0.60, p75: 0.98 },
  },
  "CPO/VP Product": {
    "Pre-Seed/Seed": { p25: 0.80, p50: 1.12, p75: 1.44 },
    "Series A":      { p25: 0.57, p50: 0.80, p75: 1.03 },
    "Series B":      { p25: 0.18, p50: 0.58, p75: 0.90 },
    "Series C+":     { p25: 0.25, p50: 0.50, p75: 0.76 },
  },
  "CHRO/VP People": {
    "Pre-Seed/Seed": { p25: 0.31, p50: 0.45, p75: 0.60 },
    "Series A":      { p25: 0.22, p50: 0.32, p75: 0.43 },
    "Series B":      { p25: 0.18, p50: 0.28, p75: 0.56 },
    "Series C+":     { p25: 0.13, p50: 0.23, p75: 0.39 },
  },
  "VP Engineering": {
    "Pre-Seed/Seed": { p25: 0.70, p50: 1.55, p75: 2.41 },
    "Series A":      { p25: 0.50, p50: 1.11, p75: 1.72 },
    "Series B":      { p25: 0.56, p50: 0.93, p75: 1.24 },
    "Series C+":     { p25: 0.38, p50: 0.63, p75: 1.18 },
  },
  "Other C-Level": {
    "Pre-Seed/Seed": { p25: 0.66, p50: 1.16, p75: 1.79 },
    "Series A":      { p25: 0.47, p50: 0.83, p75: 1.28 },
    "Series B":      { p25: 0.50, p50: 0.85, p75: 1.17 },
    "Series C+":     { p25: 0.34, p50: 0.66, p75: 1.08 },
  },
  "Other VP": {
    "Pre-Seed/Seed": { p25: 0.17, p50: 0.34, p75: 0.76 },
    "Series A":      { p25: 0.12, p50: 0.24, p75: 0.54 },
    "Series B":      { p25: 0.08, p50: 0.16, p75: 0.38 },
    "Series C+":     { p25: 0.04, p50: 0.09, p75: 0.20 },
  },
};

// Bonus target as % of base salary (P50 from Stage 3 Native data)
export const BONUS_TARGET_PCT: Record<string, number> = {
  CEO:             0.50,
  CTO:             0.30,
  CFO:             0.35,
  COO:             0.40,
  CMO:             0.30,
  "CRO/VP Sales":  0.90,
  "CPO/VP Product": 0.25,
  "CHRO/VP People": 0.30,
  "VP Engineering": 0.30,
  "Other C-Level":  0.30,
  "Other VP":       0.25,
};

import { ROLE_MIGRATION_MAP, computeLegacyRole, type RoleLevel, type RoleFunction } from "./types";

/**
 * Translate roleLevel + roleFunction to the legacy role key used in benchmark tables.
 * Returns null for combinations with no reference data (e.g., Legal, Data/AI at C-level).
 */
export function roleLevelFunctionToLegacyKey(
  level: RoleLevel,
  func: RoleFunction | null
): string | null {
  const legacyRole = computeLegacyRole(level, func);
  // Check if this legacy key exists in our data tables
  if (SALARY_RANGES[legacyRole]) return legacyRole;
  // For new functions at C-Level (Legal, Data/AI), try "Other C-Level"
  if (level === "C-Level") return "Other C-Level";
  if (level === "VP") return "Other VP";
  return null;
}

/**
 * Look up reference data for a role × stage combination.
 * Accepts either legacy role string or (roleLevel, roleFunction) pair.
 * Returns null if the combination doesn't exist in the tables.
 */
export function getReferenceBenchmark(role: string, stage: string): ReturnType<typeof _lookupBenchmark>;
export function getReferenceBenchmark(roleLevel: RoleLevel, roleFunction: RoleFunction | null, stage: string): ReturnType<typeof _lookupBenchmark>;
export function getReferenceBenchmark(
  roleLevelOrRole: string,
  roleFunctionOrStage: string | RoleFunction | null,
  maybeStage?: string
) {
  let legacyKey: string;
  let stage: string;
  let level: string | undefined;

  if (maybeStage !== undefined) {
    // Called as (roleLevel, roleFunction, stage)
    level = roleLevelOrRole;
    const func = roleFunctionOrStage as RoleFunction | null;
    stage = maybeStage;
    const key = roleLevelFunctionToLegacyKey(level as RoleLevel, func);
    if (!key) return null;
    legacyKey = key;

    // Director derivation: use VP/C-Level data × multipliers
    if (level === "Director") {
      return _deriveDirectorBenchmark(func, stage);
    }
  } else {
    // Called as (role, stage) — legacy path
    legacyKey = roleLevelOrRole;
    stage = roleFunctionOrStage as string;
  }

  return _lookupBenchmark(legacyKey, stage);
}

function _lookupBenchmark(role: string, stage: string) {
  const salary = SALARY_RANGES[role]?.[stage];
  const equity = EQUITY_RANGES[role]?.[stage];
  if (!salary || !equity) return null;

  const bonusPct = BONUS_TARGET_PCT[role] ?? 0;

  return {
    equityPercentiles: { p25: equity.p25, p50: equity.p50, p75: equity.p75, avg: equity.p50 },
    cashPercentiles: {
      annualSalary: { p25: salary.p25, p50: salary.p50, p75: salary.p75, avg: salary.p50 },
      totalCash: {
        p25: Math.round(salary.p25 * (1 + bonusPct)),
        p50: Math.round(salary.p50 * (1 + bonusPct)),
        p75: Math.round(salary.p75 * (1 + bonusPct)),
        avg: Math.round(salary.p50 * (1 + bonusPct)),
      },
    },
    // Reference survey does not provide these breakdowns
    vestingPercentiles: null,
    commonCliff: null,
    instrumentDistribution: {} as Record<string, number>,
    grantTypeDistribution: {} as Record<string, number>,
    firstInRolePremium: null,
  };
}

/**
 * Director benchmark derivation: find matching function at VP level,
 * apply salary × 0.85 and equity × 0.60 multipliers. Bonus same.
 */
function _deriveDirectorBenchmark(func: RoleFunction | null, stage: string) {
  // Find the VP-equivalent key for this function
  const vpKey = roleLevelFunctionToLegacyKey("VP", func);
  // Fallback to C-Level equivalent if no VP data
  const cKey = roleLevelFunctionToLegacyKey("C-Level", func);
  const baseKey = (vpKey && SALARY_RANGES[vpKey]?.[stage]) ? vpKey
    : (cKey && SALARY_RANGES[cKey]?.[stage]) ? cKey
    : null;
  if (!baseKey) return null;

  const salary = SALARY_RANGES[baseKey]?.[stage];
  const equity = EQUITY_RANGES[baseKey]?.[stage];
  if (!salary || !equity) return null;

  const SALARY_MULT = 0.85;
  const EQUITY_MULT = 0.60;
  const bonusPct = BONUS_TARGET_PCT[baseKey] ?? 0;

  return {
    equityPercentiles: {
      p25: Math.round(equity.p25 * EQUITY_MULT * 1000) / 1000,
      p50: Math.round(equity.p50 * EQUITY_MULT * 1000) / 1000,
      p75: Math.round(equity.p75 * EQUITY_MULT * 1000) / 1000,
      avg: Math.round(equity.p50 * EQUITY_MULT * 1000) / 1000,
    },
    cashPercentiles: {
      annualSalary: {
        p25: Math.round(salary.p25 * SALARY_MULT),
        p50: Math.round(salary.p50 * SALARY_MULT),
        p75: Math.round(salary.p75 * SALARY_MULT),
        avg: Math.round(salary.p50 * SALARY_MULT),
      },
      totalCash: {
        p25: Math.round(salary.p25 * SALARY_MULT * (1 + bonusPct)),
        p50: Math.round(salary.p50 * SALARY_MULT * (1 + bonusPct)),
        p75: Math.round(salary.p75 * SALARY_MULT * (1 + bonusPct)),
        avg: Math.round(salary.p50 * SALARY_MULT * (1 + bonusPct)),
      },
    },
    vestingPercentiles: null,
    commonCliff: null,
    instrumentDistribution: {} as Record<string, number>,
    grantTypeDistribution: {} as Record<string, number>,
    firstInRolePremium: null,
  };
}
