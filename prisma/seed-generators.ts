/**
 * Pure generator functions for synthetic seed data.
 * No external dependencies — relative imports only, no `@/` aliases.
 */

import {
  SALARY_RANGES,
  NEW_HIRE_EQUITY_RANGES,
  BONUS_TARGET_PCT,
} from "./seed-data.ts";

// ---------- PRNG ----------

/** Mulberry32 — deterministic 32-bit PRNG */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Distribution sampling ----------

/** Box-Muller transform — returns a standard normal variate */
function boxMuller(rng: () => number): number {
  let u1: number, u2: number;
  do { u1 = rng(); } while (u1 === 0);
  u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Sample from a distribution fitted to 3 percentile anchors.
 * Uses log-normal approximation: log of value is normally distributed.
 * mu = log(p50), sigma derived from (log(p75) - log(p25)) / 1.35.
 */
export function gaussianFromPercentiles(
  p25: number,
  p50: number,
  p75: number,
  rng: () => number
): number {
  const logP25 = Math.log(p25);
  const logP50 = Math.log(p50);
  const logP75 = Math.log(p75);
  const mu = logP50;
  const sigma = (logP75 - logP25) / 1.35;
  const z = boxMuller(rng);
  return Math.exp(mu + sigma * z);
}

// ---------- Weighted pick ----------

interface WeightedOption<T> {
  value: T;
  weight: number;
}

export function weightedPick<T>(options: WeightedOption<T>[], rng: () => number): T {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let r = rng() * total;
  for (const opt of options) {
    r -= opt.weight;
    if (r <= 0) return opt.value;
  }
  return options[options.length - 1].value;
}

// ---------- Rounding helpers ----------

export function roundSalary(value: number): number {
  return Math.round(value / 1000) * 1000;
}

export function roundEquity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

// ---------- Constants for generation ----------

const INSTRUMENT_OPTIONS: WeightedOption<string>[] = [
  { value: "Stock Options", weight: 85 },
  { value: "RSU", weight: 6 },
  { value: "Phantom Stock", weight: 5 },
  { value: "Partnership Quotas (Cotas)", weight: 3 },
  { value: "SAR", weight: 1 },
];

const VESTING_OPTIONS: WeightedOption<number>[] = [
  { value: 48, weight: 90 },
  { value: 36, weight: 5 },
  { value: 60, weight: 5 },
];

const CLIFF_OPTIONS: WeightedOption<number>[] = [
  { value: 12, weight: 82 },
  { value: 6, weight: 10 },
  { value: 0, weight: 8 },
];

const SCHEDULE_OPTIONS: WeightedOption<string>[] = [
  { value: "Monthly after cliff", weight: 80 },
  { value: "Quarterly after cliff", weight: 12 },
  { value: "Annual", weight: 8 },
];

const GRANT_TYPE_PRIMARY: WeightedOption<string>[] = [
  { value: "New-hire", weight: 65 },
  { value: "Ongoing/Refresh", weight: 25 },
  { value: "Promotion", weight: 10 },
];

const GRANT_TYPE_SECONDARY: WeightedOption<string>[] = [
  { value: "Ongoing/Refresh", weight: 70 },
  { value: "Promotion", weight: 30 },
];

const GRANT_COUNT_OPTIONS: WeightedOption<number>[] = [
  { value: 1, weight: 70 },
  { value: 2, weight: 20 },
  { value: 3, weight: 10 },
];

const BUSINESS_MODELS = ["B2B", "B2C", "B2B2C", "Marketplace", "Platform"];
const SECTORS = [
  "Fintech", "Healthtech", "Edtech", "Agritech", "Logtech",
  "HRTech", "Proptech", "Legaltech", "Insurtech", "Retailtech", "Foodtech", "Other",
];
const HEADCOUNT_BY_STAGE: Record<string, string[]> = {
  "Pre-Seed/Seed": ["1-10", "11-50"],
  "Series A":      ["11-50", "51-150"],
  "Series B":      ["51-150", "151-500"],
  "Series C+":     ["151-500", "500+"],
};
const CONTRACT_TYPES = ["CLT", "PJ", "Diretor Estatutário", "Other"];
const EXPERIENCE_RANGES = ["5-10", "10-15", "15-20", "20+"];

// ---------- Grant generator ----------

export interface GeneratedGrant {
  grantType: string;
  instrumentType: string;
  equityPercentage: number;
  vestingTotalMonths: number;
  cliffMonths: number;
  vestingSchedule: string;
  isFirstInRole: boolean;
  strikePrice?: number;
  strikeCurrency: string;
  inputMode: string;
}

export function generateGrant(
  role: string,
  stage: string,
  grantIndex: number,
  rng: () => number
): GeneratedGrant {
  const ranges = NEW_HIRE_EQUITY_RANGES[role]?.[stage];
  if (!ranges) throw new Error(`No equity ranges for ${role} / ${stage}`);

  const instrumentType = weightedPick(INSTRUMENT_OPTIONS, rng);
  const vestingTotalMonths = weightedPick(VESTING_OPTIONS, rng);
  const cliffMonths = weightedPick(CLIFF_OPTIONS, rng);
  const vestingSchedule = weightedPick(SCHEDULE_OPTIONS, rng);

  let equityPct: number;
  if (grantIndex === 0) {
    // Primary grant — full new-hire range, clamped to [p25*0.3, p75*2.5]
    equityPct = gaussianFromPercentiles(ranges.p25, ranges.p50, ranges.p75, rng);
    equityPct = Math.max(ranges.p25 * 0.3, Math.min(ranges.p75 * 2.5, equityPct));
  } else {
    // Secondary grant — 30–60% of primary range
    const fraction = 0.3 + rng() * 0.3;
    equityPct = gaussianFromPercentiles(
      ranges.p25 * fraction,
      ranges.p50 * fraction,
      ranges.p75 * fraction,
      rng
    );
    equityPct = Math.max(ranges.p25 * 0.1, Math.min(ranges.p75 * fraction * 2.5, equityPct));
  }
  equityPct = roundEquity(Math.max(0.001, equityPct));

  const grantType = grantIndex === 0
    ? weightedPick(GRANT_TYPE_PRIMARY, rng)
    : weightedPick(GRANT_TYPE_SECONDARY, rng);

  // isFirstInRole: more likely for early-stage, primary grants
  const firstInRoleChance = grantIndex === 0
    ? (stage === "Pre-Seed/Seed" ? 0.7 : stage === "Series A" ? 0.5 : 0.3)
    : 0.1;
  const isFirstInRole = rng() < firstInRoleChance;

  // Strike price for options/SAR
  let strikePrice: number | undefined;
  if (instrumentType === "Stock Options" || instrumentType === "SAR") {
    // Synthetic strike in range $0.01–$50
    strikePrice = Math.round((0.01 + rng() * 49.99) * 100) / 100;
  }

  return {
    grantType,
    instrumentType,
    equityPercentage: equityPct,
    vestingTotalMonths,
    cliffMonths,
    vestingSchedule,
    isFirstInRole,
    strikePrice,
    strikeCurrency: "USD",
    inputMode: "percentage",
  };
}

// ---------- Submission generator ----------

export interface GeneratedSubmission {
  userId: string;
  stage: string;
  businessModel: string;
  sector: string;
  headcountRange: string;
  role: string;
  country: string;
  currency: string;
  contractType: string;
  annualSalary: number;
  hasAnnualBonus: boolean;
  annualBonus: number | null;
  hasCommission: boolean;
  commission: number | null;
  hasRetentionPlan: boolean;
  retentionAmount: number | null;
  hasSignOn: boolean;
  signOnAmount: number | null;
  hireYear: number;
  yearsExperience: string;
  confirmedByUser: boolean;
  // Denormalized from primary grant
  instrumentType: string;
  equityPercentage: number;
  vestingTotalMonths: number;
  cliffMonths: number;
  vestingSchedule: string;
  grantType: string;
  isFirstInRole: boolean;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function generateSubmission(
  role: string,
  stage: string,
  index: number,
  rng: () => number
): { submission: GeneratedSubmission; grants: GeneratedGrant[] } {
  const salaryRanges = SALARY_RANGES[role]?.[stage];
  if (!salaryRanges) throw new Error(`No salary ranges for ${role} / ${stage}`);

  // Salary — clamp to [p25*0.7, p75*1.4] to prevent extreme outliers
  const rawSalary = gaussianFromPercentiles(salaryRanges.p25, salaryRanges.p50, salaryRanges.p75, rng);
  const clampedSalary = Math.max(salaryRanges.p25 * 0.7, Math.min(salaryRanges.p75 * 1.4, rawSalary));
  const annualSalary = roundSalary(clampedSalary);

  // Bonus (72% chance)
  const hasAnnualBonus = rng() < 0.72;
  const bonusTargetPct = BONUS_TARGET_PCT[role] || 0.35;
  const annualBonus = hasAnnualBonus
    ? roundSalary(annualSalary * bonusTargetPct * (0.7 + rng() * 0.6))
    : null;

  // Commission (60% for CRO/VP Sales, 10% for others)
  const commissionChance = role === "CRO/VP Sales" ? 0.6 : 0.1;
  const hasCommission = rng() < commissionChance;
  const commission = hasCommission
    ? roundSalary(annualSalary * (0.15 + rng() * 0.35))
    : null;

  // Retention (10% chance)
  const hasRetentionPlan = rng() < 0.1;
  const retentionAmount = hasRetentionPlan
    ? roundSalary(annualSalary * (0.2 + rng() * 0.3))
    : null;

  // Sign-on (15% chance)
  const hasSignOn = rng() < 0.15;
  const signOnAmount = hasSignOn
    ? roundSalary(annualSalary * (0.1 + rng() * 0.25))
    : null;

  // Company context
  const businessModel = BUSINESS_MODELS[Math.floor(rng() * BUSINESS_MODELS.length)];
  const sector = SECTORS[Math.floor(rng() * SECTORS.length)];
  const headcountOptions = HEADCOUNT_BY_STAGE[stage] || ["11-50"];
  const headcountRange = headcountOptions[Math.floor(rng() * headcountOptions.length)];
  const contractType = CONTRACT_TYPES[Math.floor(rng() * CONTRACT_TYPES.length)];
  const yearsExperience = EXPERIENCE_RANGES[Math.floor(rng() * EXPERIENCE_RANGES.length)];
  const hireYear = 2020 + Math.floor(rng() * 6); // 2020–2025

  // Grants
  const grantCount = weightedPick(GRANT_COUNT_OPTIONS, rng);
  const grants: GeneratedGrant[] = [];
  for (let i = 0; i < grantCount; i++) {
    grants.push(generateGrant(role, stage, i, rng));
  }

  // Aggregate equity = sum of all grants
  const totalEquity = roundEquity(
    grants.reduce((sum, g) => sum + g.equityPercentage, 0)
  );

  const primaryGrant = grants[0];
  const userId = `seed-${slugify(role)}-${slugify(stage)}-${String(index).padStart(3, "0")}`;

  const submission: GeneratedSubmission = {
    userId,
    stage,
    businessModel,
    sector,
    headcountRange,
    role,
    country: "US",
    currency: "USD",
    contractType,
    annualSalary,
    hasAnnualBonus,
    annualBonus,
    hasCommission,
    commission,
    hasRetentionPlan,
    retentionAmount,
    hasSignOn,
    signOnAmount,
    hireYear,
    yearsExperience,
    confirmedByUser: true,
    // Denormalized from primary grant
    instrumentType: primaryGrant.instrumentType,
    equityPercentage: totalEquity,
    vestingTotalMonths: primaryGrant.vestingTotalMonths,
    cliffMonths: primaryGrant.cliffMonths,
    vestingSchedule: primaryGrant.vestingSchedule,
    grantType: primaryGrant.grantType,
    isFirstInRole: primaryGrant.isFirstInRole,
  };

  return { submission, grants };
}
