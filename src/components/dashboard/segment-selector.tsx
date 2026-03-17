"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ROLE_LEVELS, ROLE_FUNCTIONS, ROLE_LEVEL_LABELS, ROLE_FUNCTION_LABELS,
  STAGES, COUNTRIES,
  type RoleLevel, type RoleFunction,
} from "@/lib/types";

interface Props {
  country: string;
  roleLevel: string;
  roleFunction: string;
  stage: string;
  onCountryChange: (v: string) => void;
  onRoleLevelChange: (v: string) => void;
  onRoleFunctionChange: (v: string) => void;
  onStageChange: (v: string) => void;
}

export function SegmentSelector({
  country, roleLevel, roleFunction, stage,
  onCountryChange, onRoleLevelChange, onRoleFunctionChange, onStageChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterPill label="Mercado">
        <Select value={country} onValueChange={onCountryChange}>
          <SelectTrigger className="border-0 bg-transparent shadow-none h-auto p-0 text-[13px] font-medium gap-1 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring [&>svg]:opacity-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os mercados</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterPill>

      <FilterPill label="Nível" active>
        <Select
          value={roleLevel}
          onValueChange={(v) => {
            onRoleLevelChange(v);
            if (v === "CEO") {
              onRoleFunctionChange("all");
            } else if (roleLevel === "CEO") {
              // Switching away from CEO — set a valid default function
              onRoleFunctionChange("Engineering");
            }
          }}
        >
          <SelectTrigger className="border-0 bg-transparent shadow-none h-auto p-0 text-[13px] font-semibold gap-1 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring [&>svg]:opacity-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>{ROLE_LEVEL_LABELS[l]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterPill>

      {roleLevel !== "CEO" && (
        <FilterPill label="Função" active>
          <Select value={roleFunction} onValueChange={onRoleFunctionChange}>
            <SelectTrigger className="border-0 bg-transparent shadow-none h-auto p-0 text-[13px] font-semibold gap-1 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring [&>svg]:opacity-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FUNCTIONS.map((f) => (
                <SelectItem key={f} value={f}>{ROLE_FUNCTION_LABELS[f]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterPill>
      )}

      <FilterPill label="Estágio">
        <Select value={stage} onValueChange={onStageChange}>
          <SelectTrigger className="border-0 bg-transparent shadow-none h-auto p-0 text-[13px] font-medium gap-1 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring [&>svg]:opacity-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estágios</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterPill>
    </div>
  );
}

function FilterPill({ label, active, children }: { label: string; active?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
      active ? "bg-foreground/[0.06]" : "bg-foreground/[0.03] hover:bg-foreground/[0.05]"
    }`}>
      <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
        {label}
      </span>
      {children}
    </div>
  );
}
