"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { revokeAccess } from "@/lib/admin";

interface Props {
  email: string;
}

export function InvitationActions({ email }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    if (!confirm("Revogar acesso de " + email + "?")) return;
    setLoading(true);
    try {
      await revokeAccess(email);
      toast.success("Acesso revogado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao revogar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleRevoke} disabled={loading} className="h-8 text-destructive hover:text-destructive">
      Revogar
    </Button>
  );
}
