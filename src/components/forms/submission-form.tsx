"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  STAGES, BUSINESS_MODELS, SECTORS, HEADCOUNT_RANGES,
  ROLES, INSTRUMENT_TYPES, VESTING_SCHEDULES, GRANT_TYPES,
  EXPERIENCE_RANGES, CASH_COMP_RANGES, INCENTIVE_RANGES,
} from "@/lib/types";
import { submissionSchema, type SubmissionFormData } from "@/lib/validations";
import { upsertSubmission, upsertSubmissionFromAi } from "@/lib/actions";

interface Props {
  initialData?: Partial<SubmissionFormData> | null;
  sourceDocumentUrl?: string;
  isAiExtracted?: boolean;
}

const STEPS = [
  { label: "Sobre a empresa", number: 1 },
  { label: "Sua compensacao", number: 2 },
  { label: "Confirmar", number: 3 },
];

export function SubmissionForm({ initialData, sourceDocumentUrl, isAiExtracted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SubmissionFormData>>({
    isFirstInRole: false,
    ...initialData,
  });

  function update(field: keyof SubmissionFormData, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvanceStep1() {
    return formData.stage && formData.businessModel && formData.sector && formData.headcountRange;
  }

  function canAdvanceStep2() {
    return (
      formData.role &&
      formData.instrumentType &&
      formData.equityPercentage != null &&
      formData.vestingTotalMonths != null &&
      formData.cliffMonths != null &&
      formData.vestingSchedule &&
      formData.grantType
    );
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      const validated = submissionSchema.parse(formData);

      if (isAiExtracted && sourceDocumentUrl) {
        await upsertSubmissionFromAi(validated, sourceDocumentUrl);
      } else {
        await upsertSubmission(validated);
      }

      toast.success("Dados salvos com sucesso!");
      router.push("/benchmarks");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const zodErr = err as { errors: { message: string }[] };
        toast.error(zodErr.errors[0]?.message || "Dados invalidos");
      } else {
        toast.error("Erro ao salvar");
      }
    } finally {
      setLoading(false);
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
            <p className="text-sm font-medium">Dados extraidos por IA</p>
            <p className="text-xs text-muted-foreground">Revise e corrija os campos abaixo antes de confirmar</p>
          </div>
        </div>
      )}

      {/* Step 1: Company context */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sobre a empresa onde voce trabalha</CardTitle>
            <CardDescription>Nao identificamos sua empresa nos benchmarks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Estagio *</Label>
                <Select value={formData.stage} onValueChange={(v) => update("stage", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modelo de negocio *</Label>
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
                <Label>Funcionarios *</Label>
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
            <CardTitle className="text-lg">Sua compensacao</CardTitle>
            <CardDescription>Dados sobre seu pacote de equity e remuneracao</CardDescription>
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
                      {INSTRUMENT_TYPES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Equity total (%) *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="30"
                    value={formData.equityPercentage ?? ""}
                    onChange={(e) => update("equityPercentage", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 1.5"
                    className="h-11"
                    required
                  />
                  {(formData.equityPercentage ?? 0) > 10 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                      Valor acima de 10% — verifique se esta correto
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Grant *</Label>
                  <Select value={formData.grantType} onValueChange={(v) => update("grantType", v)}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {GRANT_TYPES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Vesting */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Vesting</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label>Periodo Total (meses) *</Label>
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
                      {VESTING_SCHEDULES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile & comp */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Remuneracao e perfil</p>
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Checkbox
                    id="isFirstInRole"
                    checked={formData.isFirstInRole}
                    onCheckedChange={(v) => update("isFirstInRole", v === true)}
                  />
                  <div>
                    <Label htmlFor="isFirstInRole" className="font-medium cursor-pointer">
                      Primeira contratacao externa para este cargo
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Selecione se voce foi o primeiro executivo contratado do mercado para esta posicao
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Ano da Contratacao</Label>
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
                    <Label>Sua experiencia</Label>
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

                  <div className="space-y-2">
                    <Label>Salario Mensal (bruto)</Label>
                    <Select
                      value={formData.cashCompRange || ""}
                      onValueChange={(v) => update("cashCompRange", v || undefined)}
                    >
                      <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {CASH_COMP_RANGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                        if (!v) update("annualBonusRange", undefined);
                      }}
                    />
                    <Label htmlFor="hasAnnualBonus" className="font-medium cursor-pointer text-sm">Bonus anual</Label>
                  </div>
                  {formData.hasAnnualBonus && (
                    <Select value={formData.annualBonusRange || ""} onValueChange={(v) => update("annualBonusRange", v || undefined)}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                      <SelectContent>
                        {INCENTIVE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="hasCommission"
                      checked={formData.hasCommission || false}
                      onCheckedChange={(v) => {
                        update("hasCommission", v === true);
                        if (!v) update("commissionRange", undefined);
                      }}
                    />
                    <Label htmlFor="hasCommission" className="font-medium cursor-pointer text-sm">Comissoes</Label>
                  </div>
                  {formData.hasCommission && (
                    <Select value={formData.commissionRange || ""} onValueChange={(v) => update("commissionRange", v || undefined)}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                      <SelectContent>
                        {INCENTIVE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="hasRetentionPlan"
                      checked={formData.hasRetentionPlan || false}
                      onCheckedChange={(v) => {
                        update("hasRetentionPlan", v === true);
                        if (!v) update("retentionRange", undefined);
                      }}
                    />
                    <Label htmlFor="hasRetentionPlan" className="font-medium cursor-pointer text-sm">Plano de retencao</Label>
                  </div>
                  {formData.hasRetentionPlan && (
                    <Select value={formData.retentionRange || ""} onValueChange={(v) => update("retentionRange", v || undefined)}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                      <SelectContent>
                        {INCENTIVE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="hasSignOn"
                      checked={formData.hasSignOn || false}
                      onCheckedChange={(v) => {
                        update("hasSignOn", v === true);
                        if (!v) update("signOnRange", undefined);
                      }}
                    />
                    <Label htmlFor="hasSignOn" className="font-medium cursor-pointer text-sm">Sign-on bonus</Label>
                  </div>
                  {formData.hasSignOn && (
                    <Select value={formData.signOnRange || ""} onValueChange={(v) => update("signOnRange", v || undefined)}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                      <SelectContent>
                        {INCENTIVE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
              Seus dados sao anonimizados e agregados. Benchmarks aparecem quando 10+ executivos contribuem no seu segmento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Empresa</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryItem label="Estagio" value={formData.stage} />
                  <SummaryItem label="Modelo" value={formData.businessModel} />
                  <SummaryItem label="Setor" value={formData.sector} />
                  <SummaryItem label="Funcionarios" value={formData.headcountRange} />
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Compensacao</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryItem label="Cargo" value={formData.role} />
                  <SummaryItem label="Instrumento" value={formData.instrumentType} />
                  <SummaryItem label="Equity" value={formData.equityPercentage != null ? `${formData.equityPercentage}%` : undefined} />
                  <SummaryItem label="Tipo" value={formData.grantType} />
                  <SummaryItem label="Vesting" value={formData.vestingTotalMonths != null ? `${formData.vestingTotalMonths} meses` : undefined} />
                  <SummaryItem label="Cliff" value={formData.cliffMonths != null ? `${formData.cliffMonths} meses` : undefined} />
                  <SummaryItem label="Cronograma" value={formData.vestingSchedule} />
                  <SummaryItem label="Primeiro no cargo" value={formData.isFirstInRole ? "Sim" : "Nao"} />
                </div>
              </div>

              {formData.cashCompRange && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Remuneracao</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <SummaryItem label="Salario" value={formData.cashCompRange} />
                      {formData.hasAnnualBonus && <SummaryItem label="Bonus" value={formData.annualBonusRange} />}
                      {formData.hasCommission && <SummaryItem label="Comissao" value={formData.commissionRange} />}
                      {formData.hasRetentionPlan && <SummaryItem label="Retencao" value={formData.retentionRange} />}
                      {formData.hasSignOn && <SummaryItem label="Sign-on" value={formData.signOnRange} />}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Email para notificacoes (opcional)</Label>
              <Input
                type="email"
                value={formData.notifyEmail || ""}
                onChange={(e) => update("notifyEmail", e.target.value || undefined)}
                placeholder="seu@email.com"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Receba um aviso quando os benchmarks do seu segmento estiverem disponiveis
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="h-11 px-6">
              Voltar
            </Button>
          )}
        </div>
        <div>
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
