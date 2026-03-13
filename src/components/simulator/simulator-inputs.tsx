"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface SimulatorInputsProps {
  sharePrice: number;
  onSharePriceChange: (v: number) => void;
  growthRate: number;
  onGrowthRateChange: (v: number) => void;
  horizonYears: number;
  onHorizonYearsChange: (v: number) => void;
  currencySymbol: string;
}

export function SimulatorInputs({
  sharePrice,
  onSharePriceChange,
  growthRate,
  onGrowthRateChange,
  horizonYears,
  onHorizonYearsChange,
  currencySymbol,
}: SimulatorInputsProps) {
  return (
    <Card className="border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardContent className="pt-6 pb-5 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Share price */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide block mb-2">
              Valor por ação ({currencySymbol})
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={sharePrice || ""}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onSharePriceChange(Number.isFinite(v) && v >= 0 ? v : 0);
              }}
              placeholder="0.00"
              className="tabular-nums"
            />
          </div>

          {/* Growth rate slider */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide block mb-2">
              Crescimento anual
            </label>
            <div className="flex items-center gap-3">
              <Slider
                value={[growthRate * 100]}
                onValueChange={([v]) => onGrowthRateChange(v / 100)}
                min={-20}
                max={50}
                step={5}
                className="flex-1"
              />
              <span className="text-[14px] font-medium tabular-nums w-12 text-right">
                {growthRate >= 0 ? "+" : ""}{Math.round(growthRate * 100)}%
              </span>
            </div>
          </div>

          {/* Horizon slider */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide block mb-2">
              Horizonte
            </label>
            <div className="flex items-center gap-3">
              <Slider
                value={[horizonYears]}
                onValueChange={([v]) => onHorizonYearsChange(v)}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-[14px] font-medium tabular-nums w-16 text-right">
                {horizonYears} {horizonYears === 1 ? "ano" : "anos"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
