"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  C_LIGHT, C_MID, C_DARK, C_ACCENT, C_MUTED,
  GRID_COLOR, AXIS_COLOR, TOOLTIP_STYLE,
} from "@/lib/chart-constants";
import type { SimGrant, MonthDataPoint } from "@/lib/vesting-simulator";

const AREA_COLORS = [C_MID, C_DARK, C_ACCENT, C_LIGHT, C_MUTED];

interface SimulatorChartProps {
  grants: SimGrant[];
  timeline: MonthDataPoint[];
  currencySymbol: string;
}

function formatCompactAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(Math.round(value));
}

function formatCurrency(value: number, symbol: string): string {
  return `${symbol} ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, grants, currencySymbol }: any) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as MonthDataPoint | undefined;
  if (!point) return null;

  const dateStr = point.date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

  // Sort grants by value descending for tooltip
  const grantValues = grants
    .map((g: SimGrant, i: number) => ({
      label: g.label,
      value: point.byGrant[g.id] || 0,
      color: AREA_COLORS[i % AREA_COLORS.length],
    }))
    .filter((g: { value: number }) => g.value > 0)
    .sort((a: { value: number }, b: { value: number }) => b.value - a.value);

  return (
    <div
      style={{
        ...TOOLTIP_STYLE,
        background: "var(--popover)",
        color: "var(--popover-foreground)",
      }}
    >
      <p className="text-[12px] text-muted-foreground mb-1.5">{dateStr}</p>
      {grantValues.map((g: { label: string; value: number; color: string }) => (
        <div key={g.label} className="flex items-center justify-between gap-4 text-[13px]">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: g.color }}
            />
            <span>{g.label}</span>
          </div>
          <span className="font-medium tabular-nums">
            {formatCurrency(g.value, currencySymbol)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-4 text-[13px] font-semibold mt-1.5 pt-1.5 border-t border-border/50">
        <span>Total</span>
        <span className="tabular-nums">
          {formatCurrency(point.totalValue, currencySymbol)}
        </span>
      </div>
    </div>
  );
}

export function SimulatorChart({ grants, timeline, currencySymbol }: SimulatorChartProps) {
  if (timeline.length === 0) return null;

  // Build chart data with date labels and per-grant values
  const chartData = timeline.map((point) => {
    const entry: Record<string, unknown> = {
      month: point.month,
      date: point.date,
      dateLabel: point.date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
    };
    for (const grant of grants) {
      entry[grant.id] = point.byGrant[grant.id] || 0;
    }
    return entry;
  });

  // Show year ticks only
  const yearTicks = chartData
    .filter((_, i) => i % 12 === 0)
    .map((d) => d.month as number);

  return (
    <Card className="border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardContent className="pt-6 pb-4 px-6">
        <div className="mb-5">
          <h3 className="text-[15px] font-semibold text-foreground">
            Projeção de valor
          </h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Valor estimado dos grants ao longo do tempo
          </p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis
              dataKey="month"
              ticks={yearTicks}
              tickFormatter={(month: number) => {
                const d = timeline[month]?.date;
                return d ? String(d.getFullYear()) : "";
              }}
              tick={{ fontSize: 12, fill: AXIS_COLOR }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: AXIS_COLOR }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCompactAxis}
              width={55}
            />
            <Tooltip
              content={
                <CustomTooltip grants={grants} currencySymbol={currencySymbol} />
              }
            />
            <ReferenceLine
              x={0}
              stroke={AXIS_COLOR}
              strokeDasharray="4 4"
              label={{
                value: "Hoje",
                position: "insideTopRight",
                fontSize: 11,
                fill: AXIS_COLOR,
              }}
            />
            {grants.map((grant, i) => (
              <Area
                key={grant.id}
                type="monotone"
                dataKey={grant.id}
                name={grant.label}
                stackId="1"
                stroke={AREA_COLORS[i % AREA_COLORS.length]}
                fill={AREA_COLORS[i % AREA_COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
