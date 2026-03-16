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

// --- Role Level × Function taxonomy ---

export const ROLE_LEVELS = ["CEO", "C-Level", "VP", "Director"] as const;
export type RoleLevel = (typeof ROLE_LEVELS)[number];

export const ROLE_FUNCTIONS = [
  "Engineering", "Finance", "Sales/Revenue", "Product",
  "People/HR", "Marketing", "Operations", "Legal", "Data/AI", "Other",
] as const;
export type RoleFunction = (typeof ROLE_FUNCTIONS)[number];

export const ROLE_LEVEL_LABELS: Record<RoleLevel, string> = {
  CEO: "CEO",
  "C-Level": "C-Level",
  VP: "VP",
  Director: "Diretor(a)",
};

export const ROLE_FUNCTION_LABELS: Record<RoleFunction, string> = {
  Engineering: "Engenharia",
  Finance: "Finanças",
  "Sales/Revenue": "Vendas/Revenue",
  Product: "Produto",
  "People/HR": "Pessoas/RH",
  Marketing: "Marketing",
  Operations: "Operações",
  Legal: "Jurídico",
  "Data/AI": "Dados/IA",
  Other: "Outro",
};

/** Map old role string → { level, function } */
export const ROLE_MIGRATION_MAP: Record<string, { level: RoleLevel; function: RoleFunction | null }> = {
  CEO:             { level: "CEO",     function: null },
  COO:             { level: "C-Level", function: "Operations" },
  CFO:             { level: "C-Level", function: "Finance" },
  CTO:             { level: "C-Level", function: "Engineering" },
  CMO:             { level: "C-Level", function: "Marketing" },
  "CRO/VP Sales":  { level: "C-Level", function: "Sales/Revenue" },
  "CPO/VP Product": { level: "C-Level", function: "Product" },
  "CHRO/VP People": { level: "C-Level", function: "People/HR" },
  "VP Engineering": { level: "VP",     function: "Engineering" },
  "Other C-Level":  { level: "C-Level", function: "Other" },
  "Other VP":       { level: "VP",     function: "Other" },
};

/** Compute a display-friendly legacy role string from level + function */
export function computeLegacyRole(level: RoleLevel, func: RoleFunction | null): string {
  if (level === "CEO") return "CEO";
  if (level === "C-Level") {
    switch (func) {
      case "Operations": return "COO";
      case "Finance": return "CFO";
      case "Engineering": return "CTO";
      case "Marketing": return "CMO";
      case "Sales/Revenue": return "CRO/VP Sales";
      case "Product": return "CPO/VP Product";
      case "People/HR": return "CHRO/VP People";
      default: return "Other C-Level";
    }
  }
  if (level === "VP") {
    if (func === "Engineering") return "VP Engineering";
    return "Other VP";
  }
  // Director — no legacy equivalent, use descriptive string
  const funcLabel = func ? ROLE_FUNCTION_LABELS[func] : "";
  return `Director ${funcLabel}`.trim();
}

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

export const COUNTRIES = [
  { code: "US", label: "Estados Unidos" },
  { code: "BR", label: "Brasil" },
] as const;
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as unknown as readonly ["US", "BR"];
export type CountryCode = (typeof COUNTRY_CODES)[number];

export const CURRENCIES = [
  { code: "USD", label: "Dólar", symbol: "$" },
  { code: "BRL", label: "Real", symbol: "R$" },
] as const;
export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as unknown as readonly ["USD", "BRL"];
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const VERIFICATION_RESULTS = ["auto_approved", "pending_review", "scrape_failed", "rejected"] as const;
export type VerificationResult = (typeof VERIFICATION_RESULTS)[number];

export interface GrantData {
  id: string;
  instrumentType: string;
  equityPercentage?: number;
  vestingTotalMonths: number;
  cliffMonths: number;
  vestingSchedule: string;
  grantType: string;
  isFirstInRole: boolean;
  inputMode: string;
  numberOfShares?: number;
  totalSharesOutstanding?: number;
  strikePrice?: number;
  strikeCurrency?: string;
  currentSharePrice?: number;
  lastValuation?: number;
  grantDate?: string;
  grantLabel?: string;
  vestingStartDate?: string;
  createdAt: string;
}
