import { z } from "zod";
import {
  STAGES, BUSINESS_MODELS, SECTORS, HEADCOUNT_RANGES,
  ROLES, INSTRUMENT_TYPES, VESTING_SCHEDULES, GRANT_TYPES,
  EXPERIENCE_RANGES, CONTRACT_TYPES, INPUT_MODES,
} from "./types";

export const submissionSchema = z.object({
  // Company context
  stage: z.enum(STAGES, { message: "Selecione o estágio" }),
  businessModel: z.enum(BUSINESS_MODELS, { message: "Selecione o modelo de negócio" }),
  sector: z.enum(SECTORS, { message: "Selecione o setor" }),
  subSector: z.string().optional(),
  headcountRange: z.enum(HEADCOUNT_RANGES, { message: "Selecione o número de funcionários" }),

  // Role & equity
  role: z.enum(ROLES, { message: "Selecione o cargo" }),
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
  hireYear: z.coerce.number().int().min(2000).max(new Date().getFullYear()).optional(),
  yearsExperience: z.enum(EXPERIENCE_RANGES).optional(),

  // Grant-specific fields
  inputMode: z.enum(INPUT_MODES).default("percentage"),
  numberOfShares: z.coerce.number().int().positive().optional(),
  totalSharesOutstanding: z.coerce.number().int().positive().optional(),
  strikePrice: z.coerce.number().positive().optional(),
  currentSharePrice: z.coerce.number().positive().optional(),
  lastValuation: z.coerce.number().positive().optional(),
  grantDate: z.coerce.date().optional(),
  grantLabel: z.string().max(100).trim().optional(),
  vestingStartDate: z.coerce.date().optional(),

  // Cash comp & incentives (direct amounts in BRL)
  contractType: z.enum(CONTRACT_TYPES, { message: "Selecione o tipo de contrato" }).optional(),
  monthlySalary: z.coerce.number().positive("Salário deve ser positivo").max(500000, "Máximo R$ 500.000").optional(),
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
}).refine(
  (data) => data.cliffMonths <= data.vestingTotalMonths,
  { message: "Cliff não pode ser maior que o período total de vesting", path: ["cliffMonths"] }
).refine(
  (data) => {
    // In shares mode with total outstanding, validate the computed percentage
    if (data.inputMode !== "shares") return true;
    if (!data.numberOfShares) return false;
    // If total outstanding provided, validate shares <= total and % is reasonable
    if (data.totalSharesOutstanding) {
      if (data.numberOfShares > data.totalSharesOutstanding) return false;
      const pct = (data.numberOfShares / data.totalSharesOutstanding) * 100;
      return pct >= 0.001 && pct <= 30;
    }
    // Shares without total outstanding is valid (we just can't compute %)
    return true;
  },
  { message: "Verifique o número de ações e total outstanding", path: ["numberOfShares"] }
).refine(
  (data) => {
    // In percentage mode, equityPercentage is required
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
