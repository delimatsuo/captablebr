"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { SimSummary } from "@/lib/vesting-simulator";

interface SimulatorSummaryProps {
  summary: SimSummary;
  horizonYears: number;
  growthRate: number;
  currencySymbol: string;
  projectedPrice: number;
}

function formatCompact(value: number, symbol: string): string {
  if (!Number.isFinite(value) || value === 0) return `${symbol} 0`;
  const formatted = new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
  return `${symbol} ${formatted}`;
}

export function SimulatorSummary({
  summary,
  horizonYears,
  growthRate,
  currencySymbol,
  projectedPrice,
}: SimulatorSummaryProps) {
  const metrics = [
    {
      label: `VALOR EM ${horizonYears} ${horizonYears === 1 ? "ANO" : "ANOS"}`,
      value: formatCompact(summary.totalAtHorizon, currencySymbol),
      sub: `a ${currencySymbol} ${projectedPrice.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}/ação (${growthRate >= 0 ? "+" : ""}${Math.round(growthRate * 100)}% a.a.)`,
    },
    {
      label: "VESTED HOJE",
      value:
        summary.vestedTodayShares > 0 && summary.vestedTodayValue > 0
          ? formatCompact(summary.vestedTodayValue, currencySymbol)
          : summary.vestedTodayShares > 0
            ? `${summary.vestedTodayShares.toLocaleString("pt-BR")} ações vestidas`
            : "0 ações",
      sub:
        summary.vestedTodayShares > 0 && summary.vestedTodayValue > 0
          ? "valor atual estimado"
          : summary.vestedTodayShares > 0
            ? "opções underwater — preço atual < strike"
            : "antes do cliff",
    },
    {
      label: "PRÓXIMO VESTING",
      value: summary.nextVesting
        ? new Date(summary.nextVesting.date).toLocaleDateString("pt-BR", {
            month: "short",
            year: "numeric",
          })
        : "Todos vested",
      sub: summary.nextVesting
        ? `${summary.nextVesting.grantLabel} — ${summary.nextVesting.shares.toLocaleString("pt-BR")} ações`
        : "todos os grants completamente vested",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <Card
          key={m.label}
          className="border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:scale-[1.02]"
        >
          <CardContent className="pt-5 pb-4 px-5">
            <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              {m.label}
            </span>
            <p className="text-2xl font-semibold mt-1.5 tracking-tight">{m.value}</p>
            <p className="text-[12px] text-muted-foreground/70 mt-0.5">{m.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
