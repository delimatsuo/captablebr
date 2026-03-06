import { z } from "zod";
import {
  STAGES, BUSINESS_MODELS, SECTORS, HEADCOUNT_RANGES, VALUATION_RANGES,
  FUNDING_RANGES, ROLES, INSTRUMENT_TYPES, VESTING_SCHEDULES, GRANT_TYPES,
  EXPERIENCE_RANGES, CASH_COMP_RANGES, EQUITY_UNITS, INCENTIVE_RANGES,
} from "./types";

export const companySchema = z.object({
  stage: z.enum(STAGES, { message: "Selecione o estagio" }),
  businessModel: z.enum(BUSINESS_MODELS, { message: "Selecione o modelo de negocio" }),
  sector: z.enum(SECTORS, { message: "Selecione o setor" }),
  subSector: z.string().optional(),
  headcountRange: z.enum(HEADCOUNT_RANGES, { message: "Selecione o numero de funcionarios" }),
  lastValuationRange: z.enum(VALUATION_RANGES).optional(),
  totalFundingRange: z.enum(FUNDING_RANGES).optional(),
  totalSharesOutstanding: z.coerce.number().int().min(1).optional(),
  city: z.string().optional(),
  yearFounded: z.coerce.number().int().min(1990).max(new Date().getFullYear()).optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;

export const grantSchema = z.object({
  executiveLabel: z.string().optional(),
  role: z.enum(ROLES, { message: "Selecione o cargo" }),
  instrumentType: z.enum(INSTRUMENT_TYPES, { message: "Selecione o instrumento" }),
  equityUnit: z.enum(EQUITY_UNITS).default("percentage"),
  equityPercentage: z.coerce.number()
    .min(0.001, "Minimo de 0.001%")
    .max(20, "Maximo de 20%")
    .optional(),
  sharesGranted: z.coerce.number().int().min(1, "Minimo de 1 acao").optional(),
  vestingTotalMonths: z.coerce.number().int()
    .min(1, "Minimo de 1 mes")
    .max(120, "Maximo de 120 meses"),
  cliffMonths: z.coerce.number().int()
    .min(0, "Minimo de 0 meses")
    .max(48, "Maximo de 48 meses"),
  vestingSchedule: z.enum(VESTING_SCHEDULES, { message: "Selecione o cronograma de vesting" }),
  grantType: z.enum(GRANT_TYPES, { message: "Selecione o tipo de grant" }),
  isFirstInRole: z.boolean(),
  hireYear: z.coerce.number().int().min(2000).max(new Date().getFullYear()).optional(),
  yearsExperience: z.enum(EXPERIENCE_RANGES).optional(),
  cashCompRange: z.enum(CASH_COMP_RANGES).optional(),
  hasAnnualBonus: z.boolean().optional(),
  annualBonusRange: z.enum(INCENTIVE_RANGES).optional(),
  hasCommission: z.boolean().optional(),
  commissionRange: z.enum(INCENTIVE_RANGES).optional(),
  hasRetentionPlan: z.boolean().optional(),
  retentionRange: z.enum(INCENTIVE_RANGES).optional(),
  hasSignOn: z.boolean().optional(),
  signOnRange: z.enum(INCENTIVE_RANGES).optional(),
}).refine(
  (data) => data.cliffMonths <= data.vestingTotalMonths,
  { message: "Cliff nao pode ser maior que o periodo total de vesting", path: ["cliffMonths"] }
).refine(
  (data) => {
    if (data.equityUnit === "percentage") return data.equityPercentage != null;
    if (data.equityUnit === "shares") return data.sharesGranted != null;
    return false;
  },
  { message: "Informe o equity em percentual ou numero de acoes", path: ["equityPercentage"] }
);

export type GrantFormData = z.infer<typeof grantSchema>;

export const accessRequestSchema = z.object({
  email: z.string().email("Email invalido"),
  name: z.string().min(2, "Nome e obrigatorio"),
  message: z.string().min(10, "Descreva brevemente por que deseja acesso"),
});

export type AccessRequestFormData = z.infer<typeof accessRequestSchema>;
