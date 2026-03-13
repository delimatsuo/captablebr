"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import type { BenchmarkResult, StageComparisonResult } from "@/lib/benchmarks";

// Refined palette — desaturated, harmonious
const C_LIGHT = "oklch(0.82 0.08 260)";
const C_MID = "oklch(0.55 0.16 260)";
const C_DARK = "oklch(0.38 0.14 260)";
const C_ACCENT = "oklch(0.62 0.12 175)";
const C_MUTED = "oklch(0.72 0.06 260)";
const GRID_COLOR = "oklch(0.94 0.003 260)";
const AXIS_COLOR = "oklch(0.54 0.01 260)";

const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
  padding: "10px 14px",
  fontSize: "13px",
};

interface Props {
  data: BenchmarkResult;
}

function formatUSD(value: number): string {
  return `$ ${value.toLocaleString("en-US")}`;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardContent className="pt-6 pb-4 px-6">
        <div className="mb-5">
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function EquityPercentileChart({ data }: Props) {
  if (!data.equityPercentiles) return null;
  const { p25, p50, p75, avg } = data.equityPercentiles;
  const hasPercentiles = p25 > 0 && p50 > 0 && p75 > 0;

  const chartData = hasPercentiles
    ? [
        { name: "P25", value: p25, fill: C_LIGHT },
        { name: "P50", value: p50, fill: C_MID },
        { name: "P75", value: p75, fill: C_DARK },
        { name: "Média", value: avg, fill: C_ACCENT },
      ]
    : [{ name: "Média", value: avg, fill: C_MID }];

  return (
    <ChartCard
      title="Equity (%)"
      subtitle={hasPercentiles ? "Distribuição em percentis" : "Média do mercado"}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={GRID_COLOR} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={45} />
          <Tooltip formatter={(value) => [`${value}%`, "Equity"]} contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function VestingPercentileChart({ data }: Props) {
  if (!data.vestingPercentiles) return null;
  const { p25, p50, p75, avg } = data.vestingPercentiles;
  const hasPercentiles = p25 > 0 && p50 > 0 && p75 > 0;

  const chartData = hasPercentiles
    ? [
        { name: "P25", value: p25, fill: C_LIGHT },
        { name: "P50", value: p50, fill: C_MID },
        { name: "P75", value: p75, fill: C_DARK },
        { name: "Média", value: avg, fill: C_ACCENT },
      ]
    : [{ name: "Média", value: avg, fill: C_MID }];

  return (
    <ChartCard
      title="Vesting (meses)"
      subtitle={hasPercentiles ? "Período por percentil" : "Média do mercado"}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={GRID_COLOR} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} width={40} />
          <Tooltip formatter={(value) => [`${value} meses`, "Vesting"]} contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CashCompensationChart({ data }: Props) {
  if (!data.cashPercentiles) return null;
  const { annualSalary, totalCash } = data.cashPercentiles;
  const hasPercentiles = annualSalary.p25 > 0 && annualSalary.p50 > 0 && annualSalary.p75 > 0;

  const salaryData = hasPercentiles
    ? [
        { name: "P25", value: annualSalary.p25, fill: C_LIGHT },
        { name: "P50", value: annualSalary.p50, fill: C_MID },
        { name: "P75", value: annualSalary.p75, fill: C_DARK },
        { name: "Média", value: annualSalary.avg, fill: C_ACCENT },
      ]
    : [{ name: "Média", value: annualSalary.avg, fill: C_MID }];

  const cashData = hasPercentiles
    ? [
        { name: "P25", value: totalCash.p25, fill: C_LIGHT },
        { name: "P50", value: totalCash.p50, fill: C_MID },
        { name: "P75", value: totalCash.p75, fill: C_DARK },
        { name: "Média", value: totalCash.avg, fill: C_ACCENT },
      ]
    : [{ name: "Média", value: totalCash.avg, fill: C_MID }];

  return (
    <>
      <ChartCard
        title="Salário Anual (USD)"
        subtitle={hasPercentiles ? "Distribuição salarial" : "Média do mercado"}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={salaryData} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={45} />
            <Tooltip formatter={(value) => [formatUSD(Number(value)), "Salário"]} contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {salaryData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Remuneração Total (USD)"
        subtitle={hasPercentiles ? "Salário + bônus" : "Média do mercado"}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={cashData} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={45} />
            <Tooltip formatter={(value) => [formatUSD(Number(value)), "Total"]} contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {cashData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

export function InstrumentDistributionChart({ data }: Props) {
  const entries = Object.entries(data.instrumentDistribution);
  if (entries.length === 0) return null;

  const instrumentColors = [C_MID, C_DARK, C_ACCENT, C_LIGHT, C_MUTED];
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  const chartData = entries.map(([name, value], idx) => ({
    name: name.replace("Partnership Quotas (Cotas)", "Cotas"),
    value,
    fill: instrumentColors[idx % instrumentColors.length],
  }));

  return (
    <ChartCard title="Instrumentos de equity" subtitle="Distribuição por tipo de instrumento">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={95}
            strokeWidth={3}
            stroke="var(--card)"
          >
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
          </Pie>
          <text
            x="50%"
            y="42%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-2xl font-semibold"
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
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Multi-stage comparison charts
// ---------------------------------------------------------------------------

interface ComparisonProps {
  data: StageComparisonResult;
}

const STAGE_SHORT: Record<string, string> = {
  "Pre-Seed/Seed": "Seed",
  "Series A": "Series A",
  "Series B": "Series B",
  "Series C+": "Series C+",
};

export function StageEquityChart({ data }: ComparisonProps) {
  const chartData = data.stages.map((s) => ({
    stage: STAGE_SHORT[s.stage] ?? s.stage,
    P25: s.equity.p25,
    P50: s.equity.p50,
    P75: s.equity.p75,
  }));

  return (
    <ChartCard title="Equity por Estágio (%)" subtitle="Evolução do equity ao longo das rodadas">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barCategoryGap="25%">
          <CartesianGrid vertical={false} stroke={GRID_COLOR} />
          <XAxis dataKey="stage" tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={45} />
          <Tooltip formatter={(value, name) => [`${value}%`, `${name}:`]} itemSorter={(item) => -(item.value as number)} contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Bar dataKey="P25" fill={C_LIGHT} radius={[8, 8, 0, 0]} />
          <Bar dataKey="P50" fill={C_MID} radius={[8, 8, 0, 0]} />
          <Bar dataKey="P75" fill={C_DARK} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StageSalaryChart({ data }: ComparisonProps) {
  const chartData = data.stages.map((s) => ({
    stage: STAGE_SHORT[s.stage] ?? s.stage,
    P25: s.salary.p25,
    P50: s.salary.p50,
    P75: s.salary.p75,
  }));

  return (
    <ChartCard title="Salário Anual por Estágio (USD)" subtitle="Evolução salarial ao longo das rodadas">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barCategoryGap="25%">
          <CartesianGrid vertical={false} stroke={GRID_COLOR} />
          <XAxis dataKey="stage" tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={45} />
          <Tooltip formatter={(value, name) => [formatUSD(Number(value)), `${name}:`]} itemSorter={(item) => -(item.value as number)} contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Bar dataKey="P25" fill={C_LIGHT} radius={[8, 8, 0, 0]} />
          <Bar dataKey="P50" fill={C_MID} radius={[8, 8, 0, 0]} />
          <Bar dataKey="P75" fill={C_DARK} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StageTotalCashChart({ data }: ComparisonProps) {
  const chartData = data.stages.map((s) => ({
    stage: STAGE_SHORT[s.stage] ?? s.stage,
    P25: s.totalCash.p25,
    P50: s.totalCash.p50,
    P75: s.totalCash.p75,
  }));

  return (
    <ChartCard title="Remuneração Total por Estágio (USD)" subtitle="Salário + bônus ao longo das rodadas">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barCategoryGap="25%">
          <CartesianGrid vertical={false} stroke={GRID_COLOR} />
          <XAxis dataKey="stage" tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={45} />
          <Tooltip formatter={(value, name) => [formatUSD(Number(value)), `${name}:`]} itemSorter={(item) => -(item.value as number)} contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
          <Bar dataKey="P25" fill={C_LIGHT} radius={[8, 8, 0, 0]} />
          <Bar dataKey="P50" fill={C_MID} radius={[8, 8, 0, 0]} />
          <Bar dataKey="P75" fill={C_DARK} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
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
        <Card key={m.label} className="border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:scale-[1.02]">
          <CardContent className="pt-5 pb-4 px-5">
            <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
              {m.label}
            </span>
            <p className="text-2xl font-semibold mt-1.5 tracking-tight">{m.value}</p>
            {m.sub && (
              <p className="text-[12px] text-muted-foreground/70 mt-0.5">{m.sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
