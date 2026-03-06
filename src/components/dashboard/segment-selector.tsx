"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ROLES, STAGES, BUSINESS_MODELS, SECTORS } from "@/lib/types";

interface Props {
  role: string;
  stage: string;
  businessModel: string;
  sector: string;
  onRoleChange: (v: string) => void;
  onStageChange: (v: string) => void;
  onBusinessModelChange: (v: string) => void;
  onSectorChange: (v: string) => void;
}

export function SegmentSelector({
  role, stage, businessModel, sector,
  onRoleChange, onStageChange, onBusinessModelChange, onSectorChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4 p-5 rounded-xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
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

      {/* Secondary filters */}
      <div className="space-y-1.5 min-w-[140px] flex-1">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Estagio
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

      <div className="space-y-1.5 min-w-[140px] flex-1">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Modelo
        </Label>
        <Select value={businessModel} onValueChange={onBusinessModelChange}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os modelos</SelectItem>
            {BUSINESS_MODELS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 min-w-[140px] flex-1">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Setor
        </Label>
        <Select value={sector} onValueChange={onSectorChange}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os setores</SelectItem>
            {SECTORS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
