"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const data = [
  { name: "p25", value: 0.3 },
  { name: "p50", value: 0.8 },
  { name: "p75", value: 1.5 },
];

export function BenchmarkPreview() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">CTOs em Series A — Equity (%)</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Exemplo ilustrativo
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 13 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
                domain={[0, 2]}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Equity"]}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                maxBarSize={80}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Frosted-glass overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
          <p className="text-lg font-semibold mb-4 text-foreground">
            Cadastre-se para ver dados reais
          </p>
          <Link href="/request-access">
            <Button size="lg" className="shadow-lg shadow-primary/25">
              Cadastre-se grátis
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
