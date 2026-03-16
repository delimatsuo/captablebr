/**
 * Synthetic salary/equity lookup tables by role × stage.
 * Derived from reference benchmark data (see src/lib/benchmark-data.ts).
 * Pre-Seed/Seed = Series A × 0.70 salary, × 1.40 equity.
 *
 * NOTE: The canonical reference benchmark data lives in
 * src/lib/benchmark-data.ts and is served directly to users.
 * This file is only used by the seed generator for dev/test purposes.
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

// New-hire grant equity ranges (subset of total equity — typically first grant)
// Pre-Seed/Seed = Series A × 1.40
export const NEW_HIRE_EQUITY_RANGES: Record<string, Record<string, { p25: number; p50: number; p75: number }>> = {
  CEO: {
    "Pre-Seed/Seed": { p25: 1.40, p50: 2.80, p75: 5.60 },
    "Series A":      { p25: 1.0, p50: 2.0, p75: 4.0 },
    "Series B":      { p25: 0.5, p50: 1.0, p75: 2.0 },
    "Series C+":     { p25: 0.2, p50: 0.5, p75: 1.0 },
  },
  CTO: {
    "Pre-Seed/Seed": { p25: 1.12, p50: 2.10, p75: 4.20 },
    "Series A":      { p25: 0.8, p50: 1.5, p75: 3.0 },
    "Series B":      { p25: 0.3, p50: 0.8, p75: 1.5 },
    "Series C+":     { p25: 0.12, p50: 0.35, p75: 0.8 },
  },
  CFO: {
    "Pre-Seed/Seed": { p25: 0.70, p50: 1.40, p75: 2.80 },
    "Series A":      { p25: 0.5, p50: 1.0, p75: 2.0 },
    "Series B":      { p25: 0.25, p50: 0.6, p75: 1.2 },
    "Series C+":     { p25: 0.1, p50: 0.3, p75: 0.6 },
  },
  COO: {
    "Pre-Seed/Seed": { p25: 0.70, p50: 1.40, p75: 2.80 },
    "Series A":      { p25: 0.5, p50: 1.0, p75: 2.0 },
    "Series B":      { p25: 0.2, p50: 0.5, p75: 1.0 },
    "Series C+":     { p25: 0.08, p50: 0.25, p75: 0.5 },
  },
  CMO: {
    "Pre-Seed/Seed": { p25: 0.56, p50: 1.12, p75: 2.10 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.4, p75: 0.8 },
    "Series C+":     { p25: 0.06, p50: 0.18, p75: 0.4 },
  },
  "CRO/VP Sales": {
    "Pre-Seed/Seed": { p25: 0.56, p50: 1.12, p75: 2.10 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.35, p75: 0.8 },
    "Series C+":     { p25: 0.05, p50: 0.18, p75: 0.4 },
  },
  "CPO/VP Product": {
    "Pre-Seed/Seed": { p25: 0.56, p50: 1.12, p75: 2.10 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.35, p75: 0.8 },
    "Series C+":     { p25: 0.05, p50: 0.15, p75: 0.35 },
  },
  "CHRO/VP People": {
    "Pre-Seed/Seed": { p25: 0.42, p50: 0.84, p75: 1.68 },
    "Series A":      { p25: 0.3, p50: 0.6, p75: 1.2 },
    "Series B":      { p25: 0.1, p50: 0.3, p75: 0.6 },
    "Series C+":     { p25: 0.04, p50: 0.1, p75: 0.3 },
  },
  "VP Engineering": {
    "Pre-Seed/Seed": { p25: 0.56, p50: 1.12, p75: 2.10 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.15, p50: 0.35, p75: 0.8 },
    "Series C+":     { p25: 0.05, p50: 0.15, p75: 0.35 },
  },
  "Other C-Level": {
    "Pre-Seed/Seed": { p25: 0.56, p50: 1.12, p75: 2.10 },
    "Series A":      { p25: 0.4, p50: 0.8, p75: 1.5 },
    "Series B":      { p25: 0.12, p50: 0.35, p75: 0.8 },
    "Series C+":     { p25: 0.05, p50: 0.15, p75: 0.35 },
  },
  "Other VP": {
    "Pre-Seed/Seed": { p25: 0.42, p50: 0.84, p75: 1.68 },
    "Series A":      { p25: 0.3, p50: 0.6, p75: 1.2 },
    "Series B":      { p25: 0.1, p50: 0.25, p75: 0.6 },
    "Series C+":     { p25: 0.03, p50: 0.1, p75: 0.25 },
  },
};

// Bonus target as % of base salary (from Stage 3 Native P50)
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

// Role level/function mapping for seed data
export const SEED_ROLE_MAP: Record<string, { level: string; function: string | null }> = {
  CEO:             { level: "CEO",     function: null },
  CTO:             { level: "C-Level", function: "Engineering" },
  CFO:             { level: "C-Level", function: "Finance" },
  COO:             { level: "C-Level", function: "Operations" },
  CMO:             { level: "C-Level", function: "Marketing" },
  "CRO/VP Sales":  { level: "C-Level", function: "Sales/Revenue" },
  "CPO/VP Product": { level: "C-Level", function: "Product" },
  "CHRO/VP People": { level: "C-Level", function: "People/HR" },
  "VP Engineering": { level: "VP",     function: "Engineering" },
  "Other C-Level":  { level: "C-Level", function: "Other" },
  "Other VP":       { level: "VP",     function: "Other" },
};

// Allocation matrix: how many submissions per role × stage
export const ALLOCATION_MATRIX: Array<{ role: string; stage: string; count: number }> = [
  { role: "CEO", stage: "Pre-Seed/Seed", count: 5 },
  { role: "CEO", stage: "Series A",      count: 6 },
  { role: "CEO", stage: "Series B",      count: 5 },
  { role: "CEO", stage: "Series C+",     count: 4 },
  { role: "CTO", stage: "Pre-Seed/Seed", count: 5 },
  { role: "CTO", stage: "Series A",      count: 6 },
  { role: "CTO", stage: "Series B",      count: 5 },
  { role: "CTO", stage: "Series C+",     count: 4 },
  { role: "CFO", stage: "Pre-Seed/Seed", count: 5 },
  { role: "CFO", stage: "Series A",      count: 6 },
  { role: "CFO", stage: "Series B",      count: 5 },
  { role: "CFO", stage: "Series C+",     count: 4 },
  { role: "COO", stage: "Pre-Seed/Seed", count: 4 },
  { role: "COO", stage: "Series A",      count: 4 },
  { role: "COO", stage: "Series B",      count: 4 },
  { role: "COO", stage: "Series C+",     count: 4 },
  { role: "CMO", stage: "Pre-Seed/Seed", count: 4 },
  { role: "CMO", stage: "Series A",      count: 4 },
  { role: "CMO", stage: "Series B",      count: 4 },
  { role: "CMO", stage: "Series C+",     count: 4 },
  { role: "CRO/VP Sales", stage: "Pre-Seed/Seed", count: 4 },
  { role: "CRO/VP Sales", stage: "Series A",      count: 4 },
  { role: "CRO/VP Sales", stage: "Series B",      count: 4 },
  { role: "CRO/VP Sales", stage: "Series C+",     count: 4 },
  { role: "CPO/VP Product", stage: "Pre-Seed/Seed", count: 3 },
  { role: "CPO/VP Product", stage: "Series A",      count: 4 },
  { role: "CPO/VP Product", stage: "Series B",      count: 4 },
  { role: "CPO/VP Product", stage: "Series C+",     count: 3 },
  { role: "CHRO/VP People", stage: "Pre-Seed/Seed", count: 3 },
  { role: "CHRO/VP People", stage: "Series A",      count: 4 },
  { role: "CHRO/VP People", stage: "Series B",      count: 4 },
  { role: "CHRO/VP People", stage: "Series C+",     count: 3 },
  { role: "VP Engineering", stage: "Pre-Seed/Seed", count: 3 },
  { role: "VP Engineering", stage: "Series A",      count: 4 },
  { role: "VP Engineering", stage: "Series B",      count: 4 },
  { role: "VP Engineering", stage: "Series C+",     count: 3 },
  { role: "Other C-Level", stage: "Pre-Seed/Seed", count: 3 },
  { role: "Other C-Level", stage: "Series A",      count: 3 },
  { role: "Other C-Level", stage: "Series B",      count: 3 },
  { role: "Other C-Level", stage: "Series C+",     count: 3 },
  { role: "Other VP", stage: "Pre-Seed/Seed", count: 3 },
  { role: "Other VP", stage: "Series A",      count: 3 },
  { role: "Other VP", stage: "Series B",      count: 3 },
  { role: "Other VP", stage: "Series C+",     count: 3 },
  // New VP combinations (use VP Engineering data for salary/equity lookup)
  { role: "VP Finance", stage: "Series A",      count: 2 },
  { role: "VP Finance", stage: "Series B",      count: 2 },
  // New Director combinations (use VP data × 0.85 salary, × 0.60 equity)
  { role: "Director Engineering", stage: "Series A",  count: 2 },
  { role: "Director Engineering", stage: "Series B",  count: 2 },
  { role: "Director Finance", stage: "Series A",      count: 2 },
  { role: "Director Product", stage: "Series A",      count: 2 },
];

// Map new allocation entries to their seed data lookup key (for salary/equity ranges)
export const SEED_DATA_LOOKUP_KEY: Record<string, string> = {
  "VP Finance": "Other VP",
  "Director Engineering": "VP Engineering",
  "Director Finance": "Other VP",
  "Director Product": "CPO/VP Product",
};

// Map new allocation entries to their level/function for seed
export const SEED_NEW_ROLE_MAP: Record<string, { level: string; function: string }> = {
  "VP Finance":            { level: "VP",       function: "Finance" },
  "Director Engineering":  { level: "Director", function: "Engineering" },
  "Director Finance":      { level: "Director", function: "Finance" },
  "Director Product":      { level: "Director", function: "Product" },
};
