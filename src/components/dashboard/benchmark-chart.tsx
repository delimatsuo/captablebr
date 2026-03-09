"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { BenchmarkResult, StageComparisonResult } from "@/lib/benchmarks";

// Indigo ramp + single teal accent
const INDIGO_LIGHT = "oklch(0.80 0.10 260)";
const INDIGO_MID = "oklch(0.55 0.20 260)";
const INDIGO_DARK = "oklch(0.40 0.18 260)";
const TEAL_ACCENT = "oklch(0.65 0.15 175)";
const INDIGO_MUTED = "oklch(0.70 0.08 260)";

interface Props {
  data: BenchmarkResult;
}

function formatUSD(value: number): string {
  return `$ ${value.toLocaleString("en-US")}`;
}

export function EquityPercentileChart({ data }: Props) {
  if (!data.equityPercentiles) return null;
  const { p25, p50, p75, avg } = data.equityPercentiles;
  const hasPercentiles = p25 > 0 && p50 > 0 && p75 > 0;

  const chartData = hasPercentiles
    ? [
        { name: "P25", value: p25, fill: INDIGO_LIGHT },
        { name: "Mediana", value: p50, fill: INDIGO_MID },
        { name: "P75", value: p75, fill: INDIGO_DARK },
        { name: "Média", value: avg, fill: TEAL_ACCENT },
      ]
    : [{ name: "Média", value: avg, fill: INDIGO_MID }];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Equity (%)</CardTitle>
        <CardDescription>
          {hasPercentiles
            ? "Distribuição em percentis do cap table"
            : "Média do mercado (amostra insuficiente para percentis)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 260)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Equity"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid oklch(0.91 0.01 260)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function VestingPercentileChart({ data }: Props) {
  if (!data.vestingPercentiles) return null;
  const { p25, p50, p75, avg } = data.vestingPercentiles;
  const hasPercentiles = p25 > 0 && p50 > 0 && p75 > 0;

  const chartData = hasPercentiles
    ? [
        { name: "P25", value: p25, fill: INDIGO_LIGHT },
        { name: "Mediana", value: p50, fill: INDIGO_MID },
        { name: "P75", value: p75, fill: INDIGO_DARK },
        { name: "Média", value: avg, fill: TEAL_ACCENT },
      ]
    : [{ name: "Média", value: avg, fill: INDIGO_MID }];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Vesting (meses)</CardTitle>
        <CardDescription>
          {hasPercentiles
            ? "Período de vesting por percentil"
            : "Média do mercado"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 260)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}m`}
            />
            <Tooltip
              formatter={(value) => [`${value} meses`, "Vesting"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid oklch(0.91 0.01 260)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CashCompensationChart({ data }: Props) {
  if (!data.cashPercentiles) return null;
  const { annualSalary, totalCash } = data.cashPercentiles;
  const hasPercentiles = annualSalary.p25 > 0 && annualSalary.p50 > 0 && annualSalary.p75 > 0;

  const salaryData = hasPercentiles
    ? [
        { name: "P25", value: annualSalary.p25, fill: INDIGO_LIGHT },
        { name: "Mediana", value: annualSalary.p50, fill: INDIGO_MID },
        { name: "P75", value: annualSalary.p75, fill: INDIGO_DARK },
        { name: "Média", value: annualSalary.avg, fill: TEAL_ACCENT },
      ]
    : [{ name: "Média", value: annualSalary.avg, fill: INDIGO_MID }];

  const cashData = hasPercentiles
    ? [
        { name: "P25", value: totalCash.p25, fill: INDIGO_LIGHT },
        { name: "Mediana", value: totalCash.p50, fill: INDIGO_MID },
        { name: "P75", value: totalCash.p75, fill: INDIGO_DARK },
        { name: "Média", value: totalCash.avg, fill: TEAL_ACCENT },
      ]
    : [{ name: "Média", value: totalCash.avg, fill: INDIGO_MID }];

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Salário Anual (USD)</CardTitle>
          <CardDescription>
            {hasPercentiles
              ? "Distribuição salarial por percentil"
              : "Média do mercado"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={salaryData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 260)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatUSD(Number(value)), "Salário"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid oklch(0.91 0.01 260)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {salaryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Remuneração Total Anual (USD)</CardTitle>
          <CardDescription>
            {hasPercentiles
              ? "Salário anual + bônus por percentil"
              : "Média do mercado"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cashData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 260)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatUSD(Number(value)), "Total anual"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid oklch(0.91 0.01 260)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {cashData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}

export function InstrumentDistributionChart({ data }: Props) {
  const entries = Object.entries(data.instrumentDistribution);
  if (entries.length === 0) return null;

  const instrumentColors = [INDIGO_MID, INDIGO_DARK, TEAL_ACCENT, INDIGO_LIGHT, INDIGO_MUTED];
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  const chartData = entries.map(([name, value], idx) => ({
    name: name.replace("Partnership Quotas (Cotas)", "Cotas"),
    value,
    fill: instrumentColors[idx % instrumentColors.length],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Instrumentos de equity</CardTitle>
        <CardDescription>Distribuição dos tipos de instrumento utilizados</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={90}
              strokeWidth={2}
              stroke="white"
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Pie>
            {/* Center label */}
            <text
              x="50%"
              y="42%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-2xl font-bold"
            >
              {total}
            </text>
            <text
              x="50%"
              y="52%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground text-xs"
            >
              registros
            </text>
            <Tooltip
              formatter={(value) => [`${value}%`, ""]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid oklch(0.91 0.01 260)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Multi-stage comparison charts (all stages side by side)
// ---------------------------------------------------------------------------

interface ComparisonProps {
  data: StageComparisonResult;
}

const STAGE_SHORT: Record<string, string> = {
  "Pre-Seed/Seed": "Seed",
  "Series A": "A",
  "Series B": "B",
  "Series C+": "C+",
};

export function StageEquityChart({ data }: ComparisonProps) {
  const chartData = data.stages.map((s) => ({
    stage: STAGE_SHORT[s.stage] ?? s.stage,
    P25: s.equity.p25,
    Mediana: s.equity.p50,
    P75: s.equity.p75,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Equity por Estágio (%)</CardTitle>
        <CardDescription>Evolução do equity ao longo das rodadas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 260)" />
            <XAxis
              dataKey="stage"
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, ""]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid oklch(0.91 0.01 260)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="P25" fill={INDIGO_LIGHT} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Mediana" fill={INDIGO_MID} radius={[4, 4, 0, 0]} />
            <Bar dataKey="P75" fill={INDIGO_DARK} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StageSalaryChart({ data }: ComparisonProps) {
  const chartData = data.stages.map((s) => ({
    stage: STAGE_SHORT[s.stage] ?? s.stage,
    P25: s.salary.p25,
    Mediana: s.salary.p50,
    P75: s.salary.p75,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Salário Anual por Estágio (USD)</CardTitle>
        <CardDescription>Evolução salarial ao longo das rodadas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 260)" />
            <XAxis
              dataKey="stage"
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => [formatUSD(Number(value)), ""]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid oklch(0.91 0.01 260)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="P25" fill={INDIGO_LIGHT} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Mediana" fill={INDIGO_MID} radius={[4, 4, 0, 0]} />
            <Bar dataKey="P75" fill={INDIGO_DARK} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StageTotalCashChart({ data }: ComparisonProps) {
  const chartData = data.stages.map((s) => ({
    stage: STAGE_SHORT[s.stage] ?? s.stage,
    P25: s.totalCash.p25,
    Mediana: s.totalCash.p50,
    P75: s.totalCash.p75,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Remuneração Total por Estágio (USD)</CardTitle>
        <CardDescription>Salário + bônus ao longo das rodadas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 260)" />
            <XAxis
              dataKey="stage"
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => [formatUSD(Number(value)), ""]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid oklch(0.91 0.01 260)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="P25" fill={INDIGO_LIGHT} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Mediana" fill={INDIGO_MID} radius={[4, 4, 0, 0]} />
            <Bar dataKey="P75" fill={INDIGO_DARK} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ data }: Props) {
  const isReference = data.dataSource === "market-reference";
  const metrics: { label: string; value: string; sub: string }[] = [];

  if (!isReference && data.commonCliff != null) {
    metrics.push({
      label: "Cliff mais comum",
      value: `${data.commonCliff}m`,
      sub: "meses",
    });
  }

  metrics.push({
    label: "Fonte",
    value: isReference ? "Referência" : data.sampleSize > 0 ? String(data.sampleSize) : "N >= 5",
    sub: isReference ? "Mercado EUA" : data.sampleSize > 0 ? "executivos" : "dados suficientes",
  });

  if (data.firstInRolePremium) {
    metrics.push(
      {
        label: "1o no cargo",
        value: `${data.firstInRolePremium.firstInRole}%`,
        sub: "equity médio",
      },
      {
        label: "Não é 1o",
        value: `${data.firstInRolePremium.notFirstInRole}%`,
        sub: "equity médio",
      }
    );
  }

  Object.entries(data.grantTypeDistribution).forEach(([type, pct]) => {
    metrics.push({
      label: type,
      value: `${pct}%`,
      sub: "dos grants",
    });
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <Card key={m.label} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-5 pb-4 px-5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {m.label}
            </span>
            <p className="text-3xl font-bold mt-1">{m.value}</p>
            {m.sub && (
              <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
