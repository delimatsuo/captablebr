import { z } from "zod";
import {
  STAGES, BUSINESS_MODELS, SECTORS, HEADCOUNT_RANGES,
  ROLES, INSTRUMENT_TYPES, VESTING_SCHEDULES, GRANT_TYPES,
  EXPERIENCE_RANGES, CONTRACT_TYPES, INPUT_MODES,
  COUNTRY_CODES, CURRENCY_CODES,
} from "./types";

// --- Grant schema (standalone, used per-grant) ---

export const grantSchema = z.object({
  id: z.string().uuid().optional(), // present when editing existing grant
  instrumentType: z.enum(INSTRUMENT_TYPES, { message: "Selecione o instrumento" }),
  equityPercentage: z.coerce.number()
    .min(0.001, "Mínimo de 0.001%")
    .max(30, "Máximo de 30%")
    .optional(),
  vestingTotalMonths: z.coerce.number().int()
    .min(1, "Mínimo de 1 mês")
    .max(120, "Máximo de 120 meses"),
  cliffMonths: z.coerce.number().int()
    .min(0, "Mínimo de 0 meses")
    .max(48, "Máximo de 48 meses"),
  vestingSchedule: z.enum(VESTING_SCHEDULES, { message: "Selecione o cronograma de vesting" }),
  grantType: z.enum(GRANT_TYPES, { message: "Selecione o tipo de grant" }),
  isFirstInRole: z.boolean().default(false),
  inputMode: z.enum(INPUT_MODES).default("percentage"),
  numberOfShares: z.coerce.number().int().positive().optional(),
  totalSharesOutstanding: z.coerce.number().int().positive().optional(),
  strikePrice: z.coerce.number().positive().optional(),
  strikeCurrency: z.enum(CURRENCY_CODES).default("USD"),
  currentSharePrice: z.coerce.number().positive().optional(),
  lastValuation: z.coerce.number().positive().optional(),
  grantDate: z.coerce.date().optional(),
  grantLabel: z.string().max(100).trim().optional(),
  vestingStartDate: z.coerce.date().optional(),
}).refine(
  (data) => data.cliffMonths <= data.vestingTotalMonths,
  { message: "Cliff não pode ser maior que o período total de vesting", path: ["cliffMonths"] }
).refine(
  (data) => {
    if (data.inputMode !== "shares") return true;
    if (!data.numberOfShares) return false;
    if (data.totalSharesOutstanding) {
      if (data.numberOfShares > data.totalSharesOutstanding) return false;
      const pct = (data.numberOfShares / data.totalSharesOutstanding) * 100;
      return pct >= 0.001 && pct <= 30;
    }
    return true;
  },
  { message: "Verifique o número de ações e total outstanding", path: ["numberOfShares"] }
).refine(
  (data) => {
    if (data.inputMode === "percentage") return data.equityPercentage != null;
    return true;
  },
  { message: "Informe o percentual de equity", path: ["equityPercentage"] }
).refine(
  (data) => !["Stock Options", "SAR"].includes(data.instrumentType) || data.strikePrice !== undefined,
  { message: "Preço de exercício é obrigatório para opções", path: ["strikePrice"] }
);

export type GrantFormData = z.infer<typeof grantSchema>;

// --- Base submission schema (company context + role + cash comp) ---

export const submissionBaseSchema = z.object({
  // Company context
  stage: z.enum(STAGES, { message: "Selecione o estágio" }),
  businessModel: z.enum(BUSINESS_MODELS, { message: "Selecione o modelo de negócio" }),
  sector: z.enum(SECTORS, { message: "Selecione o setor" }),
  subSector: z.string().optional(),
  headcountRange: z.enum(HEADCOUNT_RANGES, { message: "Selecione o número de funcionários" }),
  country: z.enum(COUNTRY_CODES, { message: "Selecione o país" }).optional(),
  currency: z.enum(CURRENCY_CODES).default("USD"),

  // Role
  role: z.enum(ROLES, { message: "Selecione o cargo" }),
  hireYear: z.coerce.number().int().min(2000).max(new Date().getFullYear()).optional(),
  yearsExperience: z.enum(EXPERIENCE_RANGES).optional(),

  // Cash comp & incentives (annual amounts in USD)
  contractType: z.enum(CONTRACT_TYPES, { message: "Selecione o tipo de contrato" }).optional(),
  annualSalary: z.coerce.number().positive("Salário deve ser positivo").max(5000000, "Máximo $5.000.000").optional(),
  hasAnnualBonus: z.boolean().optional(),
  annualBonus: z.coerce.number().min(0).max(5000000, "Máximo R$ 5.000.000").optional(),
  hasCommission: z.boolean().optional(),
  commission: z.coerce.number().min(0).max(5000000, "Máximo R$ 5.000.000").optional(),
  hasRetentionPlan: z.boolean().optional(),
  retentionAmount: z.coerce.number().min(0).max(5000000, "Máximo R$ 5.000.000").optional(),
  hasSignOn: z.boolean().optional(),
  signOnAmount: z.coerce.number().min(0).max(5000000, "Máximo R$ 5.000.000").optional(),

  // Notification
  notifyEmail: z.string().email("Email inválido").optional().or(z.literal("")),
});

// --- Full submission with grants array ---

export const submissionWithGrantsSchema = submissionBaseSchema.extend({
  grants: z.array(grantSchema).min(1, "Adicione pelo menos um grant"),
});

export type SubmissionWithGrantsFormData = z.infer<typeof submissionWithGrantsSchema>;

// --- Flat submission schema (backwards compat for AI extraction path) ---

export const submissionSchema = submissionBaseSchema.extend({
  instrumentType: z.enum(INSTRUMENT_TYPES, { message: "Selecione o instrumento" }),
  equityPercentage: z.coerce.number()
    .min(0.001, "Mínimo de 0.001%")
    .max(30, "Máximo de 30%")
    .optional(),
  vestingTotalMonths: z.coerce.number().int()
    .min(1, "Mínimo de 1 mês")
    .max(120, "Máximo de 120 meses"),
  cliffMonths: z.coerce.number().int()
    .min(0, "Mínimo de 0 meses")
    .max(48, "Máximo de 48 meses"),
  vestingSchedule: z.enum(VESTING_SCHEDULES, { message: "Selecione o cronograma de vesting" }),
  grantType: z.enum(GRANT_TYPES, { message: "Selecione o tipo de grant" }),
  isFirstInRole: z.boolean(),
  inputMode: z.enum(INPUT_MODES).default("percentage"),
  numberOfShares: z.coerce.number().int().positive().optional(),
  totalSharesOutstanding: z.coerce.number().int().positive().optional(),
  strikePrice: z.coerce.number().positive().optional(),
  strikeCurrency: z.enum(CURRENCY_CODES).default("USD"),
  currentSharePrice: z.coerce.number().positive().optional(),
  lastValuation: z.coerce.number().positive().optional(),
  grantDate: z.coerce.date().optional(),
  grantLabel: z.string().max(100).trim().optional(),
  vestingStartDate: z.coerce.date().optional(),
}).refine(
  (data) => data.cliffMonths <= data.vestingTotalMonths,
  { message: "Cliff não pode ser maior que o período total de vesting", path: ["cliffMonths"] }
).refine(
  (data) => {
    if (data.inputMode !== "shares") return true;
    if (!data.numberOfShares) return false;
    if (data.totalSharesOutstanding) {
      if (data.numberOfShares > data.totalSharesOutstanding) return false;
      const pct = (data.numberOfShares / data.totalSharesOutstanding) * 100;
      return pct >= 0.001 && pct <= 30;
    }
    return true;
  },
  { message: "Verifique o número de ações e total outstanding", path: ["numberOfShares"] }
).refine(
  (data) => {
    if (data.inputMode === "percentage") return data.equityPercentage != null;
    return true;
  },
  { message: "Informe o percentual de equity", path: ["equityPercentage"] }
).refine(
  (data) => !["Stock Options", "SAR"].includes(data.instrumentType) || data.strikePrice !== undefined,
  { message: "Preço de exercício é obrigatório para opções", path: ["strikePrice"] }
);

export type SubmissionFormData = z.infer<typeof submissionSchema>;

export const accessRequestSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome é obrigatório"),
  message: z.string().min(10, "Descreva brevemente por que deseja acesso"),
});

export type AccessRequestFormData = z.infer<typeof accessRequestSchema>;

export const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome é obrigatório"),
  linkedinUrl: z.string().min(1, "LinkedIn é obrigatório"),
  role: z.enum(ROLES, { message: "Selecione o cargo" }),
  lgpdConsent: z.literal(true, { message: "Consentimento obrigatório" }),
  tosConsent: z.literal(true, { message: "Aceitação dos termos obrigatória" }),
  firebaseIdToken: z.string().max(10000).optional(),
  // HMAC-based email verification (replaces Firebase email link)
  verificationTs: z.number().optional(),
  verificationToken: z.string().max(128).optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;
