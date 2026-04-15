import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestAccessPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <Image src="/logo-icon.svg" alt="" width={40} height={40} className="rounded-xl" />
            <span className="text-2xl font-bold">CaptableBR</span>
          </Link>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Benchmarks de compensacao para executivos de startups
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Compare seu equity, salario e vesting com outros executivos C-level de startups brasileiras. Dados 100% anonimizados.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <Link href="/" className="lg:hidden flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <Image src="/logo-icon.svg" alt="" width={32} height={32} className="rounded-lg" />
              <span className="text-lg font-bold">CaptableBR</span>
            </Link>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <CardTitle className="text-2xl">Acesso por convite</CardTitle>
            <CardDescription>
              O CaptableBR e uma plataforma fechada. O acesso e liberado apenas por convite direto da Ella Executive Search.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Se voce e um executivo C-level de uma startup e gostaria de participar, entre em contato conosco pelo site da Ella Executive Search.
            </p>
            <a href="https://www.ellaexecutivesearch.com" target="_blank" rel="noopener noreferrer">
              <Button className="w-full h-11">
                Conhecer a Ella Executive Search
              </Button>
            </a>
            <Link href="/login">
              <Button variant="outline" className="w-full h-11">
                Ja tenho convite — fazer login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
