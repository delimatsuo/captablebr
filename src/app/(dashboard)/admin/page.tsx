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
          <h1 className="text-2xl font-bold">Administracao</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie convites e solicitacoes de acesso
          </p>
        </div>
      </div>

      {/* Invite new user */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convidar executivo</CardTitle>
          <CardDescription>Adicione o email do executivo para liberar acesso a plataforma</CardDescription>
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
              Solicitacoes pendentes
              <Badge className="text-xs">{pendingRequests.length}</Badge>
            </CardTitle>
            <CardDescription>Executivos que solicitaram acesso a plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="min-w-0">
                  <p className="font-medium">{req.name}</p>
                  <p className="text-sm text-muted-foreground">{req.email}</p>
                  <p className="text-sm mt-1 text-muted-foreground italic">&ldquo;{req.message}&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-1">
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
                  <Badge variant={inv.status === "accepted" ? "default" : "secondary"} className="text-xs">
                    {inv.status === "accepted" ? "Ativo" : "Pendente"}
                  </Badge>
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
            <CardTitle className="text-lg">Historico de solicitacoes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {processedRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{req.name} ({req.email})</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge
                  variant={req.status === "approved" ? "default" : "destructive"}
                  className="text-xs"
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
