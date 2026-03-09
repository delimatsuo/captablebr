/**
 * Reference benchmark data from Radford Pre-IPO Survey (Aon).
 * US market, pre-IPO tech companies.
 * Percentile values by role × stage for salary, equity, and bonus.
 */

// Annual salary ranges by role × stage (USD)
export const SALARY_RANGES: Record<string, Record<string, { p25: number; p50: number; p75: number }>> = {
  CEO: {
    "Pre-Seed/Seed": { p25: 150000, p50: 200000, p75: 260000 },
    "Series A":      { p25: 220000, p50: 280000, p75: 350000 },
    "Series B":      { p25: 280000, p50: 350000, p75: 420000 },
    "Series C+":     { p25: 320000, p50: 400000, p75: 500000 },
  },
  CTO: {
    "Pre-Seed/Seed": { p25: 140000, p50: 185000, p75: 240000 },
    "Series A":      { p25: 200000, p50: 260000, p75: 330000 },
    "Series B":      { p25: 260000, p50: 320000, p75: 400000 },
    "Series C+":     { p25: 300000, p50: 370000, p75: 450000 },
  },
  CFO: {
    "Pre-Seed/Seed": { p25: 140000, p50: 180000, p75: 230000 },
    "Series A":      { p25: 200000, p50: 250000, p75: 320000 },
    "Series B":      { p25: 250000, p50: 310000, p75: 380000 },
    "Series C+":     { p25: 290000, p50: 360000, p75: 440000 },
  },
  COO: {
    "Pre-Seed/Seed": { p25: 135000, p50: 175000, p75: 225000 },
    "Series A":      { p25: 190000, p50: 240000, p75: 310000 },
    "Series B":      { p25: 240000, p50: 300000, p75: 370000 },
    "Series C+":     { p25: 280000, p50: 350000, p75: 430000 },
  },
  CMO: {
    "Pre-Seed/Seed": { p25: 130000, p50: 170000, p75: 220000 },
    "Series A":      { p25: 180000, p50: 230000, p75: 300000 },
    "Series B":      { p25: 230000, p50: 290000, p75: 360000 },
    "Series C+":     { p25: 270000, p50: 340000, p75: 420000 },
  },
  "CRO/VP Sales": {
    "Pre-Seed/Seed": { p25: 130000, p50: 170000, p75: 220000 },
    "Series A":      { p25: 185000, p50: 235000, p75: 300000 },
    "Series B":      { p25: 235000, p50: 295000, p75: 365000 },
    "Series C+":     { p25: 275000, p50: 345000, p75: 425000 },
  },
  "CPO/VP Product": {
    "Pre-Seed/Seed": { p25: 130000, p50: 170000, p75: 215000 },
    "Series A":      { p25: 180000, p50: 230000, p75: 290000 },
    "Series B":      { p25: 230000, p50: 285000, p75: 350000 },
    "Series C+":     { p25: 265000, p50: 330000, p75: 410000 },
  },
  "CHRO/VP People": {
    "Pre-Seed/Seed": { p25: 120000, p50: 160000, p75: 200000 },
    "Series A":      { p25: 170000, p50: 215000, p75: 270000 },
    "Series B":      { p25: 215000, p50: 265000, p75: 330000 },
    "Series C+":     { p25: 250000, p50: 310000, p75: 385000 },
  },
  "VP Engineering": {
    "Pre-Seed/Seed": { p25: 135000, p50: 175000, p75: 225000 },
    "Series A":      { p25: 195000, p50: 250000, p75: 315000 },
    "Series B":      { p25: 250000, p50: 310000, p75: 380000 },
    "Series C+":     { p25: 290000, p50: 355000, p75: 435000 },
  },
  "Other C-Level": {
    "Pre-Seed/Seed": { p25: 125000, p50: 165000, p75: 210000 },
    "Series A":      { p25: 175000, p50: 225000, p75: 285000 },
    "Series B":      { p25: 225000, p50: 280000, p75: 345000 },
    "Series C+":     { p25: 260000, p50: 325000, p75: 400000 },
  },
  "Other VP": {
    "Pre-Seed/Seed": { p25: 120000, p50: 155000, p75: 200000 },
    "Series A":      { p25: 165000, p50: 210000, p75: 270000 },
    "Series B":      { p25: 210000, p50: 265000, p75: 330000 },
    "Series C+":     { p25: 245000, p50: 305000, p75: 380000 },
  },
};

// Total equity ranges by role × stage (% of company, non-founder)
export const EQUITY_RANGES: Record<string, Record<string, { p25: number; p50: number; p75: number }>> = {
  CEO: {
    "Pre-Seed/Seed": { p25: 3.0, p50: 5.0, p75: 7.0 },
    "Series A":      { p25: 1.5, p50: 3.0, p75: 5.0 },
    "Series B":      { p25: 0.8, p50: 1.5, p75: 2.5 },
    "Series C+":     { p25: 0.3, p50: 0.8, p75: 1.5 },
  },
  CTO: {
    "Pre-Seed/Seed": { p25: 2.0, p50: 3.5, p75: 5.5 },
    "Series A":      { p25: 1.0, p50: 2.0, p75: 3.5 },
    "Series B":      { p25: 0.5, p50: 1.0, p75: 2.0 },
    "Series C+":     { p25: 0.2, p50: 0.5, p75: 1.0 },
  },
  CFO: {
    "Pre-Seed/Seed": { p25: 1.5, p50: 2.5, p75: 4.0 },
    "Series A":      { p25: 0.8, p50: 1.5, p75: 2.5 },
    "Series B":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series C+":     { p25: 0.15, p50: 0.4, p75: 0.8 },
  },
  COO: {
    "Pre-Seed/Seed": { p25: 1.5, p50: 2.5, p75: 4.0 },
    "Series A":      { p25: 0.7, p50: 1.5, p75: 2.5 },
    "Series B":      { p25: 0.3, p50: 0.7, p75: 1.5 },
    "Series C+":     { p25: 0.12, p50: 0.35, p75: 0.7 },
  },
  CMO: {
    "Pre-Seed/Seed": { p25: 1.0, p50: 2.0, p75: 3.5 },
    "Series A":      { p25: 0.5, p50: 1.0, p75: 2.0 },
    "Series B":      { p25: 0.25, p50: 0.5, p75: 1.0 },
    "Series C+":     { p25: 0.1, p50: 0.25, p75: 0.5 },
  },
  "CRO/VP Sales": {
    "Pre-Seed/Seed": { p25: 1.0, p50: 2.0, p75: 3.5 },
    "Series A":      { p25: 0.5, p50: 1.0, p75: 2.0 },
    "Series B":      { p25: 0.2, p50: 0.5, p75: 1.0 },
    "Series C+":     { p25: 0.08, p50: 0.25, p75: 0.5 },
  },
  "CPO/VP Product": {
    "Pre-Seed/Seed": { p25: 1.0, p50: 2.0, p75: 3.5 },
    "Series A":      { p25: 0.5, p50: 1.0, p75: 1.8 },
    "Series B":      { p25: 0.2, p50: 0.5, p75: 1.0 },
    "Series C+":     { p25: 0.08, p50: 0.2, p75: 0.5 },
  },
  "CHRO/VP People": {
    "Pre-Seed/Seed": { p25: 0.8, p50: 1.5, p75: 2.5 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.4, p75: 0.8 },
    "Series C+":     { p25: 0.06, p50: 0.15, p75: 0.4 },
  },
  "VP Engineering": {
    "Pre-Seed/Seed": { p25: 1.0, p50: 2.0, p75: 3.0 },
    "Series A":      { p25: 0.5, p50: 1.0, p75: 1.8 },
    "Series B":      { p25: 0.2, p50: 0.5, p75: 1.0 },
    "Series C+":     { p25: 0.08, p50: 0.2, p75: 0.5 },
  },
  "Other C-Level": {
    "Pre-Seed/Seed": { p25: 1.0, p50: 1.8, p75: 3.0 },
    "Series A":      { p25: 0.5, p50: 1.0, p75: 1.8 },
    "Series B":      { p25: 0.2, p50: 0.5, p75: 1.0 },
    "Series C+":     { p25: 0.08, p50: 0.2, p75: 0.5 },
  },
  "Other VP": {
    "Pre-Seed/Seed": { p25: 0.8, p50: 1.5, p75: 2.5 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.35, p75: 0.8 },
    "Series C+":     { p25: 0.05, p50: 0.15, p75: 0.35 },
  },
};

// Bonus target as % of base salary (single value per role, no stage/percentile breakdown)
export const BONUS_TARGET_PCT: Record<string, number> = {
  CEO:             0.55,
  CTO:             0.45,
  CFO:             0.50,
  COO:             0.45,
  CMO:             0.45,
  "CRO/VP Sales":  0.50,
  "CPO/VP Product": 0.35,
  "CHRO/VP People": 0.35,
  "VP Engineering": 0.30,
  "Other C-Level":  0.40,
  "Other VP":       0.30,
};

/**
 * Look up Radford reference data for a role × stage combination.
 * Returns null if the combination doesn't exist in the tables.
 */
export function getReferenceBenchmark(role: string, stage: string) {
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
    // Radford survey does not provide these breakdowns
    vestingPercentiles: null,
    commonCliff: null,
    instrumentDistribution: {} as Record<string, number>,
    grantTypeDistribution: {} as Record<string, number>,
    firstInRolePremium: null,
  };
}
