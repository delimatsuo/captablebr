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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { BenchmarkResult, StageComparisonResult } from "@/lib/benchmarks";

export default function BenchmarksPage() {
  const [country, setCountry] = useState("all");
  const [role, setRole] = useState("CTO");
  const [stage, setStage] = useState("all");
  const [hasSubmission, setHasSubmission] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Single-stage mode
  const [data, setData] = useState<BenchmarkResult | null>(null);
  // Multi-stage comparison mode
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Benchmarks</h1>
          <p className="text-muted-foreground text-sm">
            Dados anonimizados e agregados
          </p>
        </div>
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

      {isReference && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Benchmarks baseados em dados de referência do mercado norte-americano.
              Contribua seus dados para gerarmos benchmarks do mercado brasileiro.
            </p>
            {!hasSubmission && (
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href="/submit">Contribuir meus dados</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {data?.dataSource === "user-collected" && !hasSubmission && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
            <p className="text-sm text-muted-foreground">
              Estes benchmarks são baseados em {data.sampleSize} executivos. Contribua seus dados para aumentar a precisão.
            </p>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link href="/submit">Contribuir meus dados</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="h-4 w-20 bg-muted rounded animate-pulse mb-3" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Dados insuficientes</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {error}
            </p>
          </CardContent>
        </Card>
      ) : comparison ? (
        /* ── Multi-stage comparison view ── */
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs py-1 px-3 gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              {comparison.role} / Todos os estágios
            </Badge>
            <Badge variant="secondary" className="text-xs py-1 px-3">
              Referência — Mercado EUA
            </Badge>
          </div>

          <StageEquityChart data={comparison} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StageSalaryChart data={comparison} />
            <StageTotalCashChart data={comparison} />
          </div>
        </>
      ) : data ? (
        /* ── Single-stage detail view ── */
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs py-1 px-3 gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              {data.segmentLabel}
            </Badge>
            {data.dataSource === "market-reference" ? (
              <Badge variant="secondary" className="text-xs py-1 px-3">
                Referência — Mercado EUA
              </Badge>
            ) : data.sampleSize > 0 ? (
              <Badge variant="secondary" className="text-xs py-1 px-3">
                Baseado em {data.sampleSize} executivos
              </Badge>
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
