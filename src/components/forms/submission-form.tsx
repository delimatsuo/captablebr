"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectItemWithDescription, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  STAGES, BUSINESS_MODELS, SECTORS, HEADCOUNT_RANGES,
  ROLES, INSTRUMENT_TYPES, VESTING_SCHEDULES, GRANT_TYPES,
  EXPERIENCE_RANGES, CONTRACT_TYPES,
  type InputMode,
} from "@/lib/types";
import { submissionSchema, type SubmissionFormData } from "@/lib/validations";
import { upsertSubmission, upsertSubmissionFromAi, deleteMyData } from "@/lib/actions";
import { EquityInput } from "./equity-input";

const DRAFT_KEY = "captablebr-draft";
const DRAFT_VERSION = 2; // Increment when schema changes to discard incompatible drafts
const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

interface Props {
  initialData?: Partial<SubmissionFormData> | null;
  sourceDocumentUrl?: string;
  isAiExtracted?: boolean;
}

const STEPS = [
  { label: "Sobre a empresa", number: 1 },
  { label: "Sua compensação", number: 2 },
  { label: "Confirmar", number: 3 },
];

const INSTRUMENT_DESCRIPTIONS: Record<string, string> = {
  "Stock Options": "Direito de comprar ações a um preço pré-definido (strike price)",
  "Phantom Stock": "Bônus em dinheiro atrelado ao valor das ações, sem participação societária real",
  "RSU": "Ações restritas concedidas que vestem ao longo do tempo",
  "Partnership Quotas (Cotas)": "Participação societária direta em cotas da empresa (modelo Ltda.)",
  "SAR": "Stock Appreciation Rights — direito de receber a valorização das ações em dinheiro",
  "Vesting Shares": "Ações adquiridas progressivamente conforme cronograma de vesting",
  "Other": "Outro instrumento de equity",
};

const GRANT_TYPE_DESCRIPTIONS: Record<string, string> = {
  "New-hire": "Primeiro grant recebido ao entrar na empresa",
  "Ongoing/Refresh": "Grant adicional para retenção ou renovação",
  "Promotion": "Grant recebido por promoção de cargo",
};

const VESTING_SCHEDULE_DESCRIPTIONS: Record<string, string> = {
  "Monthly after cliff": "Vesting mensal após o período de cliff",
  "Quarterly after cliff": "Vesting trimestral após o período de cliff",
  "Annual": "Vesting anual em parcelas iguais",
  "Cliff only (all at once)": "100% do equity liberado de uma vez ao final do cliff",
  "Other": "Outro cronograma de vesting",
};

function formatBRL(value: number | undefined): string {
  if (value == null) return "—";
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

export function SubmissionForm({ initialData, sourceDocumentUrl, isAiExtracted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [step, setStep] = useState(1);
  const [draftRestored, setDraftRestored] = useState(false);
  const [formData, setFormData] = useState<Partial<SubmissionFormData>>({
    isFirstInRole: false,
    inputMode: "percentage",
    ...initialData,
  });

  // Restore draft from localStorage on mount
  useEffect(() => {
    if (initialData) return; // Don't restore draft if we have server data
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.version !== DRAFT_VERSION || Date.now() - draft.timestamp > DRAFT_MAX_AGE) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      setFormData(draft.formData);
      setStep(draft.step || 1);
      setDraftRestored(true);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [initialData]);

  // Show toast when draft is restored
  useEffect(() => {
    if (draftRestored) {
      toast.info("Rascunho restaurado");
      setDraftRestored(false);
    }
  }, [draftRestored]);

  // Auto-save to localStorage on formData/step change
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        version: DRAFT_VERSION,
        step,
        formData,
        timestamp: Date.now(),
      }));
    } catch {
      // localStorage full or unavailable
    }
  }, [step, formData]);

  useEffect(() => {
    saveDraft();
  }, [saveDraft]);

  function update(field: keyof SubmissionFormData, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvanceStep1() {
    return formData.stage && formData.businessModel && formData.sector && formData.headcountRange;
  }

  function canAdvanceStep2() {
    const hasEquity = formData.inputMode === "shares"
      ? formData.numberOfShares != null
      : formData.equityPercentage != null;
    const needsStrike = formData.instrumentType === "Stock Options" || formData.instrumentType === "SAR";
    const hasStrike = !needsStrike || formData.strikePrice != null;
    return (
      formData.role &&
      formData.instrumentType &&
      hasEquity &&
      hasStrike &&
      formData.vestingTotalMonths != null &&
      formData.cliffMonths != null &&
      formData.vestingSchedule &&
      formData.grantType
    );
  }

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      // Compute equityPercentage for client-side validation
      if (dataToSubmit.inputMode === "shares" && dataToSubmit.numberOfShares) {
        if (dataToSubmit.totalSharesOutstanding) {
          dataToSubmit.equityPercentage = (dataToSubmit.numberOfShares / dataToSubmit.totalSharesOutstanding) * 100;
        } else if (dataToSubmit.lastValuation && dataToSubmit.currentSharePrice && dataToSubmit.currentSharePrice > 0) {
          const derivedTotal = dataToSubmit.lastValuation / dataToSubmit.currentSharePrice;
          dataToSubmit.equityPercentage = (dataToSubmit.numberOfShares / derivedTotal) * 100;
        }
      }
      const validated = submissionSchema.parse(dataToSubmit);

      if (isAiExtracted && sourceDocumentUrl) {
        await upsertSubmissionFromAi(validated, sourceDocumentUrl);
      } else {
        await upsertSubmission(validated);
      }

      clearDraft();
      toast.success("Dados salvos com sucesso!");
      router.push("/benchmarks");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const zodErr = err as { errors: { message: string }[] };
        toast.error(zodErr.errors[0]?.message || "Dados inválidos");
      } else {
        toast.error("Erro ao salvar");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteData() {
    setDeleting(true);
    try {
      await deleteMyData();
      clearDraft();
      toast.success("Dados excluídos");
      router.push("/submit");
      router.refresh();
    } catch {
      toast.error("Erro ao excluir dados");
    } finally {
      setDeleting(false);
    }
  }

  // Compute equity summary text for step 3
  function equitySummary(): string {
    if (formData.inputMode === "shares" && formData.numberOfShares) {
      const sharesStr = formData.numberOfShares.toLocaleString("pt-BR");
      let pct: number | null = null;
      if (formData.totalSharesOutstanding && formData.totalSharesOutstanding > 0) {
        pct = (formData.numberOfShares / formData.totalSharesOutstanding) * 100;
      } else if (formData.lastValuation && formData.currentSharePrice && formData.currentSharePrice > 0) {
        const derivedTotal = formData.lastValuation / formData.currentSharePrice;
        pct = (formData.numberOfShares / derivedTotal) * 100;
      }
      if (pct != null && pct >= 0.001 && pct <= 30) {
        return `${sharesStr} ações (${pct.toFixed(4)}%)`;
      }
      return `${sharesStr} ações (% não calculado)`;
    }
    return formData.equityPercentage != null ? `${formData.equityPercentage}%` : "—";
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (s.number < step) setStep(s.number);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                step === s.number
                  ? "bg-primary text-primary-foreground"
                  : step > s.number
                    ? "bg-primary/10 text-primary cursor-pointer"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {step > s.number ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  s.number
                )}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px w-8", step > s.number ? "bg-primary" : "bg-muted")} />
            )}
          </div>
        ))}
      </div>

      {isAiExtracted && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </div>
          <div>
            <p className="text-sm font-medium">Dados extraídos por IA</p>
            <p className="text-xs text-muted-foreground">Revise e corrija os campos abaixo antes de confirmar</p>
          </div>
        </div>
      )}

      {/* Step 1: Company context */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sobre a empresa onde você trabalha</CardTitle>
            <CardDescription>Não identificamos sua empresa nos benchmarks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Estágio *</Label>
                <Select value={formData.stage} onValueChange={(v) => update("stage", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modelo de negócio *</Label>
                <Select value={formData.businessModel} onValueChange={(v) => update("businessModel", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Setor *</Label>
                <Select value={formData.sector} onValueChange={(v) => update("sector", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Funcionários *</Label>
                <Select value={formData.headcountRange} onValueChange={(v) => update("headcountRange", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {HEADCOUNT_RANGES.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sub-setor</Label>
              <Input
                value={formData.subSector || ""}
                onChange={(e) => update("subSector", e.target.value || undefined)}
                placeholder="Ex: Open Banking"
                className="h-11"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Compensation */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sua compensação</CardTitle>
            <CardDescription>Dados sobre seu pacote de equity e remuneração</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role & equity */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Cargo e equity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Cargo *</Label>
                  <Select value={formData.role} onValueChange={(v) => update("role", v)}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Instrumento *</Label>
                  <Select value={formData.instrumentType} onValueChange={(v) => update("instrumentType", v)}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {INSTRUMENT_TYPES.map((i) => (
                        <SelectItemWithDescription key={i} value={i} textValue={i} label={i} description={INSTRUMENT_DESCRIPTIONS[i]} className="py-2.5" />
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <EquityInput
                    inputMode={(formData.inputMode as InputMode) || "percentage"}
                    equityPercentage={formData.equityPercentage}
                    numberOfShares={formData.numberOfShares}
                    totalSharesOutstanding={formData.totalSharesOutstanding}
                    currentSharePrice={formData.currentSharePrice}
                    lastValuation={formData.lastValuation}
                    onInputModeChange={(mode) => update("inputMode", mode)}
                    onEquityPercentageChange={(v) => update("equityPercentage", v)}
                    onNumberOfSharesChange={(v) => update("numberOfShares", v)}
                    onTotalSharesOutstandingChange={(v) => update("totalSharesOutstanding", v)}
                    onCurrentSharePriceChange={(v) => update("currentSharePrice", v)}
                    onLastValuationChange={(v) => update("lastValuation", v)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Grant *</Label>
                  <Select value={formData.grantType} onValueChange={(v) => update("grantType", v)}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {GRANT_TYPES.map((g) => (
                        <SelectItemWithDescription key={g} value={g} textValue={g} label={g} description={GRANT_TYPE_DESCRIPTIONS[g]} className="py-2.5" />
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Strike price — conditional on Stock Options or SAR */}
              {(formData.instrumentType === "Stock Options" || formData.instrumentType === "SAR") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <div className="space-y-2">
                    <Label>Preço de exercício (strike price) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.strikePrice ?? ""}
                      onChange={(e) => update("strikePrice", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Ex: 1.50"
                      className="h-11"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Valor em BRL</p>
                  </div>
                </div>
              )}

              {/* Optional grant metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                <div className="space-y-2">
                  <Label>Data do grant</Label>
                  <Input
                    type="date"
                    value={formData.grantDate instanceof Date ? formData.grantDate.toISOString().split("T")[0] : String(formData.grantDate || "").split("T")[0]}
                    onChange={(e) => update("grantDate", e.target.value || undefined)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rótulo do grant</Label>
                  <Input
                    value={formData.grantLabel || ""}
                    onChange={(e) => update("grantLabel", e.target.value || undefined)}
                    placeholder="Ex: New-hire grant 2024"
                    className="h-11"
                    maxLength={100}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Vesting */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Vesting</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label>Período Total (meses) *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.vestingTotalMonths ?? ""}
                    onChange={(e) => update("vestingTotalMonths", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 48"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cliff (meses) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="48"
                    value={formData.cliffMonths ?? ""}
                    onChange={(e) => update("cliffMonths", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 12"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cronograma *</Label>
                  <Select value={formData.vestingSchedule} onValueChange={(v) => update("vestingSchedule", v)}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {VESTING_SCHEDULES.map((s) => (
                        <SelectItemWithDescription key={s} value={s} textValue={s} label={s} description={VESTING_SCHEDULE_DESCRIPTIONS[s]} className="py-2.5" />
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                <div className="space-y-2">
                  <Label>Início do vesting</Label>
                  <Input
                    type="date"
                    value={formData.vestingStartDate instanceof Date ? formData.vestingStartDate.toISOString().split("T")[0] : String(formData.vestingStartDate || "").split("T")[0]}
                    onChange={(e) => update("vestingStartDate", e.target.value || undefined)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile & comp */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Remuneração e perfil</p>
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Checkbox
                    id="isFirstInRole"
                    checked={formData.isFirstInRole}
                    onCheckedChange={(v) => update("isFirstInRole", v === true)}
                  />
                  <div>
                    <Label htmlFor="isFirstInRole" className="font-medium cursor-pointer">
                      Primeira contratação externa para este cargo
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Selecione se você foi o primeiro executivo contratado do mercado para esta posição
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Tipo de contrato</Label>
                    <Select
                      value={formData.contractType || ""}
                      onValueChange={(v) => update("contractType", v || undefined)}
                    >
                      <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {CONTRACT_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Salário mensal bruto (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="500000"
                      value={formData.monthlySalary ?? ""}
                      onChange={(e) => update("monthlySalary", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Ex: 45000"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ano da Contratação</Label>
                    <Input
                      type="number"
                      min="2000"
                      max={new Date().getFullYear()}
                      value={formData.hireYear ?? ""}
                      onChange={(e) => update("hireYear", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Ex: 2024"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sua experiência</Label>
                    <Select
                      value={formData.yearsExperience || ""}
                      onValueChange={(v) => update("yearsExperience", v || undefined)}
                    >
                      <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_RANGES.map((e) => <SelectItem key={e} value={e}>{e} anos</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Incentives */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Incentivos de curto prazo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="hasAnnualBonus"
                      checked={formData.hasAnnualBonus || false}
                      onCheckedChange={(v) => {
                        update("hasAnnualBonus", v === true);
                        if (!v) update("annualBonus", undefined);
                      }}
                    />
                    <Label htmlFor="hasAnnualBonus" className="font-medium cursor-pointer text-sm">Bônus anual</Label>
                  </div>
                  {formData.hasAnnualBonus && (
                    <Input
                      type="number"
                      min="0"
                      max="5000000"
                      value={formData.annualBonus ?? ""}
                      onChange={(e) => update("annualBonus", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Valor em R$"
                      className="h-10"
                    />
                  )}
                </div>

                <div className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="hasCommission"
                      checked={formData.hasCommission || false}
                      onCheckedChange={(v) => {
                        update("hasCommission", v === true);
                        if (!v) update("commission", undefined);
                      }}
                    />
                    <Label htmlFor="hasCommission" className="font-medium cursor-pointer text-sm">Comissões</Label>
                  </div>
                  {formData.hasCommission && (
                    <Input
                      type="number"
                      min="0"
                      max="5000000"
                      value={formData.commission ?? ""}
                      onChange={(e) => update("commission", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Valor em R$"
                      className="h-10"
                    />
                  )}
                </div>

                <div className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="hasRetentionPlan"
                      checked={formData.hasRetentionPlan || false}
                      onCheckedChange={(v) => {
                        update("hasRetentionPlan", v === true);
                        if (!v) update("retentionAmount", undefined);
                      }}
                    />
                    <Label htmlFor="hasRetentionPlan" className="font-medium cursor-pointer text-sm">Plano de retenção</Label>
                  </div>
                  {formData.hasRetentionPlan && (
                    <Input
                      type="number"
                      min="0"
                      max="5000000"
                      value={formData.retentionAmount ?? ""}
                      onChange={(e) => update("retentionAmount", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Valor em R$"
                      className="h-10"
                    />
                  )}
                </div>

                <div className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="hasSignOn"
                      checked={formData.hasSignOn || false}
                      onCheckedChange={(v) => {
                        update("hasSignOn", v === true);
                        if (!v) update("signOnAmount", undefined);
                      }}
                    />
                    <Label htmlFor="hasSignOn" className="font-medium cursor-pointer text-sm">Sign-on bonus</Label>
                  </div>
                  {formData.hasSignOn && (
                    <Input
                      type="number"
                      min="0"
                      max="5000000"
                      value={formData.signOnAmount ?? ""}
                      onChange={(e) => update("signOnAmount", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Valor em R$"
                      className="h-10"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confirmar dados</CardTitle>
            <CardDescription>
              Seus dados são anonimizados e agregados. Benchmarks aparecem quando 10+ executivos contribuem no seu segmento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Empresa</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryItem label="Estágio" value={formData.stage} />
                  <SummaryItem label="Modelo" value={formData.businessModel} />
                  <SummaryItem label="Setor" value={formData.sector} />
                  <SummaryItem label="Funcionários" value={formData.headcountRange} />
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Compensação</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryItem label="Cargo" value={formData.role} />
                  <SummaryItem label="Instrumento" value={formData.instrumentType} />
                  <SummaryItem label="Equity" value={equitySummary()} />
                  <SummaryItem label="Tipo" value={formData.grantType} />
                  <SummaryItem label="Vesting" value={formData.vestingTotalMonths != null ? `${formData.vestingTotalMonths} meses` : undefined} />
                  <SummaryItem label="Cliff" value={formData.cliffMonths != null ? `${formData.cliffMonths} meses` : undefined} />
                  <SummaryItem label="Cronograma" value={formData.vestingSchedule} />
                  <SummaryItem label="Primeiro no cargo" value={formData.isFirstInRole ? "Sim" : "Não"} />
                  {formData.strikePrice != null && (
                    <SummaryItem label="Strike price" value={`R$ ${formData.strikePrice}`} />
                  )}
                  {formData.grantDate && (
                    <SummaryItem label="Data do grant" value={formData.grantDate instanceof Date ? formData.grantDate.toLocaleDateString("pt-BR") : String(formData.grantDate)} />
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Remuneração</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.contractType && <SummaryItem label="Contrato" value={formData.contractType} />}
                  <SummaryItem label="Salário mensal" value={formatBRL(formData.monthlySalary)} />
                  {formData.hasAnnualBonus && <SummaryItem label="Bônus anual" value={formatBRL(formData.annualBonus)} />}
                  {formData.hasCommission && <SummaryItem label="Comissão" value={formatBRL(formData.commission)} />}
                  {formData.hasRetentionPlan && <SummaryItem label="Retenção" value={formatBRL(formData.retentionAmount)} />}
                  {formData.hasSignOn && <SummaryItem label="Sign-on" value={formatBRL(formData.signOnAmount)} />}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Email para notificações (opcional)</Label>
              <Input
                type="email"
                value={formData.notifyEmail || ""}
                onChange={(e) => update("notifyEmail", e.target.value || undefined)}
                placeholder="seu@email.com"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Receba um aviso quando os benchmarks do seu segmento estiverem disponíveis
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="h-11 px-6">
              Voltar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canAdvanceStep1() : !canAdvanceStep2()}
              className="h-11 px-8"
            >
              Continuar
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="h-11 px-8"
            >
              {loading ? "Salvando..." : isAiExtracted ? "Confirmar e salvar" : "Enviar"}
            </Button>
          )}
        </div>
      </div>

      {/* Draft discard + LGPD delete */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <button
          type="button"
          className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          onClick={() => {
            clearDraft();
            setFormData({ isFirstInRole: false, inputMode: "percentage", ...initialData });
            setStep(1);
            toast.info("Rascunho descartado");
          }}
        >
          Descartar rascunho
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="text-destructive/70 hover:text-destructive transition-colors underline-offset-4 hover:underline"
            >
              Excluir meus dados
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir todos os seus dados?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza? Seus dados serão apagados permanentemente e você perderá acesso aos benchmarks.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteData}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Excluindo..." : "Sim, excluir tudo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-muted/50 rounded-lg px-3 py-2.5">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium text-sm">{value || "—"}</p>
    </div>
  );
}
