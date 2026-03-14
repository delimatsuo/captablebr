"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { Card } from "@/components/ui/card";
import type { GrantData } from "@/lib/types";
import {
  prepareGrants,
  projectTimeline,
  computeSummary,
} from "@/lib/vesting-simulator";
import { SimulatorInputs } from "./simulator-inputs";
import { SimulatorSummary } from "./simulator-summary";
import { SimulatorChart } from "./simulator-chart";

interface VestingSimulatorProps {
  grants: GrantData[];
  currency?: string;
  fxRateUsed?: number;
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function VestingSimulator({ grants, currency = "USD", fxRateUsed }: VestingSimulatorProps) {
  const currencySymbol = currency === "BRL" ? "R$" : "$";

  // Prepare grants once
  const { simulatable, skipped } = useMemo(() => prepareGrants(grants), [grants]);

  // Derive initial share price from grant data
  const initialSharePrice = useMemo(() => {
    for (const g of grants) {
      if (g.currentSharePrice != null && g.currentSharePrice > 0) {
        return g.currentSharePrice;
      }
      if (g.lastValuation != null && g.totalSharesOutstanding != null && g.totalSharesOutstanding > 0) {
        return g.lastValuation / g.totalSharesOutstanding;
      }
    }
    return 0;
  }, [grants]);

  const hasInitialPrice = initialSharePrice > 0;

  // State
  const [expanded, setExpanded] = useState(hasInitialPrice);
  const [sharePrice, setSharePrice] = useState(initialSharePrice);
  const [growthRate, setGrowthRate] = useState(0.15);
  const [horizonYears, setHorizonYears] = useState(5);

  // Deferred values for chart/summary (W7)
  const deferredGrowthRate = useDeferredValue(growthRate);
  const deferredHorizonYears = useDeferredValue(horizonYears);

  const needsSharePrice = !Number.isFinite(sharePrice) || sharePrice <= 0;

  // Compute timeline and summary
  const timeline = useMemo(() => {
    if (needsSharePrice || simulatable.length === 0) return [];
    return projectTimeline(simulatable, {
      currentSharePrice: sharePrice,
      inputCurrency: currency,
      fxRateUsed,
      annualGrowthRate: deferredGrowthRate,
      horizonYears: deferredHorizonYears,
    });
  }, [sharePrice, deferredGrowthRate, deferredHorizonYears, simulatable, currency, fxRateUsed, needsSharePrice]);

  const summary = useMemo(() => {
    if (timeline.length === 0 || simulatable.length === 0) {
      return { totalAtHorizon: 0, vestedTodayValue: 0, nextVesting: null };
    }
    return computeSummary(simulatable, {
      currentSharePrice: sharePrice,
      inputCurrency: currency,
      fxRateUsed,
      annualGrowthRate: deferredGrowthRate,
      horizonYears: deferredHorizonYears,
    }, timeline);
  }, [timeline, simulatable, sharePrice, currency, fxRateUsed, deferredGrowthRate, deferredHorizonYears]);

  // Track which grants used createdAt fallback (W1)
  const fallbackGrants = simulatable.filter((g) => g.startDateSource === "created");

  // Projected prices: immediate (raw values) for inputs, deferred for summary (W1)
  const projectedPriceImmediate = sharePrice * Math.pow(1 + growthRate, horizonYears);
  const projectedPriceDeferred = sharePrice * Math.pow(1 + deferredGrowthRate, deferredHorizonYears);

  if (simulatable.length === 0 && skipped.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Section header — wrapped in Card for visibility */}
      <Card className="border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left px-6 py-5"
          data-state={expanded ? "open" : "closed"}
        >
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">
              Simulador de Vesting
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Projete o valor dos seus grants ao longo do tempo
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground/60 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </Card>

      {/* Expandable content */}
      {expanded && (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {simulatable.length === 0 ? (
            // All grants skipped
            <div className="rounded-2xl border border-border/50 bg-foreground/[0.02] px-6 py-8 text-center">
              <div className="mx-auto h-16 w-16 rounded-xl bg-foreground/[0.04] flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p className="text-[14px] text-muted-foreground max-w-sm mx-auto">
                Nenhum grant pode ser simulado.{" "}
                {skipped.map((s) => s.reason).filter((v, i, a) => a.indexOf(v) === i).join(". ")}.
              </p>
            </div>
          ) : (
            <>
              <SimulatorInputs
                sharePrice={sharePrice}
                onSharePriceChange={setSharePrice}
                growthRate={growthRate}
                onGrowthRateChange={setGrowthRate}
                horizonYears={horizonYears}
                onHorizonYearsChange={setHorizonYears}
                currencySymbol={currencySymbol}
                projectedPrice={projectedPriceImmediate}
              />

              {/* Hint when share price is missing */}
              {needsSharePrice && (
                <p className="text-[13px] text-muted-foreground text-center">
                  Informe o preço atual da ação para ver a projeção
                </p>
              )}

              {/* Skipped grants warning */}
              {skipped.length > 0 && (
                <p className="text-[13px] text-muted-foreground">
                  {skipped.length} grant{skipped.length > 1 ? "s" : ""} sem dados suficientes{" "}
                  {skipped.length === 1 ? "não está incluído" : "não estão incluídos"} na simulação.
                </p>
              )}

              {/* Fallback date note (W1) */}
              {fallbackGrants.length > 0 && (
                <p className="text-[13px] text-muted-foreground">
                  {fallbackGrants.length === 1
                    ? `"${fallbackGrants[0].label}" usa`
                    : `${fallbackGrants.length} grants usam`}{" "}
                  data de criação como início do vesting.
                </p>
              )}

              {!needsSharePrice && (
                <>
                  <SimulatorSummary
                    summary={summary}
                    horizonYears={deferredHorizonYears}
                    growthRate={deferredGrowthRate}
                    currencySymbol={currencySymbol}
                    projectedPrice={projectedPriceDeferred}
                  />

                  <SimulatorChart
                    grants={simulatable}
                    timeline={timeline}
                    currencySymbol={currencySymbol}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
