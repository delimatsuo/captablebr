"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveAccessRequest, rejectAccessRequest } from "@/lib/admin";

interface Props {
  requestId: string;
}

export function RequestActions({ requestId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      await approveAccessRequest(requestId);
      toast.success("Acesso aprovado e convite criado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aprovar");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    setLoading(true);
    try {
      await rejectAccessRequest(requestId);
      toast.success("Solicitação rejeitada");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao rejeitar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button size="sm" onClick={handleApprove} disabled={loading} className="h-8">
        Aprovar
      </Button>
      <Button size="sm" variant="outline" onClick={handleReject} disabled={loading} className="h-8">
        Rejeitar
      </Button>
    </div>
  );
}
