"use client";

import { useEffect, useState, useCallback } from "react";
import { SegmentSelector } from "@/components/dashboard/segment-selector";
import {
  EquityPercentileChart,
  VestingPercentileChart,
  CashCompensationChart,
  InstrumentDistributionChart,
  SummaryCards,
} from "@/components/dashboard/benchmark-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { BenchmarkResult } from "@/lib/benchmarks";

export default function BenchmarksPage() {
  const [country, setCountry] = useState("all");
  const [role, setRole] = useState("CTO");
  const [stage, setStage] = useState("all");
  const [businessModel, setBusinessModel] = useState("all");
  const [sector, setSector] = useState("all");
  const [data, setData] = useState<BenchmarkResult | null>(null);
  const [hasSubmission, setHasSubmission] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBenchmarks = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ role });
    if (country !== "all") params.set("country", country);
    if (stage !== "all") params.set("stage", stage);
    if (businessModel !== "all") params.set("businessModel", businessModel);
    if (sector !== "all") params.set("sector", sector);

    try {
      const res = await fetch(`/api/benchmarks?${params}`);
      if (res.status === 404) {
        setData(null);
        setError("Dados insuficientes para este segmento. Tente filtros mais amplos.");
        return;
      }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setHasSubmission(json.hasSubmission);
      setData(json);
    } catch {
      setError("Erro ao carregar benchmarks");
    } finally {
      setLoading(false);
    }
  }, [country, role, stage, businessModel, sector]);

  useEffect(() => {
    fetchBenchmarks();
  }, [fetchBenchmarks]);

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
        businessModel={businessModel}
        sector={sector}
        onCountryChange={setCountry}
        onRoleChange={setRole}
        onStageChange={setStage}
        onBusinessModelChange={setBusinessModel}
        onSectorChange={setSector}
      />

      {!hasSubmission && data && (
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
      ) : data ? (
        <>
          {/* Segment badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs py-1 px-3 gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              {data.segmentLabel}
            </Badge>
            {data.sampleSize > 0 && (
              <Badge variant="secondary" className="text-xs py-1 px-3">
                Baseado em {data.sampleSize} executivos
              </Badge>
            )}
          </div>

          {/* Summary metrics */}
          <SummaryCards data={data} />

          {/* Equity & Vesting Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EquityPercentileChart data={data} />
            <VestingPercentileChart data={data} />
          </div>

          {/* Cash Compensation Charts */}
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
