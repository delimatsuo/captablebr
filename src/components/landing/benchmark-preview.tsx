"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const equityData = [
  { name: "p25", value: 0.3 },
  { name: "p50", value: 0.8 },
  { name: "p75", value: 1.5 },
];

const salaryData = [
  { name: "p25", value: 120 },
  { name: "p50", value: 180 },
  { name: "p75", value: 250 },
];

export function BenchmarkPreview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <Badge variant="secondary" className="text-[13px] font-normal px-3 py-1">
          Dados ilustrativos
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Equity chart — fully visible */}
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              CTO · Series A — Equity (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart
                  data={equityData}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                    domain={[0, 2]}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[13px] text-muted-foreground mt-3 text-center">
              Mediana: <span className="font-medium text-foreground">0.8%</span> de equity
            </p>
          </CardContent>
        </Card>

        {/* Salary chart — fully visible */}
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              CTO · Series A — Salário Anual (USD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart
                  data={salaryData}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}k`}
                    domain={[0, 300]}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--chart-2))"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[13px] text-muted-foreground mt-3 text-center">
              Mediana: <span className="font-medium text-foreground">$180k</span>/ano
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teaser for more */}
      <div className="text-center space-y-4">
        <p className="text-[15px] text-muted-foreground">
          Vesting, cliff, instrumentos e mais 10 cargos disponíveis na plataforma.
        </p>
        <Link href="/request-access">
          <Button variant="outline" className="rounded-full px-8">
            Ver todos os benchmarks — grátis
          </Button>
        </Link>
      </div>
    </div>
  );
}
