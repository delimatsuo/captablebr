import { redirect } from "next/navigation";
import {
  isAdmin,
  getInvitations,
  getAccessRequests,
  getAdminStats,
  getActiveUsers,
} from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InviteForm } from "./invite-form";
import { AdminSearch } from "./admin-search";
import { SendRemindersButton } from "./send-reminders-button";

export default async function AdminPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/benchmarks");

  const [invitations, requests, stats, activeUsersMap] = await Promise.all([
    getInvitations(),
    getAccessRequests(),
    getAdminStats(),
    getActiveUsers(),
  ]);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  // Convert Map to plain object for client component serialization
  const userStatusMap: Record<string, { hasSubmission: boolean; firebaseExists: boolean }> = {};
  for (const [email, status] of activeUsersMap) {
    userStatusMap[email] = status;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Administracao</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie convites, usuarios e solicitacoes de acesso
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Convidados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalInvited}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Convites aceitos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.accepted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingRequests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dados enviados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
          </CardContent>
        </Card>
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

      {/* Reminder for pending invitations */}
      <SendRemindersButton
        pendingWithoutReminder={
          invitations.filter((i) => i.status === "pending" && !i.reminderSentAt).length
        }
      />

      {/* Search + filtered lists (client component) */}
      <AdminSearch
        invitations={invitations}
        pendingRequests={pendingRequests}
        processedRequests={processedRequests}
        userStatusMap={userStatusMap}
      />
    </div>
  );
}
