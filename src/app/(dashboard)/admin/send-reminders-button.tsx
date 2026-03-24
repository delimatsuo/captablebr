"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendReminders, sendTestReminder } from "@/lib/admin";
import { useRouter } from "next/navigation";

interface Props {
  pendingWithoutReminder: number;
}

export function SendRemindersButton({ pendingWithoutReminder }: Props) {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleTest() {
    const email = testEmail.trim();
    if (!email) return;
    setTestLoading(true);
    setResult(null);
    try {
      await sendTestReminder(email);
      setResult(`Teste enviado para ${email}`);
    } catch (err) {
      setResult(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTestLoading(false);
    }
  }

  async function handleSendAll() {
    if (!confirm(
      `Enviar email de lembrete para ${pendingWithoutReminder} convite(s) pendente(s) que ainda não receberam lembrete?`
    )) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await sendReminders();
      setResult(`${res.sent} enviado(s)${res.failed > 0 ? `, ${res.failed} falha(s)` : ""}`);
      router.refresh();
    } catch (err) {
      setResult(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="Enviar teste para..."
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && handleTest()}
        />
        <Button
          onClick={handleTest}
          disabled={testLoading || !testEmail.trim()}
          variant="outline"
          size="sm"
        >
          {testLoading ? "Enviando..." : "Enviar teste"}
        </Button>
      </div>
      {pendingWithoutReminder > 0 && (
        <div>
          <Button
            onClick={handleSendAll}
            disabled={loading}
            variant="default"
            size="sm"
          >
            {loading ? "Enviando lembretes..." : `Enviar lembrete para todos (${pendingWithoutReminder})`}
          </Button>
        </div>
      )}
      {result && (
        <p className="text-sm text-muted-foreground">{result}</p>
      )}
    </div>
  );
}
