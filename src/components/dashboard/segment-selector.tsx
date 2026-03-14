"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES, STAGES, COUNTRIES } from "@/lib/types";

interface Props {
  country: string;
  role: string;
  stage: string;
  onCountryChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onStageChange: (v: string) => void;
}

export function SegmentSelector({
  country, role, stage,
  onCountryChange, onRoleChange, onStageChange,
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

      <FilterPill label="Cargo" active>
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="border-0 bg-transparent shadow-none h-auto p-0 text-[13px] font-semibold gap-1 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring [&>svg]:opacity-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterPill>

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
