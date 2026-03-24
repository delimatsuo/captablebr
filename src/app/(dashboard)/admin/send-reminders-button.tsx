"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendReminders } from "@/lib/admin";
import { useRouter } from "next/navigation";

interface Props {
  pendingWithoutReminder: number;
}

export function SendRemindersButton({ pendingWithoutReminder }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const router = useRouter();

  if (pendingWithoutReminder === 0 && !result) return null;

  async function handleClick() {
    if (!confirm(
      `Enviar email de lembrete para ${pendingWithoutReminder} convite(s) pendente(s) que ainda não receberam lembrete?`
    )) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await sendReminders();
      setResult({ sent: res.sent, failed: res.failed });
      router.refresh();
    } catch (err) {
      alert(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleClick}
        disabled={loading || pendingWithoutReminder === 0}
        variant="outline"
        size="sm"
      >
        {loading ? "Enviando lembretes..." : `Enviar lembrete (${pendingWithoutReminder})`}
      </Button>
      {result && (
        <p className="text-sm text-muted-foreground">
          {result.sent} enviado(s){result.failed > 0 ? `, ${result.failed} falha(s)` : ""}
        </p>
      )}
    </div>
  );
}
