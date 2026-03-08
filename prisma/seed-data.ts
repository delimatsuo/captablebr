/**
 * Synthetic salary/equity lookup tables by role × stage.
 * All values are author-defined approximations of US tech executive compensation.
 * NOT sourced from any proprietary survey — round numbers indicate synthetic origin.
 */

// Synthetic annual salary ranges by role × stage (USD)
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

// Synthetic total equity ranges by role × stage (% of company, non-founder)
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

// New-hire grant equity ranges (subset of total equity — typically first grant)
export const NEW_HIRE_EQUITY_RANGES: Record<string, Record<string, { p25: number; p50: number; p75: number }>> = {
  CEO: {
    "Pre-Seed/Seed": { p25: 2.0, p50: 4.0, p75: 6.0 },
    "Series A":      { p25: 1.0, p50: 2.0, p75: 4.0 },
    "Series B":      { p25: 0.5, p50: 1.0, p75: 2.0 },
    "Series C+":     { p25: 0.2, p50: 0.5, p75: 1.0 },
  },
  CTO: {
    "Pre-Seed/Seed": { p25: 1.5, p50: 3.0, p75: 5.0 },
    "Series A":      { p25: 0.8, p50: 1.5, p75: 3.0 },
    "Series B":      { p25: 0.3, p50: 0.8, p75: 1.5 },
    "Series C+":     { p25: 0.12, p50: 0.35, p75: 0.8 },
  },
  CFO: {
    "Pre-Seed/Seed": { p25: 1.0, p50: 2.0, p75: 3.5 },
    "Series A":      { p25: 0.5, p50: 1.0, p75: 2.0 },
    "Series B":      { p25: 0.25, p50: 0.6, p75: 1.2 },
    "Series C+":     { p25: 0.1, p50: 0.3, p75: 0.6 },
  },
  COO: {
    "Pre-Seed/Seed": { p25: 1.0, p50: 2.0, p75: 3.5 },
    "Series A":      { p25: 0.5, p50: 1.0, p75: 2.0 },
    "Series B":      { p25: 0.2, p50: 0.5, p75: 1.0 },
    "Series C+":     { p25: 0.08, p50: 0.25, p75: 0.5 },
  },
  CMO: {
    "Pre-Seed/Seed": { p25: 0.8, p50: 1.5, p75: 3.0 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.4, p75: 0.8 },
    "Series C+":     { p25: 0.06, p50: 0.18, p75: 0.4 },
  },
  "CRO/VP Sales": {
    "Pre-Seed/Seed": { p25: 0.8, p50: 1.5, p75: 3.0 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.35, p75: 0.8 },
    "Series C+":     { p25: 0.05, p50: 0.18, p75: 0.4 },
  },
  "CPO/VP Product": {
    "Pre-Seed/Seed": { p25: 0.8, p50: 1.5, p75: 3.0 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.35, p75: 0.8 },
    "Series C+":     { p25: 0.05, p50: 0.15, p75: 0.35 },
  },
  "CHRO/VP People": {
    "Pre-Seed/Seed": { p25: 0.6, p50: 1.2, p75: 2.0 },
    "Series A":      { p25: 0.3, p50: 0.6, p75: 1.2 },
    "Series B":      { p25: 0.1, p50: 0.3, p75: 0.6 },
    "Series C+":     { p25: 0.04, p50: 0.1, p75: 0.3 },
  },
  "VP Engineering": {
    "Pre-Seed/Seed": { p25: 0.8, p50: 1.5, p75: 2.5 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.35, p75: 0.8 },
    "Series C+":     { p25: 0.05, p50: 0.15, p75: 0.35 },
  },
  "Other C-Level": {
    "Pre-Seed/Seed": { p25: 0.8, p50: 1.5, p75: 2.5 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.12, p50: 0.35, p75: 0.8 },
    "Series C+":     { p25: 0.05, p50: 0.15, p75: 0.35 },
  },
  "Other VP": {
    "Pre-Seed/Seed": { p25: 0.6, p50: 1.2, p75: 2.0 },
    "Series A":      { p25: 0.3, p50: 0.6, p75: 1.2 },
    "Series B":      { p25: 0.1, p50: 0.25, p75: 0.6 },
    "Series C+":     { p25: 0.03, p50: 0.1, p75: 0.25 },
  },
};

// Bonus target as % of base salary
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

// Allocation matrix: how many submissions per role × stage
export const ALLOCATION_MATRIX: Array<{ role: string; stage: string; count: number }> = [
  // CEO (20 total)
  { role: "CEO", stage: "Pre-Seed/Seed", count: 5 },
  { role: "CEO", stage: "Series A",      count: 6 },
  { role: "CEO", stage: "Series B",      count: 5 },
  { role: "CEO", stage: "Series C+",     count: 4 },
  // CTO (20 total)
  { role: "CTO", stage: "Pre-Seed/Seed", count: 5 },
  { role: "CTO", stage: "Series A",      count: 6 },
  { role: "CTO", stage: "Series B",      count: 5 },
  { role: "CTO", stage: "Series C+",     count: 4 },
  // CFO (20 total)
  { role: "CFO", stage: "Pre-Seed/Seed", count: 5 },
  { role: "CFO", stage: "Series A",      count: 6 },
  { role: "CFO", stage: "Series B",      count: 5 },
  { role: "CFO", stage: "Series C+",     count: 4 },
  // COO (16 total)
  { role: "COO", stage: "Pre-Seed/Seed", count: 4 },
  { role: "COO", stage: "Series A",      count: 4 },
  { role: "COO", stage: "Series B",      count: 4 },
  { role: "COO", stage: "Series C+",     count: 4 },
  // CMO (16 total)
  { role: "CMO", stage: "Pre-Seed/Seed", count: 4 },
  { role: "CMO", stage: "Series A",      count: 4 },
  { role: "CMO", stage: "Series B",      count: 4 },
  { role: "CMO", stage: "Series C+",     count: 4 },
  // CRO/VP Sales (16 total)
  { role: "CRO/VP Sales", stage: "Pre-Seed/Seed", count: 4 },
  { role: "CRO/VP Sales", stage: "Series A",      count: 4 },
  { role: "CRO/VP Sales", stage: "Series B",      count: 4 },
  { role: "CRO/VP Sales", stage: "Series C+",     count: 4 },
  // CPO/VP Product (14 total)
  { role: "CPO/VP Product", stage: "Pre-Seed/Seed", count: 3 },
  { role: "CPO/VP Product", stage: "Series A",      count: 4 },
  { role: "CPO/VP Product", stage: "Series B",      count: 4 },
  { role: "CPO/VP Product", stage: "Series C+",     count: 3 },
  // CHRO/VP People (14 total)
  { role: "CHRO/VP People", stage: "Pre-Seed/Seed", count: 3 },
  { role: "CHRO/VP People", stage: "Series A",      count: 4 },
  { role: "CHRO/VP People", stage: "Series B",      count: 4 },
  { role: "CHRO/VP People", stage: "Series C+",     count: 3 },
  // VP Engineering (14 total)
  { role: "VP Engineering", stage: "Pre-Seed/Seed", count: 3 },
  { role: "VP Engineering", stage: "Series A",      count: 4 },
  { role: "VP Engineering", stage: "Series B",      count: 4 },
  { role: "VP Engineering", stage: "Series C+",     count: 3 },
  // Other C-Level (12 total)
  { role: "Other C-Level", stage: "Pre-Seed/Seed", count: 3 },
  { role: "Other C-Level", stage: "Series A",      count: 3 },
  { role: "Other C-Level", stage: "Series B",      count: 3 },
  { role: "Other C-Level", stage: "Series C+",     count: 3 },
  // Other VP (12 total)
  { role: "Other VP", stage: "Pre-Seed/Seed", count: 3 },
  { role: "Other VP", stage: "Series A",      count: 3 },
  { role: "Other VP", stage: "Series B",      count: 3 },
  { role: "Other VP", stage: "Series C+",     count: 3 },
];
