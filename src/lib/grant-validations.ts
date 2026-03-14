import { z } from "zod";
import {
  GRANT_TYPES, INSTRUMENT_TYPES, VESTING_SCHEDULES, INPUT_MODES,
} from "./types";

export const grantSchema = z.object({
  grantType: z.enum(GRANT_TYPES),
  grantDate: z.coerce.date().optional(),
  grantLabel: z.string().max(100).trim().optional(),

  // Equity input
  inputMode: z.enum(INPUT_MODES).default("percentage"),
  equityPercentage: z.coerce.number().min(0.001).max(30),
  numberOfShares: z.coerce.number().int().positive().optional(),
  totalSharesOutstanding: z.coerce.number().int().positive().optional(),

  // Instrument
  instrumentType: z.enum(INSTRUMENT_TYPES),
  strikePrice: z.coerce.number().positive().optional(),

  // Vesting
  vestingTotalMonths: z.coerce.number().int().min(1).max(120),
  cliffMonths: z.coerce.number().int().min(0).max(48),
  vestingSchedule: z.enum(VESTING_SCHEDULES),
  vestingStartDate: z.coerce.date().optional(),
}).refine(
  (d) => d.cliffMonths <= d.vestingTotalMonths,
  { message: "Cliff não pode ser maior que o vesting total", path: ["cliffMonths"] }
).refine(
  (d) => {
    if (d.inputMode !== "shares") return true;
    if (!d.numberOfShares || !d.totalSharesOutstanding) return false;
    if (d.numberOfShares > d.totalSharesOutstanding) return false;
    const pct = (d.numberOfShares / d.totalSharesOutstanding) * 100;
    return pct >= 0.001 && pct <= 30;
  },
  { message: "Verifique o número de ações e total outstanding", path: ["numberOfShares"] }
).refine(
  (d) => !["Stock Options", "SAR"].includes(d.instrumentType) || d.strikePrice !== undefined,
  { message: "Preço de exercício é obrigatório para opções", path: ["strikePrice"] }
);

export type GrantFormData = z.infer<typeof grantSchema>;
