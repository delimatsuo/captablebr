import type { GrantData } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SimGrant {
  id: string;
  label: string;
  instrumentType: string;
  numberOfShares: number;
  strikePrice: number;
  strikeCurrency: string;
  startDate: Date;
  startDateSource: "vesting" | "grant" | "created";
  vestingTotalMonths: number;
  cliffMonths: number;
  vestingSchedule: string;
}

export interface SimInputs {
  currentSharePrice: number;
  inputCurrency: string;
  fxRateUsed?: number;
  annualGrowthRate: number;
  horizonYears: number;
}

export interface MonthDataPoint {
  month: number;
  date: Date;
  totalValue: number;
  byGrant: Record<string, number>;
}

export interface SimSummary {
  totalAtHorizon: number;
  vestedTodayValue: number;
  nextVesting: {
    date: Date;
    grantLabel: string;
    shares: number;
    value: number;
  } | null;
}

export interface PrepareResult {
  simulatable: SimGrant[];
  skipped: { grant: GrantData; reason: string }[];
}

// ---------------------------------------------------------------------------
// prepareGrants — convert GrantData[] → SimGrant[] with fallback logic
// ---------------------------------------------------------------------------

export function prepareGrants(grants: GrantData[]): PrepareResult {
  const simulatable: SimGrant[] = [];
  const skipped: PrepareResult["skipped"] = [];

  for (let i = 0; i < grants.length; i++) {
    const g = grants[i];

    // Resolve start date (W1)
    let startDate: Date | null = null;
    let startDateSource: SimGrant["startDateSource"] = "created";

    if (g.vestingStartDate) {
      startDate = new Date(g.vestingStartDate);
      startDateSource = "vesting";
    } else if (g.grantDate) {
      startDate = new Date(g.grantDate);
      startDateSource = "grant";
    } else if (g.createdAt) {
      startDate = new Date(g.createdAt);
      startDateSource = "created";
    }

    if (!startDate || !Number.isFinite(startDate.getTime())) {
      skipped.push({ grant: g, reason: "Sem data de vesting, grant ou criação" });
      continue;
    }

    // Resolve number of shares (C2)
    let numberOfShares: number;
    if (g.inputMode === "shares" && g.numberOfShares != null && Number.isFinite(g.numberOfShares)) {
      numberOfShares = g.numberOfShares;
    } else if (g.equityPercentage != null && Number.isFinite(g.equityPercentage)) {
      if (g.totalSharesOutstanding != null && g.totalSharesOutstanding > 0) {
        numberOfShares = (g.equityPercentage / 100) * g.totalSharesOutstanding;
      } else {
        skipped.push({ grant: g, reason: "Informe o total de ações para converter %" });
        continue;
      }
    } else {
      skipped.push({ grant: g, reason: "Sem quantidade de ações ou percentual" });
      continue;
    }

    // Guard: vestingTotalMonths (W3)
    if (!Number.isFinite(g.vestingTotalMonths) || g.vestingTotalMonths <= 0) {
      skipped.push({ grant: g, reason: "Período de vesting inválido" });
      continue;
    }

    simulatable.push({
      id: g.id,
      label: g.grantLabel || `Grant ${i + 1}`,
      instrumentType: g.instrumentType,
      numberOfShares,
      strikePrice: Number.isFinite(g.strikePrice) ? g.strikePrice! : 0,
      strikeCurrency: g.strikeCurrency || "BRL",
      startDate,
      startDateSource,
      vestingTotalMonths: g.vestingTotalMonths,
      cliffMonths: Number.isFinite(g.cliffMonths) ? g.cliffMonths : 0,
      vestingSchedule: g.vestingSchedule,
    });
  }

  return { simulatable, skipped };
}

// ---------------------------------------------------------------------------
// computeVestedShares — pure vesting schedule logic (W2)
// ---------------------------------------------------------------------------

export function computeVestedShares(grant: SimGrant, monthsSinceStart: number): number {
  if (!Number.isFinite(monthsSinceStart) || monthsSinceStart < 0) return 0;
  if (grant.vestingTotalMonths <= 0) return 0; // W3

  const total = grant.numberOfShares;
  const months = Math.min(monthsSinceStart, grant.vestingTotalMonths);

  // Before cliff: 0
  if (months < grant.cliffMonths) return 0;

  switch (grant.vestingSchedule) {
    case "Monthly after cliff":
      return Math.min(total, total * months / grant.vestingTotalMonths);

    case "Quarterly after cliff": {
      const quarters = Math.floor(months / 3);
      const totalQuarters = Math.ceil(grant.vestingTotalMonths / 3);
      return totalQuarters > 0 ? Math.min(total, total * quarters / totalQuarters) : 0;
    }

    case "Annual": {
      const years = Math.floor(months / 12);
      const totalYears = Math.ceil(grant.vestingTotalMonths / 12);
      return totalYears > 0 ? Math.min(total, total * years / totalYears) : 0;
    }

    case "Cliff only (all at once)":
      return months >= grant.vestingTotalMonths ? total : 0;

    case "Other":
    default:
      // Treat unknown as monthly
      return Math.min(total, total * months / grant.vestingTotalMonths);
  }
}

// ---------------------------------------------------------------------------
// computeGrantValue — value with currency normalization (C1)
// ---------------------------------------------------------------------------

export function computeGrantValue(
  instrumentType: string,
  vestedShares: number,
  projectedPrice: number,
  strikePrice: number,
  strikeCurrency: string,
  inputCurrency: string,
  fxRate?: number,
): number {
  if (!Number.isFinite(vestedShares) || !Number.isFinite(projectedPrice)) return 0;
  if (vestedShares <= 0 || projectedPrice <= 0) return 0;

  let strikePriceNormalized = strikePrice;

  if (strikeCurrency !== inputCurrency) {
    if (!fxRate || !Number.isFinite(fxRate) || fxRate <= 0) return 0;
    // fxRateUsed is BRL per 1 USD
    // If strike is BRL and input is USD: divide by rate to get USD
    // If strike is USD and input is BRL: multiply by rate to get BRL
    if (strikeCurrency === "BRL" && inputCurrency === "USD") {
      strikePriceNormalized = strikePrice / fxRate;
    } else if (strikeCurrency === "USD" && inputCurrency === "BRL") {
      strikePriceNormalized = strikePrice * fxRate;
    } else {
      return 0; // Unknown currency pair
    }
  }

  const isOption = instrumentType === "Stock Options" || instrumentType === "SAR";
  if (isOption) {
    return Math.max(0, projectedPrice - strikePriceNormalized) * vestedShares;
  }

  // RSU, Phantom Stock, Partnership Quotas, Vesting Shares, Other
  return projectedPrice * vestedShares;
}

// ---------------------------------------------------------------------------
// projectTimeline — build month-by-month data points
// ---------------------------------------------------------------------------

export function projectTimeline(grants: SimGrant[], inputs: SimInputs): MonthDataPoint[] {
  if (!Number.isFinite(inputs.currentSharePrice) || inputs.currentSharePrice <= 0) return [];
  if (!Number.isFinite(inputs.horizonYears) || inputs.horizonYears <= 0) return [];

  const totalMonths = inputs.horizonYears * 12;
  const now = new Date();
  const points: MonthDataPoint[] = [];

  for (let m = 0; m <= totalMonths; m++) {
    const date = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const projectedPrice =
      inputs.currentSharePrice * Math.pow(1 + inputs.annualGrowthRate, m / 12);

    const byGrant: Record<string, number> = {};
    let totalValue = 0;

    for (const grant of grants) {
      const monthsSinceStart =
        (date.getFullYear() - grant.startDate.getFullYear()) * 12 +
        (date.getMonth() - grant.startDate.getMonth());

      const vested = computeVestedShares(grant, monthsSinceStart);
      const value = computeGrantValue(
        grant.instrumentType,
        vested,
        projectedPrice,
        grant.strikePrice,
        grant.strikeCurrency,
        inputs.inputCurrency,
        inputs.fxRateUsed,
      );

      byGrant[grant.id] = value;
      totalValue += value;
    }

    points.push({ month: m, date, totalValue, byGrant });
  }

  return points;
}

// ---------------------------------------------------------------------------
// computeSummary — derive summary metrics from timeline
// ---------------------------------------------------------------------------

export function computeSummary(
  grants: SimGrant[],
  inputs: SimInputs,
  timeline: MonthDataPoint[],
): SimSummary {
  const totalAtHorizon = timeline.length > 0 ? timeline[timeline.length - 1].totalValue : 0;

  // Vested today value — month 0
  const vestedTodayValue = timeline.length > 0 ? timeline[0].totalValue : 0;

  // Next vesting event: find the next month where any grant's vested shares increase
  const now = new Date();
  let nextVesting: SimSummary["nextVesting"] = null;

  for (const grant of grants) {
    const monthsSinceStart =
      (now.getFullYear() - grant.startDate.getFullYear()) * 12 +
      (now.getMonth() - grant.startDate.getMonth());

    const currentVested = computeVestedShares(grant, monthsSinceStart);
    if (currentVested >= grant.numberOfShares) continue; // Fully vested

    // Search forward for the next increase
    for (let futureMonth = monthsSinceStart + 1; futureMonth <= grant.vestingTotalMonths; futureMonth++) {
      const futureVested = computeVestedShares(grant, futureMonth);
      if (futureVested > currentVested) {
        const monthsFromNow = futureMonth - monthsSinceStart;
        const vestDate = new Date(now.getFullYear(), now.getMonth() + monthsFromNow, 1);
        const newShares = futureVested - currentVested;
        const projectedPrice =
          inputs.currentSharePrice * Math.pow(1 + inputs.annualGrowthRate, monthsFromNow / 12);
        const value = computeGrantValue(
          grant.instrumentType,
          newShares,
          projectedPrice,
          grant.strikePrice,
          grant.strikeCurrency,
          inputs.inputCurrency,
          inputs.fxRateUsed,
        );

        if (!nextVesting || vestDate < nextVesting.date) {
          nextVesting = {
            date: vestDate,
            grantLabel: grant.label,
            shares: Math.round(newShares),
            value,
          };
        }
        break;
      }
    }
  }

  return { totalAtHorizon, vestedTodayValue, nextVesting };
}
