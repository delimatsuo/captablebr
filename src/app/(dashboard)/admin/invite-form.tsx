"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createInvitation, createInvitationsBatch } from "@/lib/admin";
import type { BatchInviteResult } from "@/lib/admin";

export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Bulk invite state
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkResult, setBulkResult] = useState<BatchInviteResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      await createInvitation(email);
      toast.success(`Convite enviado para ${email}`);
      setEmail("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar convite");
    } finally {
      setLoading(false);
    }
  }

  function parseBulkInput(text: string): Array<{ email: string; name?: string }> {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        // Support formats: "email" or "email, name" or "name <email>"
        const angleMatch = line.match(/^(.+?)\s*<([^>]+)>$/);
        if (angleMatch) {
          return { name: angleMatch[1].trim(), email: angleMatch[2].trim().toLowerCase() };
        }
        const commaMatch = line.match(/^([^,]+),\s*(.+)$/);
        if (commaMatch) {
          const first = commaMatch[1].trim();
          const second = commaMatch[2].trim();
          // If first part looks like an email, second is the name
          if (first.includes("@")) {
            return { email: first.toLowerCase(), name: second };
          }
          // Otherwise first is name, second is email
          return { name: first, email: second.toLowerCase() };
        }
        return { email: line.toLowerCase() };
      })
      .filter((entry) => entry.email.includes("@"));
  }

  async function handleBulkSubmit() {
    const entries = parseBulkInput(bulkText);
    if (entries.length === 0) {
      toast.error("Nenhum email válido encontrado");
      return;
    }

    setLoading(true);
    setBulkResult(null);

    try {
      const result = await createInvitationsBatch(entries);
      setBulkResult(result);

      if (result.created > 0 && result.emailsFailed === 0) {
        toast.success(`${result.created} convite(s) criado(s)`);
        setBulkText("");
      } else if (result.created > 0) {
        toast.success(`${result.created} criado(s), ${result.emailsFailed} email(s) falharam`);
        setBulkText("");
      } else {
        toast.info(`Nenhum novo convite — ${result.skipped} já existiam`);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar convites");
    } finally {
      setLoading(false);
    }
  }

  const parsedCount = bulkMode ? parseBulkInput(bulkText).length : 0;

  return (
    <div className="space-y-4">
      {/* Single invite */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
          className="h-11 flex-1"
          required
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="h-11 px-6">
          {loading && !bulkMode ? "Enviando..." : "Convidar"}
        </Button>
      </form>

      {/* Bulk toggle */}
      <button
        type="button"
        onClick={() => { setBulkMode(!bulkMode); setBulkResult(null); }}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
      >
        {bulkMode ? "Fechar envio em lote" : "Enviar convites em lote"}
      </button>

      {/* Bulk invite */}
      {bulkMode && (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Cole os emails abaixo, um por linha. Formatos aceitos:
          </p>
          <ul className="text-xs text-muted-foreground space-y-0.5 ml-4 list-disc">
            <li>email@exemplo.com</li>
            <li>email@exemplo.com, Nome da Pessoa</li>
            <li>Nome da Pessoa &lt;email@exemplo.com&gt;</li>
          </ul>
          <Textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"joao@gmail.com, João Silva\nmaria@outlook.com, Maria Santos\npedro@yahoo.com"}
            rows={8}
            className="font-mono text-sm"
            disabled={loading}
          />
          {bulkResult && (
            <div className="rounded-md bg-muted px-4 py-3 text-sm space-y-1">
              <p><span className="font-medium">{bulkResult.created}</span> convite(s) criado(s)</p>
              {bulkResult.skipped > 0 && (
                <p className="text-muted-foreground">{bulkResult.skipped} já existiam (ignorados)</p>
              )}
              <p className="text-muted-foreground">
                {bulkResult.emailsSent} email(s) enviado(s)
                {bulkResult.emailsFailed > 0 && `, ${bulkResult.emailsFailed} falharam`}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {parsedCount} email(s) detectado(s)
            </p>
            <Button
              onClick={handleBulkSubmit}
              disabled={loading || parsedCount === 0}
              size="sm"
            >
              {loading ? "Processando..." : `Enviar ${parsedCount} convite(s)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
