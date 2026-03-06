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
import {
  ROLES, INSTRUMENT_TYPES, VESTING_SCHEDULES, GRANT_TYPES,
  EXPERIENCE_RANGES, CASH_COMP_RANGES, INCENTIVE_RANGES,
} from "@/lib/types";
import { grantSchema, type GrantFormData } from "@/lib/validations";
import { createGrant, createGrantFromAi } from "@/lib/actions";

interface Props {
  initialData?: Partial<GrantFormData>;
  sourceDocumentUrl?: string;
  isAiExtracted?: boolean;
  hasTotalShares?: boolean;
}

export function GrantForm({ initialData, sourceDocumentUrl, isAiExtracted, hasTotalShares }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<GrantFormData>>({
    isFirstInRole: false,
    equityUnit: "percentage",
    ...initialData,
  });

  function update(field: keyof GrantFormData, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const isShares = formData.equityUnit === "shares";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = grantSchema.parse(formData);

      if (isAiExtracted && sourceDocumentUrl) {
        await createGrantFromAi(validated, sourceDocumentUrl);
      } else {
        await createGrant(validated);
      }

      toast.success("Posicao salva com sucesso!");
      router.push("/grants");
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nova posicao de equity</CardTitle>
          <CardDescription>Equity total deste executivo na empresa (soma de todos os grants)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Posicao */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Posicao</p>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Referencia interna (opcional)</Label>
                <Input
                  value={formData.executiveLabel || ""}
                  onChange={(e) => update("executiveLabel", e.target.value)}
                  placeholder="Ex: CTO - Maria (nunca sera exibido nos benchmarks)"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Apenas para sua organizacao — nunca aparece nos benchmarks
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Cargo *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => update("role", v)}
                  >
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Instrumento *</Label>
                  <Select
                    value={formData.instrumentType}
                    onValueChange={(v) => update("instrumentType", v)}
                  >
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {INSTRUMENT_TYPES.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Unidade do equity *</Label>
                  <Select
                    value={formData.equityUnit || "percentage"}
                    onValueChange={(v) => {
                      update("equityUnit", v);
                      if (v === "percentage") update("sharesGranted", undefined);
                      else update("equityPercentage", undefined);
                    }}
                  >
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="shares">Numero de acoes/cotas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isShares ? (
                  <div className="space-y-2">
                    <Label>Total de acoes/cotas *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.sharesGranted ?? ""}
                      onChange={(e) => update("sharesGranted", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Ex: 50000"
                      className="h-11"
                      required
                    />
                    {!hasTotalShares && (
                      <p className="text-xs text-amber-600 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        Informe o total de acoes emitidas no perfil da empresa para calculo do %
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Equity total (%) *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0.001"
                      max="20"
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
                )}

                <div className="space-y-2">
                  <Label>Tipo de Grant *</Label>
                  <Select
                    value={formData.grantType}
                    onValueChange={(v) => update("grantType", v)}
                  >
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {GRANT_TYPES.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <Select
                  value={formData.vestingSchedule}
                  onValueChange={(v) => update("vestingSchedule", v)}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {VESTING_SCHEDULES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Remuneracao */}
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
                    Selecione se este foi o primeiro executivo contratado do mercado para esta posicao
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
                  <Label>Experiencia do Executivo</Label>
                  <Select
                    value={formData.yearsExperience || ""}
                    onValueChange={(v) => update("yearsExperience", v || undefined)}
                  >
                    <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_RANGES.map((e) => (
                        <SelectItem key={e} value={e}>{e} anos</SelectItem>
                      ))}
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
                      {CASH_COMP_RANGES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Incentivos */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Incentivos de curto prazo</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Annual bonus */}
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
                  <Label htmlFor="hasAnnualBonus" className="font-medium cursor-pointer text-sm">
                    Bonus anual
                  </Label>
                </div>
                {formData.hasAnnualBonus && (
                  <Select
                    value={formData.annualBonusRange || ""}
                    onValueChange={(v) => update("annualBonusRange", v || undefined)}
                  >
                    <SelectTrigger className="h-10"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                    <SelectContent>
                      {INCENTIVE_RANGES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Commission */}
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
                  <Label htmlFor="hasCommission" className="font-medium cursor-pointer text-sm">
                    Comissoes
                  </Label>
                </div>
                {formData.hasCommission && (
                  <Select
                    value={formData.commissionRange || ""}
                    onValueChange={(v) => update("commissionRange", v || undefined)}
                  >
                    <SelectTrigger className="h-10"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                    <SelectContent>
                      {INCENTIVE_RANGES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Retention plan */}
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
                  <Label htmlFor="hasRetentionPlan" className="font-medium cursor-pointer text-sm">
                    Plano de retencao
                  </Label>
                </div>
                {formData.hasRetentionPlan && (
                  <Select
                    value={formData.retentionRange || ""}
                    onValueChange={(v) => update("retentionRange", v || undefined)}
                  >
                    <SelectTrigger className="h-10"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                    <SelectContent>
                      {INCENTIVE_RANGES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Sign-on */}
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
                  <Label htmlFor="hasSignOn" className="font-medium cursor-pointer text-sm">
                    Sign-on bonus
                  </Label>
                </div>
                {formData.hasSignOn && (
                  <Select
                    value={formData.signOnRange || ""}
                    onValueChange={(v) => update("signOnRange", v || undefined)}
                  >
                    <SelectTrigger className="h-10"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                    <SelectContent>
                      {INCENTIVE_RANGES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 px-6">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="h-11 px-8">
          {loading ? "Salvando..." : isAiExtracted ? "Confirmar e salvar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
