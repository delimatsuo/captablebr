import { redirect } from "next/navigation";
import {
  isAdmin,
  getInvitations,
  getAccessRequests,
} from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InviteForm } from "./invite-form";
import { RequestActions } from "./request-actions";
import { InvitationActions } from "./invitation-actions";

function VerificationBadge({ result }: { result: string | null }) {
  if (!result) return null;

  const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
    auto_approved: { variant: "default", label: "Auto-aprovado" },
    pending_review: { variant: "secondary", label: "Pendente" },
    scrape_failed: { variant: "outline", label: "Falha no scrape" },
    rejected: { variant: "destructive", label: "Rejeitado" },
  };

  const c = config[result] || { variant: "outline" as const, label: result };

  return (
    <Badge variant={c.variant} className="text-xs">
      {c.label}
    </Badge>
  );
}

function RequestDetails({ req }: { req: { linkedinUrl?: string | null; role?: string | null; detectedTitle?: string | null; verificationResult?: string | null; verificationReason?: string | null; message?: string | null } }) {
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
        <p className="text-sm text-muted-foreground italic">
          {req.verificationReason}
        </p>
      )}
      {req.message && !req.linkedinUrl && (
        <p className="text-sm mt-1 text-muted-foreground italic">&ldquo;{req.message}&rdquo;</p>
      )}
    </>
  );
}

export default async function AdminPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/benchmarks");

  const [invitations, requests] = await Promise.all([
    getInvitations(),
    getAccessRequests(),
  ]);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Administração</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie convites e solicitações de acesso
          </p>
        </div>
      </div>

      {/* Invite new user */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convidar executivo</CardTitle>
          <CardDescription>Adicione o email do executivo para liberar acesso à plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm />
        </CardContent>
      </Card>

      {/* Pending access requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Solicitações pendentes
              <Badge className="text-xs">{pendingRequests.length}</Badge>
            </CardTitle>
            <CardDescription>Executivos que solicitaram acesso à plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{req.name}</p>
                    <VerificationBadge result={req.verificationResult} />
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

      {/* Current invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convites ({invitations.length})</CardTitle>
          <CardDescription>Lista de todos os emails convidados</CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum convite criado ainda</p>
          ) : (
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={inv.status === "accepted" ? "default" : "secondary"} className="text-xs">
                      {inv.status === "accepted" ? "Ativo" : "Pendente"}
                    </Badge>
                    <InvitationActions email={inv.email} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de solicitações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {processedRequests.map((req) => (
              <div key={req.id} className="flex items-start justify-between rounded-lg border px-4 py-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{req.name} ({req.email})</p>
                    <VerificationBadge result={req.verificationResult} />
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
    </div>
  );
}
