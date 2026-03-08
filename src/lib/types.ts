export const STAGES = ["Pre-Seed/Seed", "Series A", "Series B", "Series C+"] as const;
export type Stage = (typeof STAGES)[number];

export const BUSINESS_MODELS = ["B2B", "B2C", "B2B2C", "Marketplace", "Platform"] as const;
export type BusinessModel = (typeof BUSINESS_MODELS)[number];

export const SECTORS = [
  "Fintech", "Healthtech", "Edtech", "Agritech", "Logtech",
  "HRTech", "Proptech", "Legaltech", "Insurtech", "Retailtech", "Foodtech", "Other",
] as const;
export type Sector = (typeof SECTORS)[number];

export const HEADCOUNT_RANGES = ["1-10", "11-50", "51-150", "151-500", "500+"] as const;
export type HeadcountRange = (typeof HEADCOUNT_RANGES)[number];

export const ROLES = [
  "CEO", "COO", "CFO", "CTO", "CMO", "CRO/VP Sales",
  "CPO/VP Product", "CHRO/VP People", "VP Engineering",
  "Other C-Level", "Other VP",
] as const;
export type Role = (typeof ROLES)[number];

export const INSTRUMENT_TYPES = [
  "Stock Options", "Phantom Stock", "RSU", "Partnership Quotas (Cotas)",
  "SAR", "Vesting Shares", "Other",
] as const;
export type InstrumentType = (typeof INSTRUMENT_TYPES)[number];

export const VESTING_SCHEDULES = [
  "Monthly after cliff", "Quarterly after cliff", "Annual",
  "Cliff only (all at once)", "Other",
] as const;
export type VestingSchedule = (typeof VESTING_SCHEDULES)[number];

export const GRANT_TYPES = ["New-hire", "Ongoing/Refresh", "Promotion"] as const;
export type GrantType = (typeof GRANT_TYPES)[number];

export const INPUT_MODES = ["percentage", "shares"] as const;
export type InputMode = (typeof INPUT_MODES)[number];

export const EXPERIENCE_RANGES = ["5-10", "10-15", "15-20", "20+"] as const;

export const CONTRACT_TYPES = ["CLT", "PJ", "Diretor Estatutário", "Other"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

export const VERIFICATION_RESULTS = ["auto_approved", "pending_review", "scrape_failed", "rejected"] as const;
export type VerificationResult = (typeof VERIFICATION_RESULTS)[number];
