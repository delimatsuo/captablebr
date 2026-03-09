"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
    <div className="flex flex-wrap items-end gap-4 p-5 rounded-xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      {/* Market filter */}
      <div className="space-y-1.5 min-w-[140px] flex-1">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Mercado
        </Label>
        <Select value={country} onValueChange={onCountryChange}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os mercados</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-10 bg-border self-end" />

      {/* Primary: Role selector */}
      <div className="space-y-1.5 min-w-[200px] flex-1">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Cargo
        </Label>
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="h-10 font-semibold"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-10 bg-border self-end" />

      {/* Stage filter */}
      <div className="space-y-1.5 min-w-[140px] flex-1">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Estágio
        </Label>
        <Select value={stage} onValueChange={onStageChange}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estágios</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
