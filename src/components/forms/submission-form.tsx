"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ROLES, EXPERIENCE_RANGES, CONTRACT_TYPES,
  COUNTRIES, CURRENCIES,
} from "@/lib/types";
import { submissionWithGrantsSchema } from "@/lib/validations";
import type { GrantFormData } from "@/lib/validations";
import { upsertSubmissionWithGrants, upsertSubmissionFromAi, deleteMyData } from "@/lib/actions";
import { GrantList } from "./grant-list";

const DRAFT_KEY = "captablebr-draft";
const DRAFT_VERSION = 4;
const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

interface SubmissionFormFields {
  stage?: string;
  businessModel?: string;
  sector?: string;
  subSector?: string;
  headcountRange?: string;
  country?: string;
  currency?: string;
  role?: string;
  hireYear?: number;
  yearsExperience?: string;
  contractType?: string;
  annualSalary?: number;
  hasAnnualBonus?: boolean;
  annualBonus?: number;
  hasCommission?: boolean;
  commission?: number;
  hasRetentionPlan?: boolean;
  retentionAmount?: number;
  hasSignOn?: boolean;
  signOnAmount?: number;
  notifyEmail?: string;
  grants: Partial<GrantFormData>[];
}

interface Props {
  initialData?: Partial<SubmissionFormFields> | null;
  sourceDocumentUrl?: string;
  isAiExtracted?: boolean;
}

const STEPS = [
  { label: "Sobre a empresa", number: 1 },
  { label: "Cargo e remuneração", number: 2 },
  { label: "Seus grants", number: 3 },
  { label: "Confirmar", number: 4 },
];

function formatCurrency(value: number | undefined, currency: string = "USD"): string {
  if (value == null) return "—";
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";
  const locale = currency === "BRL" ? "pt-BR" : "en-US";
  return `${symbol} ${value.toLocaleString(locale)}`;
}

export function SubmissionForm({ initialData, sourceDocumentUrl, isAiExtracted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [step, setStep] = useState(1);
  const [draftRestored, setDraftRestored] = useState(false);
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [formData, setFormData] = useState<SubmissionFormFields>(() => {
    const defaults: SubmissionFormFields = {
      grants: [{ inputMode: "percentage", isFirstInRole: false }],
    };
    if (initialData) {
      return {
        ...defaults,
        ...initialData,
        grants: initialData.grants?.length
          ? initialData.grants
          : [{ inputMode: "percentage", isFirstInRole: false }],
      };
    }
    return defaults;
  });

  // Restore draft from localStorage on mount
  useEffect(() => {
    if (initialData) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (Date.now() - draft.timestamp > DRAFT_MAX_AGE) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      // Migrate v3 drafts: add currency default
      if (draft.version === 3) {
        draft.formData.currency = draft.formData.currency || "USD";
        draft.version = DRAFT_VERSION;
      }
      if (draft.version !== DRAFT_VERSION) {
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

  useEffect(() => {
    if (draftRestored) {
      toast.info("Rascunho restaurado");
      setDraftRestored(false);
    }
  }, [draftRestored]);

  // Fetch FX rate on mount
  useEffect(() => {
    fetch("/api/fx-rate")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.rate) setFxRate(data.rate); })
      .catch(() => {});
  }, []);

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

  function update(field: keyof Omit<SubmissionFormFields, "grants">, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvanceStep1() {
    return formData.stage && formData.businessModel && formData.sector && formData.headcountRange;
  }

  function canAdvanceStep2() {
    return formData.role;
  }

  function canAdvanceStep3() {
    return formData.grants.length > 0 && formData.grants.every((g) => {
      const hasEquity = g.inputMode === "shares"
        ? g.numberOfShares != null
        : g.equityPercentage != null;
      const needsStrike = g.instrumentType === "Stock Options" || g.instrumentType === "SAR";
      const hasStrike = !needsStrike || g.strikePrice != null;
      return (
        g.instrumentType &&
        hasEquity &&
        hasStrike &&
        g.vestingTotalMonths != null &&
        g.cliffMonths != null &&
        g.vestingSchedule &&
        g.grantType
      );
    });
  }

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  }

  // Compute aggregate equity for display
  function aggregateEquitySummary(): string {
    const values: number[] = [];
    let hasNull = false;
    for (const g of formData.grants) {
      let pct = g.equityPercentage;
      if (g.inputMode === "shares" && g.numberOfShares) {
        if (g.totalSharesOutstanding && g.totalSharesOutstanding > 0) {
          pct = (g.numberOfShares / g.totalSharesOutstanding) * 100;
        } else if (g.lastValuation && g.currentSharePrice && g.currentSharePrice > 0) {
          pct = (g.numberOfShares / (g.lastValuation / g.currentSharePrice)) * 100;
        } else {
          pct = undefined;
        }
      }
      if (pct != null && pct >= 0.001 && pct <= 30) {
        values.push(pct);
      } else {
        hasNull = true;
      }
    }
    if (values.length === 0) return "—";
    const sum = values.reduce((a, b) => a + b, 0);
    const text = `${sum.toFixed(4)}%`;
    return hasNull ? `${text} (parcialmente calculado)` : text;
  }

  function grantEquitySummary(g: Partial<GrantFormData>): string {
    if (g.inputMode === "shares" && g.numberOfShares) {
      const sharesStr = g.numberOfShares.toLocaleString("pt-BR");
      let pct: number | null = null;
      if (g.totalSharesOutstanding && g.totalSharesOutstanding > 0) {
        pct = (g.numberOfShares / g.totalSharesOutstanding) * 100;
      } else if (g.lastValuation && g.currentSharePrice && g.currentSharePrice > 0) {
        pct = (g.numberOfShares / (g.lastValuation / g.currentSharePrice)) * 100;
      }
      if (pct != null && pct >= 0.001 && pct <= 30) {
        return `${sharesStr} ações (${pct.toFixed(4)}%)`;
      }
      return `${sharesStr} ações`;
    }
    return g.equityPercentage != null ? `${g.equityPercentage}%` : "—";
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      // Pre-compute equityPercentage for each grant
      const grantsToSubmit = formData.grants.map((g) => {
        const grant = { ...g };
        if (grant.inputMode === "shares" && grant.numberOfShares) {
          if (grant.totalSharesOutstanding) {
            grant.equityPercentage = (grant.numberOfShares / grant.totalSharesOutstanding) * 100;
          } else if (grant.lastValuation && grant.currentSharePrice && grant.currentSharePrice > 0) {
            grant.equityPercentage = (grant.numberOfShares / (grant.lastValuation / grant.currentSharePrice)) * 100;
          }
        }
        return grant;
      });

      const dataToSubmit = {
        ...formData,
        grants: grantsToSubmit,
      };

      if (isAiExtracted && sourceDocumentUrl && grantsToSubmit.length === 1) {
        // AI single-grant path: use upsertSubmissionFromAi to preserve source doc metadata
        const firstGrant = grantsToSubmit[0] || {};
        await upsertSubmissionFromAi({
          ...formData,
          ...firstGrant,
        }, sourceDocumentUrl);
      } else {
        // Multi-grant path (or AI + manually added grants): use full grants sync
        submissionWithGrantsSchema.parse(dataToSubmit);
        await upsertSubmissionWithGrants(
          dataToSubmit,
          isAiExtracted && sourceDocumentUrl
            ? { sourceDocumentUrl, extractedByAi: true }
            : undefined
        );
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

              <div className="space-y-2">
                <Label>País</Label>
                <Select
                  value={formData.country || ""}
                  onValueChange={(v) => {
                    update("country", v || undefined);
                    // Auto-set currency based on country
                    if (v === "BR") update("currency", "BRL");
                    else if (v === "US") update("currency", "USD");
                  }}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
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

      {/* Step 2: Role + Salary */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cargo e remuneração</CardTitle>
            <CardDescription>Dados sobre seu cargo e remuneração em dinheiro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Cargo e perfil</p>
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
                  <Label>Moeda</Label>
                  <Select
                    value={formData.currency || "USD"}
                    onValueChange={(v) => update("currency", v)}
                    disabled
                  >
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Somente USD por enquanto</p>
                </div>

                <div className="space-y-2">
                  <Label>Salário anual bruto ({CURRENCIES.find((c) => c.code === (formData.currency || "USD"))?.symbol || "$"})</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5000000"
                    value={formData.annualSalary ?? ""}
                    onChange={(e) => update("annualSalary", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 350000"
                    className="h-11"
                  />
                  {fxRate && (
                    <p className="text-xs text-muted-foreground">
                      Cotação atual: 1 USD = R$ {fxRate.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
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

      {/* Step 3: Grants */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seus grants de equity</CardTitle>
            <CardDescription>Adicione todos os grants que você recebeu (new-hire, refresh, promoção)</CardDescription>
          </CardHeader>
          <CardContent>
            <GrantList
              grants={formData.grants}
              onChange={(grants) => setFormData((prev) => ({ ...prev, grants }))}
              currency={formData.currency || "USD"}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confirmar dados</CardTitle>
            <CardDescription>
              Seus dados são anonimizados e agregados. Benchmarks aparecem quando 10+ executivos contribuem no seu segmento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Empresa</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryItem label="Estágio" value={formData.stage} />
                  <SummaryItem label="Modelo" value={formData.businessModel} />
                  <SummaryItem label="Setor" value={formData.sector} />
                  <SummaryItem label="Funcionários" value={formData.headcountRange} />
                  {formData.country && <SummaryItem label="País" value={COUNTRIES.find((c) => c.code === formData.country)?.label} />}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Remuneração</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryItem label="Cargo" value={formData.role} />
                  {formData.contractType && <SummaryItem label="Contrato" value={formData.contractType} />}
                  <SummaryItem label="Moeda" value={formData.currency || "USD"} />
                  <SummaryItem label="Salário anual" value={formatCurrency(formData.annualSalary, formData.currency)} />
                  {formData.hasAnnualBonus && <SummaryItem label="Bônus anual" value={formatCurrency(formData.annualBonus, formData.currency)} />}
                  {formData.hasCommission && <SummaryItem label="Comissão" value={formatCurrency(formData.commission, formData.currency)} />}
                  {formData.hasRetentionPlan && <SummaryItem label="Retenção" value={formatCurrency(formData.retentionAmount, formData.currency)} />}
                  {formData.hasSignOn && <SummaryItem label="Sign-on" value={formatCurrency(formData.signOnAmount, formData.currency)} />}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Grants ({formData.grants.length})
                  </p>
                  <p className="text-sm font-medium">
                    Total equity: {aggregateEquitySummary()}
                  </p>
                </div>
                <div className="space-y-3">
                  {formData.grants.map((g, i) => (
                    <div key={i} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{g.grantLabel || `Grant ${i + 1}`}</span>
                        <span className="text-xs text-muted-foreground">
                          {g.instrumentType} / {g.grantType}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <SummaryItem label="Equity" value={grantEquitySummary(g)} />
                        <SummaryItem label="Vesting" value={g.vestingTotalMonths != null ? `${g.vestingTotalMonths} meses` : undefined} />
                        <SummaryItem label="Cliff" value={g.cliffMonths != null ? `${g.cliffMonths} meses` : undefined} />
                        <SummaryItem label="Cronograma" value={g.vestingSchedule} />
                      </div>
                    </div>
                  ))}
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
          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={
                step === 1 ? !canAdvanceStep1() :
                step === 2 ? !canAdvanceStep2() :
                !canAdvanceStep3()
              }
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
            setFormData({
              grants: [{ inputMode: "percentage", isFirstInRole: false }],
              ...initialData,
            });
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
