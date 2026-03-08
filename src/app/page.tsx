import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BenchmarkPreview } from "@/components/landing/benchmark-preview";

const stats = [
  { value: "100%", label: "Anonimizado" },
  { value: "p25/p50/p75", label: "Percentis" },
  { value: "IA", label: "Extração automática" },
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description:
      "Cadastre-se com email e LinkedIn. Verificação automática via IA.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
    ),
    badge: null,
  },
  {
    number: "02",
    title: "Acesse benchmarks",
    description:
      "Visualize percentis de equity, salário e vesting por cargo e estágio.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
    badge: null,
  },
  {
    number: "03",
    title: "Contribua seus dados",
    description:
      "Compartilhe sua compensação para melhorar os benchmarks.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
    ),
    badge: "opcional",
  },
];

const roles = [
  "CTO", "CFO", "COO", "CMO", "CPO", "VP Engineering", "VP Sales", "CHRO",
];

const trustItems = [
  { title: "Acesso gratuito", desc: "Sem necessidade de compartilhar dados." },
  { title: "Verificação via LinkedIn", desc: "Apenas executivos verificados." },
  { title: "100% anonimizado", desc: "Nenhum executivo ou empresa é identificado." },
  { title: "Mínimo de 10 executivos por segmento", desc: "Benchmarks só com dados suficientes." },
  { title: "Documentos efêmeros", desc: "Deletados após extração por IA." },
];

const platformCards = [
  { title: "Equity (%) por cargo", desc: "Percentis p25/p50/p75 por cargo e estágio" },
  { title: "Salário anual", desc: "Faixas por estágio e setor" },
  { title: "Vesting e cliff", desc: "Prazos mais comuns do mercado" },
  { title: "Instrumentos", desc: "Stock Options, Phantom, RSU, Cotas" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-icon.svg" alt="" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">Captable<span className="text-primary">BR</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/request-access">
              <Button size="sm">Cadastre-se grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Plataforma para executivos de startups brasileiras
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05] mb-6">
              Sua compensação em equity esta{" "}
              <span className="text-primary">competitiva?</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Benchmarks anonimizados de equity e remuneração para executivos C-level de startups brasileiras. Acesso gratuito.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/request-access">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Cadastre-se grátis
                </Button>
              </Link>
              <Link href="#benchmark-preview">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Ver exemplo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="max-w-2xl mx-auto mt-16 grid grid-cols-3 gap-8 rounded-2xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-1">
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 py-5 text-center">
                <p className="text-xl sm:text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Role pills */}
          <div className="max-w-2xl mx-auto mt-8 flex flex-wrap justify-center gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="px-4 py-1.5 rounded-full bg-muted/60 text-sm font-medium text-muted-foreground"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmark Preview */}
      <section id="benchmark-preview" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              Veja o que você vai encontrar
            </h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <BenchmarkPreview />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight">
              Três passos para benchmarks de equity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative p-8 rounded-2xl bg-background shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3">
                  {step.title}
                  {step.badge && (
                    <span className="ml-2 text-xs bg-muted-foreground/10 text-muted-foreground rounded-full px-2 py-0.5">
                      {step.badge}
                    </span>
                  )}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll See */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              O que você encontra na plataforma
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {platformCards.map((card) => (
              <Card key={card.title}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
            {trustItems.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{item.title}.</span>{" "}
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center rounded-3xl bg-zinc-900 p-12 sm:p-16 shadow-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
              Pronto para ver como sua compensação se compara?
            </h2>
            <p className="text-zinc-400 text-lg mb-8">
              Verificação automática via IA. Acesso em minutos.
            </p>
            <Link href="/request-access">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg"
              >
                Criar minha conta grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo-icon.svg" alt="" width={24} height={24} className="rounded-md" />
              <span className="text-sm font-semibold">CaptableBR</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Termos
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} CaptableBR. Dados anonimizados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
