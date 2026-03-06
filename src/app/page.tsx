import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "100%", label: "Anonimizado" },
  { value: "p25/p50/p75", label: "Percentis" },
  { value: "IA", label: "Extração automática" },
];

const steps = [
  {
    number: "01",
    title: "Descreva sua empresa",
    description:
      "Informe estágio, setor e modelo de negócio. Usamos apenas para segmentar — nenhuma empresa é identificada.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
    ),
  },
  {
    number: "02",
    title: "Compartilhe sua compensação",
    description:
      "Informe seu pacote de equity ou faça upload do contrato. Nossa IA extrai os dados automaticamente.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
    ),
  },
  {
    number: "03",
    title: "Acesse benchmarks do mercado",
    description:
      "Visualize percentis p25/p50/p75 de equity por cargo, segmentado por estágio, setor e modelo.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
  },
];

const roles = [
  "CTO", "CFO", "COO", "CMO", "CPO", "VP Engineering", "VP Sales", "CHRO",
];

const trustItems = [
  { title: "Você só compartilha seus próprios dados", desc: "Nenhum dado de terceiros é solicitado." },
  { title: "Nenhum executivo ou empresa é identificado", desc: "Anonimização total nos benchmarks." },
  { title: "Mínimo de 10 executivos por segmento", desc: "Benchmarks só com dados suficientes." },
  { title: "Documentos efêmeros", desc: "Deletados após extração por IA." },
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
              <Button size="sm">Solicitar acesso</Button>
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
              Benchmarks anonimizados reportados por executivos.
              Compartilhe sua compensação, veja a do mercado.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/request-access">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Solicitar acesso
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Como funciona
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

      {/* How it works + Trust */}
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
                <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Trust bullets */}
          <div className="max-w-3xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
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
              Pronto para comparar sua compensação?
            </h2>
            <p className="text-zinc-400 text-lg mb-8">
              Junte-se a executivos que já comparam sua compensação no CaptableBR.
            </p>
            <Link href="/request-access">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg"
              >
                Solicitar acesso
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
