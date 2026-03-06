"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SegmentSelector } from "@/components/dashboard/segment-selector";
import {
  EquityPercentileChart,
  VestingPercentileChart,
  InstrumentDistributionChart,
  SummaryCards,
} from "@/components/dashboard/benchmark-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BenchmarkResult } from "@/lib/benchmarks";

export default function BenchmarksPage() {
  const router = useRouter();
  const [role, setRole] = useState("CTO");
  const [stage, setStage] = useState("all");
  const [businessModel, setBusinessModel] = useState("all");
  const [sector, setSector] = useState("all");
  const [data, setData] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBenchmarks = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ role });
    if (stage !== "all") params.set("stage", stage);
    if (businessModel !== "all") params.set("businessModel", businessModel);
    if (sector !== "all") params.set("sector", sector);

    try {
      const res = await fetch(`/api/benchmarks?${params}`);
      if (res.status === 403) {
        router.push("/submit");
        return;
      }
      if (res.status === 404) {
        setData(null);
        setError("Dados insuficientes para este segmento. Tente filtros mais amplos.");
        return;
      }
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError("Erro ao carregar benchmarks");
    } finally {
      setLoading(false);
    }
  }, [role, stage, businessModel, sector, router]);

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
          <h1 className="text-2xl font-bold">Benchmarks de Equity</h1>
          <p className="text-muted-foreground text-sm">
            Dados anonimizados e agregados do mercado brasileiro
          </p>
        </div>
      </div>

      {/* Filters */}
      <SegmentSelector
        role={role}
        stage={stage}
        businessModel={businessModel}
        sector={sector}
        onRoleChange={setRole}
        onStageChange={setStage}
        onBusinessModelChange={setBusinessModel}
        onSectorChange={setSector}
      />

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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EquityPercentileChart data={data} />
            <VestingPercentileChart data={data} />
          </div>

          <InstrumentDistributionChart data={data} />
        </>
      ) : null}
    </div>
  );
}
