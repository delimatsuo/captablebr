"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InvitationActions } from "./invitation-actions";
import { RequestActions } from "./request-actions";
import { DeleteUserButton } from "./delete-user-button";

type Invitation = {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
  reminderSentAt: Date | null;
};

type AccessRequest = {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: Date;
  linkedinUrl?: string | null;
  role?: string | null;
  detectedTitle?: string | null;
  verificationResult?: string | null;
  verificationReason?: string | null;
  message?: string | null;
};

type UserStatus = {
  hasSubmission: boolean;
  firebaseExists: boolean;
};

interface Props {
  invitations: Invitation[];
  pendingRequests: AccessRequest[];
  processedRequests: AccessRequest[];
  userStatusMap: Record<string, UserStatus>;
}

function VerificationBadge({ result }: { result: string | null }) {
  if (!result) return null;
  const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
    auto_approved: { variant: "default", label: "Auto-aprovado" },
    pending_review: { variant: "secondary", label: "Pendente" },
    scrape_failed: { variant: "outline", label: "Falha no scrape" },
    rejected: { variant: "destructive", label: "Rejeitado" },
  };
  const c = config[result] || { variant: "outline" as const, label: result };
  return <Badge variant={c.variant} className="text-xs">{c.label}</Badge>;
}

function RequestDetails({ req }: { req: AccessRequest }) {
  return (
    <>
      {req.linkedinUrl && (
        <p className="text-sm text-muted-foreground">
          LinkedIn:{" "}
          <a
            href={req.linkedinUrl.startsWith("http") ? req.linkedinUrl : `https://${req.linkedinUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {req.linkedinUrl}
          </a>
        </p>
      )}
      {req.role && (
        <p className="text-sm text-muted-foreground">
          Cargo declarado: <span className="font-medium text-foreground">{req.role}</span>
        </p>
      )}
      {req.detectedTitle && (
        <p className="text-sm text-muted-foreground">
          Cargo detectado (IA): <span className="font-medium text-foreground">{req.detectedTitle}</span>
        </p>
      )}
      {req.verificationReason && (
        <p className="text-sm text-muted-foreground italic">{req.verificationReason}</p>
      )}
      {req.message && !req.linkedinUrl && (
        <p className="text-sm mt-1 text-muted-foreground italic">&ldquo;{req.message}&rdquo;</p>
      )}
    </>
  );
}

function SubmissionBadge({ email, userStatusMap }: { email: string; userStatusMap: Record<string, UserStatus> }) {
  const status = userStatusMap[email.toLowerCase()];
  if (!status) return null;
  if (!status.firebaseExists) {
    return <Badge variant="destructive" className="text-xs">Conta nao encontrada</Badge>;
  }
  if (status.hasSubmission) {
    return <Badge variant="default" className="text-xs">Dados enviados</Badge>;
  }
  return <Badge variant="outline" className="text-xs">Sem dados</Badge>;
}

export function AdminSearch({ invitations, pendingRequests, processedRequests, userStatusMap }: Props) {
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();

  const filteredInvitations = query
    ? invitations.filter((inv) => inv.email.toLowerCase().includes(query))
    : invitations;

  const filteredPending = query
    ? pendingRequests.filter(
        (r) => r.email.toLowerCase().includes(query) || r.name.toLowerCase().includes(query)
      )
    : pendingRequests;

  const filteredProcessed = query
    ? processedRequests.filter(
        (r) => r.email.toLowerCase().includes(query) || r.name.toLowerCase().includes(query)
      )
    : processedRequests;

  return (
    <>
      <Input
        placeholder="Buscar por email ou nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Pending access requests */}
      {filteredPending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Solicitacoes pendentes
              <Badge className="text-xs">{filteredPending.length}</Badge>
            </CardTitle>
            <CardDescription>Executivos que solicitaram acesso a plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredPending.map((req) => (
              <div key={req.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{req.name}</p>
                    <VerificationBadge result={req.verificationResult ?? null} />
                  </div>
                  <p className="text-sm text-muted-foreground">{req.email}</p>
                  <RequestDetails req={req} />
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <RequestActions requestId={req.id} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Invitations with user status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convites ({filteredInvitations.length})</CardTitle>
          <CardDescription>Lista de todos os emails convidados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvitations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {query ? "Nenhum resultado encontrado" : "Nenhum convite criado ainda"}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString("pt-BR")}
                      {inv.reminderSentAt && (
                        <span className="ml-2 text-amber-600">
                          · Lembrete {new Date(inv.reminderSentAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SubmissionBadge email={inv.email} userStatusMap={userStatusMap} />
                    <Badge variant={inv.status === "accepted" ? "default" : "secondary"} className="text-xs">
                      {inv.status === "accepted" ? "Ativo" : "Pendente"}
                    </Badge>
                    <InvitationActions email={inv.email} />
                    <DeleteUserButton email={inv.email} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed requests */}
      {filteredProcessed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historico de solicitacoes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredProcessed.map((req) => (
              <div key={req.id} className="flex items-start justify-between rounded-lg border px-4 py-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{req.name} ({req.email})</p>
                    <VerificationBadge result={req.verificationResult ?? null} />
                  </div>
                  <RequestDetails req={req} />
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge
                  variant={req.status === "approved" ? "default" : "destructive"}
                  className="text-xs shrink-0"
                >
                  {req.status === "approved" ? "Aprovado" : "Rejeitado"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}
