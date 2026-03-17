"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { GrantData } from "@/lib/types";
import { prepareGrants } from "@/lib/vesting-simulator";
import { VestingSimulator } from "@/components/simulator/vesting-simulator";

interface SubmissionData {
  currency?: string;
  fxRateUsed?: number;
  grants: GrantData[];
}

export default function SimulatorPage() {
  const [data, setData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submission")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-10 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="h-96 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  // No submission or no grants
  if (!data || data.grants.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="py-24 text-center">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-foreground/[0.04] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60">
              <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5">Nenhum grant encontrado</h3>
          <p className="text-muted-foreground text-[14px] max-w-sm mx-auto mb-8">
            Envie seus dados de compensação com pelo menos um grant de equity para usar o simulador.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/submit">Enviar compensação</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if any grants are simulatable
  const { simulatable } = prepareGrants(data.grants);
  if (simulatable.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="py-24 text-center">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-foreground/[0.04] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1.5">Grants sem dados suficientes</h3>
          <p className="text-muted-foreground text-[14px] max-w-sm mx-auto mb-8">
            Seus grants precisam de quantidade de ações e período de vesting para a simulação funcionar.
            Edite seus grants para adicionar esses dados.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/submit?step=3">Editar grants</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Simulador</h1>
        <p className="text-muted-foreground text-[15px] mt-1">
          Projete o valor dos seus grants ao longo do tempo
        </p>
      </div>

      <VestingSimulator
        grants={data.grants}
        currency={data.currency}
        fxRateUsed={data.fxRateUsed}
      />
    </div>
  );
}
