import Link from "next/link";
import { redirect } from "next/navigation";
import { getGrants, getCompany } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrantDeleteButton } from "@/components/forms/grant-delete-button";

export default async function GrantsPage() {
  const company = await getCompany();
  if (!company) redirect("/onboarding");

  const grants = await getGrants();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Posicoes de Equity</h1>
            <p className="text-muted-foreground text-sm">
              {grants.length === 0
                ? "Adicione pelo menos 1 executivo para desbloquear os benchmarks"
                : `${grants.length} executivo${grants.length !== 1 ? "s" : ""} cadastrado${grants.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <Link href="/grants/new">
          <Button className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Adicionar
          </Button>
        </Link>
      </div>

      {grants.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Nenhum executivo cadastrado</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Adicione as posicoes de equity dos executivos da sua empresa para desbloquear benchmarks do mercado.
            </p>
            <Link href="/grants/new">
              <Button className="gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Adicionar primeiro executivo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {grants.map((grant) => {
            const equityDisplay = grant.equityUnit === "shares" && grant.sharesGranted
              ? `${grant.sharesGranted.toLocaleString()} acoes`
              : `${Number(grant.equityPercentage)}%`;

            return (
              <Card key={grant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-5 px-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {grant.role.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{grant.role}</p>
                        <p className="text-sm text-muted-foreground">
                          {grant.executiveLabel || grant.instrumentType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {grant.extractedByAi && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                          IA
                        </Badge>
                      )}
                      <GrantDeleteButton grantId={grant.id} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-muted-foreground mb-0.5">Equity</p>
                      <p className="font-semibold text-primary">{equityDisplay}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-muted-foreground mb-0.5">Vesting</p>
                      <p className="font-semibold">{grant.vestingTotalMonths} meses</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-muted-foreground mb-0.5">Cliff</p>
                      <p className="font-semibold">{grant.cliffMonths} meses</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-muted-foreground mb-0.5">Tipo</p>
                      <p className="font-semibold">{grant.grantType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="pt-6 text-center">
            <Link href="/benchmarks">
              <Button size="lg" className="gap-2 h-11 px-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                Ver benchmarks do mercado
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
