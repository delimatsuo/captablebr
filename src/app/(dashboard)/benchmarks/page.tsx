"use client";

import { useEffect, useState, useCallback } from "react";
import { SegmentSelector } from "@/components/dashboard/segment-selector";
import {
  EquityPercentileChart,
  VestingPercentileChart,
  CashCompensationChart,
  InstrumentDistributionChart,
  SummaryCards,
  StageEquityChart,
  StageSalaryChart,
  StageTotalCashChart,
} from "@/components/dashboard/benchmark-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { BenchmarkResult, StageComparisonResult } from "@/lib/benchmarks";

export default function BenchmarksPage() {
  const [country, setCountry] = useState("all");
  const [role, setRole] = useState("CTO");
  const [stage, setStage] = useState("all");
  const [hasSubmission, setHasSubmission] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [data, setData] = useState<BenchmarkResult | null>(null);
  const [comparison, setComparison] = useState<StageComparisonResult | null>(null);

  const fetchBenchmarks = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ role });
    if (country !== "all") params.set("country", country);
    if (stage !== "all") params.set("stage", stage);

    try {
      const res = await fetch(`/api/benchmarks?${params}`);
      if (res.status === 404) {
        setData(null);
        setComparison(null);
        setError("Dados insuficientes para este segmento. Tente filtros mais amplos.");
        return;
      }
      if (!res.ok) throw new Error();
      const { hasSubmission: hs, mode, ...rest } = await res.json();
      setHasSubmission(hs);

      if (mode === "comparison") {
        setComparison(rest as StageComparisonResult);
        setData(null);
      } else {
        setData(rest as BenchmarkResult);
        setComparison(null);
      }
    } catch {
      setError("Erro ao carregar benchmarks");
    } finally {
      setLoading(false);
    }
  }, [country, role, stage]);

  useEffect(() => {
    fetchBenchmarks();
  }, [fetchBenchmarks]);

  const isReference = data?.dataSource === "market-reference" || comparison?.dataSource === "market-reference";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Benchmarks</h1>
        <p className="text-muted-foreground text-[15px] mt-1">
          Dados anonimizados e agregados
        </p>
      </div>

      {/* Filters */}
      <SegmentSelector
        country={country}
        role={role}
        stage={stage}
        onCountryChange={setCountry}
        onRoleChange={setRole}
        onStageChange={setStage}
      />

      {/* Reference data notice */}
      {isReference && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-foreground/[0.03] px-6 py-4">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Benchmarks baseados em dados de referência do mercado norte-americano.
            Contribua seus dados para gerarmos benchmarks do mercado brasileiro.
          </p>
          {!hasSubmission && (
            <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full text-[13px]">
              <Link href="/submit">Contribuir</Link>
            </Button>
          )}
        </div>
      )}

      {data?.dataSource === "user-collected" && !hasSubmission && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-foreground/[0.03] px-6 py-4">
          <p className="text-[13px] text-muted-foreground">
            Baseado em {data.sampleSize} executivos. Contribua seus dados para aumentar a precisão.
          </p>
          <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full text-[13px]">
            <Link href="/submit">Contribuir</Link>
          </Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="h-3 w-16 bg-muted rounded-full animate-pulse mb-4" />
                <div className="h-7 w-12 bg-muted rounded-lg animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="py-24 text-center">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-foreground/[0.04] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5">Dados insuficientes</h3>
          <p className="text-muted-foreground text-[14px] max-w-sm mx-auto">
            {error}
          </p>
        </div>
      ) : comparison ? (
        <>
          {/* Segment indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-muted-foreground">
              {comparison.role}
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-[13px] text-muted-foreground">
              Todos os estágios
            </span>
            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              Referência EUA
            </span>
          </div>

          <StageEquityChart data={comparison} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StageSalaryChart data={comparison} />
            <StageTotalCashChart data={comparison} />
          </div>
        </>
      ) : data ? (
        <>
          {/* Segment indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-muted-foreground">
              {data.segmentLabel}
            </span>
            {data.dataSource === "market-reference" ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                Referência EUA
              </span>
            ) : data.sampleSize > 0 ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-foreground/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {data.sampleSize} executivos
              </span>
            ) : null}
          </div>

          <SummaryCards data={data} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EquityPercentileChart data={data} />
            <VestingPercentileChart data={data} />
          </div>

          {data.cashPercentiles && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CashCompensationChart data={data} />
            </div>
          )}

          <InstrumentDistributionChart data={data} />
        </>
      ) : null}
    </div>
  );
}
