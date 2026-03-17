"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createInvitation } from "@/lib/admin";

export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Bulk invite state
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{ sent: number; failed: number; total: number } | null>(null);

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
    setBulkProgress({ sent: 0, failed: 0, total: entries.length });
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        await createInvitation(entry.email, entry.name);
        sent++;
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : "Erro";
        errors.push(`${entry.email}: ${msg}`);
      }
      setBulkProgress({ sent, failed, total: entries.length });
    }

    setLoading(false);
    if (failed === 0) {
      toast.success(`${sent} convite(s) enviado(s)`);
      setBulkText("");
      setBulkProgress(null);
    } else {
      toast.error(`${sent} enviados, ${failed} falharam`);
      // Keep only the failed emails in the textarea
      setBulkText(errors.map((e) => `# ${e}`).join("\n"));
    }
    router.refresh();
  }

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
        onClick={() => setBulkMode(!bulkMode)}
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
          {bulkProgress && (
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((bulkProgress.sent + bulkProgress.failed) / bulkProgress.total) * 100}%` }}
                />
              </div>
              <span className="text-muted-foreground tabular-nums">
                {bulkProgress.sent + bulkProgress.failed}/{bulkProgress.total}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {parseBulkInput(bulkText).length} email(s) detectado(s)
            </p>
            <Button
              onClick={handleBulkSubmit}
              disabled={loading || parseBulkInput(bulkText).length === 0}
              size="sm"
            >
              {loading ? `Enviando...` : `Enviar ${parseBulkInput(bulkText).length} convite(s)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
