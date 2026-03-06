import { z } from "zod";
import {
  STAGES, BUSINESS_MODELS, SECTORS, HEADCOUNT_RANGES,
  ROLES, INSTRUMENT_TYPES, VESTING_SCHEDULES, GRANT_TYPES,
  EXPERIENCE_RANGES, CASH_COMP_RANGES, INCENTIVE_RANGES,
} from "./types";

export const submissionSchema = z.object({
  // Company context
  stage: z.enum(STAGES, { message: "Selecione o estagio" }),
  businessModel: z.enum(BUSINESS_MODELS, { message: "Selecione o modelo de negocio" }),
  sector: z.enum(SECTORS, { message: "Selecione o setor" }),
  subSector: z.string().optional(),
  headcountRange: z.enum(HEADCOUNT_RANGES, { message: "Selecione o numero de funcionarios" }),

  // Role & equity
  role: z.enum(ROLES, { message: "Selecione o cargo" }),
  instrumentType: z.enum(INSTRUMENT_TYPES, { message: "Selecione o instrumento" }),
  equityPercentage: z.coerce.number()
    .min(0.001, "Minimo de 0.001%")
    .max(30, "Maximo de 30%"),
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

  // Cash comp & incentives
  cashCompRange: z.enum(CASH_COMP_RANGES).optional(),
  hasAnnualBonus: z.boolean().optional(),
  annualBonusRange: z.enum(INCENTIVE_RANGES).optional(),
  hasCommission: z.boolean().optional(),
  commissionRange: z.enum(INCENTIVE_RANGES).optional(),
  hasRetentionPlan: z.boolean().optional(),
  retentionRange: z.enum(INCENTIVE_RANGES).optional(),
  hasSignOn: z.boolean().optional(),
  signOnRange: z.enum(INCENTIVE_RANGES).optional(),

  // Notification
  notifyEmail: z.string().email("Email invalido").optional().or(z.literal("")),
}).refine(
  (data) => data.cliffMonths <= data.vestingTotalMonths,
  { message: "Cliff nao pode ser maior que o periodo total de vesting", path: ["cliffMonths"] }
);

export type SubmissionFormData = z.infer<typeof submissionSchema>;

export const accessRequestSchema = z.object({
  email: z.string().email("Email invalido"),
  name: z.string().min(2, "Nome e obrigatorio"),
  message: z.string().min(10, "Descreva brevemente por que deseja acesso"),
});

export type AccessRequestFormData = z.infer<typeof accessRequestSchema>;
