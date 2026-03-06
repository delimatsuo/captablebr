"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  STAGES, BUSINESS_MODELS, SECTORS, HEADCOUNT_RANGES,
  VALUATION_RANGES, FUNDING_RANGES,
} from "@/lib/types";
import { companySchema, type CompanyFormData } from "@/lib/validations";
import { upsertCompany } from "@/lib/actions";

interface Props {
  initialData?: CompanyFormData | null;
}

export function CompanyProfileForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyFormData>>(
    initialData || {}
  );

  function update(field: keyof CompanyFormData, value: string | number | undefined) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = companySchema.parse(formData);
      await upsertCompany(validated);
      toast.success("Perfil da empresa salvo!");
      router.push("/grants");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const zodErr = err as { errors: { message: string }[] };
        toast.error(zodErr.errors[0]?.message || "Dados invalidos");
      } else {
        toast.error("Erro ao salvar perfil");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perfil da empresa</CardTitle>
          <CardDescription>Dados usados para segmentar os benchmarks. Nenhuma informacao identifica sua empresa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Segmentacao */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Segmentacao</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Estagio</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(v) => update("stage", v)}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modelo de negocio</Label>
                <Select
                  value={formData.businessModel}
                  onValueChange={(v) => update("businessModel", v)}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_MODELS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Setor</Label>
                <Select
                  value={formData.sector}
                  onValueChange={(v) => update("sector", v)}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Funcionarios</Label>
                <Select
                  value={formData.headcountRange}
                  onValueChange={(v) => update("headcountRange", v)}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {HEADCOUNT_RANGES.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detalhes adicionais */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Detalhes adicionais</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Sub-setor</Label>
                <Input
                  value={formData.subSector || ""}
                  onChange={(e) => update("subSector", e.target.value)}
                  placeholder="Ex: Open Banking"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={formData.city || ""}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Ex: Sao Paulo"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Ano de fundacao</Label>
                <Input
                  type="number"
                  value={formData.yearFounded || ""}
                  onChange={(e) => update("yearFounded", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 2020"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Faixa de valuation</Label>
                <Select
                  value={formData.lastValuationRange || ""}
                  onValueChange={(v) => update("lastValuationRange", v)}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {VALUATION_RANGES.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Total captado</Label>
                <Select
                  value={formData.totalFundingRange || ""}
                  onValueChange={(v) => update("totalFundingRange", v)}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {FUNDING_RANGES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Total de acoes/cotas emitidas</Label>
                <Input
                  type="number"
                  value={formData.totalSharesOutstanding || ""}
                  onChange={(e) => update("totalSharesOutstanding", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 1000000"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Necessario se voce informar equity em numero de acoes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={loading} className="h-11 px-8">
          {loading ? "Salvando..." : initialData ? "Salvar alteracoes" : "Salvar e continuar"}
        </Button>
      </div>
    </form>
  );
}
