"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteMyData } from "@/lib/actions";

interface GrantData {
  id: string;
  instrumentType: string;
  equityPercentage?: number;
  vestingTotalMonths: number;
  cliffMonths: number;
  vestingSchedule: string;
  grantType: string;
  isFirstInRole: boolean;
  inputMode: string;
  numberOfShares?: number;
  totalSharesOutstanding?: number;
  strikePrice?: number;
  currentSharePrice?: number;
  lastValuation?: number;
  grantDate?: string;
  grantLabel?: string;
  vestingStartDate?: string;
}

interface SubmissionData {
  id: string;
  stage: string;
  businessModel: string;
  sector: string;
  subSector?: string;
  headcountRange: string;
  country?: string;
  currency?: string;
  fxRateUsed?: number;
  role: string;
  equityPercentage?: number;
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
  confirmedByUser: boolean;
  grants: GrantData[];
}

function formatMoney(value: number | undefined, currency: string = "USD"): string {
  if (value == null) return "—";
  const symbol = currency === "BRL" ? "R$" : "$";
  const locale = currency === "BRL" ? "pt-BR" : "en-US";
  return `${symbol} ${value.toLocaleString(locale)}`;
}

function DataItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl bg-foreground/[0.03] px-3.5 py-3">
      <p className="text-[11px] text-muted-foreground/70 mb-0.5">{label}</p>
      <p className="font-medium text-[14px]">{value || "—"}</p>
    </div>
  );
}

export default function MyDataPage() {
  const [data, setData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/submission")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteData() {
    setDeleting(true);
    try {
      await deleteMyData();
      try { localStorage.removeItem("captablebr-draft"); } catch {}
      setData(null);
      toast.success("Dados excluídos");
    } catch {
      toast.error("Erro ao excluir dados");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-10 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="h-96 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="py-24 text-center">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-foreground/[0.04] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5">Nenhum dado encontrado</h3>
          <p className="text-muted-foreground text-[14px] max-w-sm mx-auto mb-8">
            Você ainda não enviou sua compensação. Envie seus dados para acessar os benchmarks.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/submit">Enviar compensação</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Meus Dados</h1>
          <p className="text-muted-foreground text-[15px] mt-1">
            Visualize e gerencie seus dados de compensação
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full text-[13px]">
          <Link href="/submit">Editar</Link>
        </Button>
      </div>

      {/* Company */}
      <Card className="border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-semibold">Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DataItem label="Estágio" value={data.stage} />
            <DataItem label="Modelo" value={data.businessModel} />
            <DataItem label="Setor" value={data.sector} />
            <DataItem label="Funcionários" value={data.headcountRange} />
            {data.country && <DataItem label="País" value={data.country === "BR" ? "Brasil" : data.country === "US" ? "Estados Unidos" : data.country} />}
            {data.subSector && <DataItem label="Sub-setor" value={data.subSector} />}
          </div>
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card className="border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-semibold">Remuneração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DataItem label="Cargo" value={data.role} />
            {data.contractType && <DataItem label="Contrato" value={data.contractType} />}
            {data.currency && <DataItem label="Moeda" value={data.currency} />}
            <DataItem label="Salário anual" value={formatMoney(data.annualSalary, data.currency)} />
            {data.hireYear && <DataItem label="Contratação" value={String(data.hireYear)} />}
            {data.yearsExperience && <DataItem label="Experiência" value={`${data.yearsExperience} anos`} />}
            {data.hasAnnualBonus && <DataItem label="Bônus anual" value={formatMoney(data.annualBonus, data.currency)} />}
            {data.hasCommission && <DataItem label="Comissão" value={formatMoney(data.commission, data.currency)} />}
            {data.hasRetentionPlan && <DataItem label="Retenção" value={formatMoney(data.retentionAmount, data.currency)} />}
            {data.hasSignOn && <DataItem label="Sign-on" value={formatMoney(data.signOnAmount, data.currency)} />}
            {data.fxRateUsed && data.currency === "BRL" && (
              <DataItem label="Câmbio registrado" value={`1 USD = R$ ${data.fxRateUsed.toFixed(2)}`} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grants */}
      <Card className="border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[15px] font-semibold">
              Grants ({data.grants.length})
            </CardTitle>
            {data.equityPercentage != null && (
              <span className="text-sm font-medium">
                Total: {data.equityPercentage}%
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.grants.map((grant, i) => (
            <div key={grant.id} className="rounded-xl border border-border/50 p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-sm">
                  {grant.grantLabel || `Grant ${i + 1}`}
                </h3>
                <Badge variant="secondary" className="text-xs">{grant.instrumentType}</Badge>
                <Badge variant="outline" className="text-xs">{grant.grantType}</Badge>
                {grant.isFirstInRole && (
                  <Badge variant="outline" className="text-xs">1o no cargo</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <DataItem
                  label="Equity"
                  value={
                    grant.inputMode === "shares" && grant.numberOfShares
                      ? `${grant.numberOfShares.toLocaleString("pt-BR")} ações${grant.equityPercentage ? ` (${grant.equityPercentage}%)` : ""}`
                      : grant.equityPercentage != null ? `${grant.equityPercentage}%` : "—"
                  }
                />
                <DataItem label="Vesting" value={`${grant.vestingTotalMonths} meses`} />
                <DataItem label="Cliff" value={`${grant.cliffMonths} meses`} />
                <DataItem label="Cronograma" value={grant.vestingSchedule} />
                {grant.strikePrice != null && (
                  <DataItem label="Strike price" value={`R$ ${grant.strikePrice}`} />
                )}
                {grant.grantDate && (
                  <DataItem label="Data do grant" value={new Date(grant.grantDate).toLocaleDateString("pt-BR")} />
                )}
              </div>
            </div>
          ))}

          <Button asChild variant="outline" className="w-full">
            <Link href="/submit">Adicionar ou editar grants</Link>
          </Button>
        </CardContent>
      </Card>

      {/* LGPD actions */}
      <div className="flex items-center justify-end pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive/70 hover:text-destructive">
              Excluir meus dados
            </Button>
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
