import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BenchmarkPreview } from "@/components/landing/benchmark-preview";

const stats = [
  { value: "174+", label: "Executivos na base" },
  { value: "11 cargos", label: "C-level cobertos" },
  { value: "Seed a Series C+", label: "Estágios cobertos" },
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta em 2 minutos",
    description:
      "Cadastre-se com email e LinkedIn. Verificação automática para garantir dados de qualidade.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
    ),
  },
  {
    number: "02",
    title: "Acesse seus benchmarks",
    description:
      "Veja percentis de equity, salário e vesting filtrados por cargo e estágio. Dados reais do mercado brasileiro.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
  },
  {
    number: "03",
    title: "Contribua e fortaleça os dados",
    description:
      "Ao compartilhar sua compensação de forma anônima, você ajuda a construir a maior base de remuneração executiva do Brasil.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
    ),
  },
];

const platformItems = [
  { title: "Equity (%) por cargo e estágio", desc: "Qual o percentual típico de um CTO em Series A? Veja p25, p50 e p75." },
  { title: "Salário anual em USD", desc: "Faixas salariais por cargo, estágio e setor." },
  { title: "Vesting e cliff", desc: "Prazos mais comuns: 4 anos com cliff de 1 ano?" },
  { title: "Tipos de instrumento", desc: "Stock Options, Phantom, RSU ou Cotas." },
];

const trustItems = [
  { title: "Acesso gratuito", desc: "Visualize benchmarks sem compartilhar dados." },
  { title: "Apenas executivos verificados", desc: "Validamos perfil e cargo para manter a qualidade dos dados." },
  { title: "100% anonimizado", desc: "Nenhum executivo ou empresa é identificado." },
  { title: "Mínimo de 10 executivos por segmento", desc: "Benchmarks só com dados suficientes." },
  { title: "Documentos descartados após uso", desc: "Deletados imediatamente após extração automática." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col landing-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-icon.svg" alt="" width={32} height={32} className="rounded-lg" />
            <span className="text-[19px] font-semibold tracking-tight">Captable<span className="text-primary">BR</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground">Entrar</Button>
            </Link>
            <Link href="/request-access">
              <Button size="sm" className="rounded-full px-5">Cadastre-se grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 sm:pt-36 sm:pb-40 lg:pt-44 lg:pb-48">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.07] text-primary text-sm font-medium mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Benchmarks de compensação para C-levels no Brasil
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] mb-8">
              Entenda como sua{" "}
              <span className="text-primary">remuneração</span>{" "}
              se compara no mercado
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-[1.6]">
              Compare seu equity, salário e vesting com outros executivos C-level de startups brasileiras — de forma 100% anônima e gratuita.
            </p>
            <div className="flex flex-col items-center gap-5">
              <Link href="/request-access">
                <Button size="lg" className="h-14 px-10 text-base rounded-full shadow-lg shadow-primary/20 font-medium">
                  Cadastre-se grátis
                </Button>
              </Link>
              <a
                href="#benchmark-preview"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                Ver exemplo de benchmark
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="max-w-xl mx-auto mt-20 flex items-center justify-center divide-x divide-border/60">
            {stats.map((stat) => (
              <div key={stat.label} className="px-8 py-2 text-center">
                <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Roles */}
          <p className="max-w-2xl mx-auto mt-6 text-center text-[13px] text-muted-foreground hidden sm:block">
            CTO · CFO · COO · CMO · CPO · VP Engineering · VP Sales · CHRO
          </p>
        </div>
      </section>

      {/* Benchmark Preview */}
      <section id="benchmark-preview" className="py-24 sm:py-32 lg:py-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Exemplo: benchmarks para CTOs em Series A
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <BenchmarkPreview />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 sm:py-32 lg:py-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Como funciona
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="h-12 w-12 rounded-2xl bg-primary/[0.07] text-primary flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <p className="text-[13px] font-medium text-primary/60 mb-2 uppercase tracking-widest">
                  {step.number}
                </p>
                <h3 className="text-base font-semibold tracking-tight mb-3">
                  {step.title}
                </h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll See */}
      <section className="py-20 sm:py-28 lg:py-36 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              O que você encontra na plataforma
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-4xl mx-auto text-center">
            {platformItems.map((item) => (
              <div key={item.title}>
                <h3 className="text-sm font-semibold tracking-tight mb-1.5">{item.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Por que executivos confiam no CaptableBR
            </h2>
          </div>
          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-6">
            {trustItems.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-[15px] text-muted-foreground">
                  <span className="font-medium text-foreground">{item.title}.</span>{" "}
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ella Executive Search */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-[13px] font-medium text-primary/60 mb-2 uppercase tracking-widest">
              Quem está por trás
            </p>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              CaptableBR é uma iniciativa da{" "}
              <a
                href="https://ellaexecutivesearch.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                Ella Executive Search
              </a>
              , empresa de recrutamento executivo especializada em startups brasileiras.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center rounded-[2rem] bg-[oklch(0.15_0.025_260)] p-10 sm:p-16 lg:p-20 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-5">
              Negocie seu próximo pacote com dados reais
            </h2>
            <p className="text-[oklch(0.65_0.015_260)] text-lg mb-10">
              Cadastro gratuito em 2 minutos. Verificação automática.
            </p>
            <Link href="/request-access">
              <Button
                size="lg"
                className="h-14 px-10 text-base font-medium rounded-full bg-white text-[oklch(0.15_0.025_260)] hover:bg-white/90 shadow-lg"
              >
                Começar agora — é grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 sm:py-16">
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
            <div className="text-xs text-muted-foreground text-center sm:text-right">
              <p>
                © {new Date().getFullYear()} CaptableBR. Um produto{" "}
                <a
                  href="https://ellaexecutivesearch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  Ella Executive Search
                </a>
                .
              </p>
              <p className="mt-1 text-muted-foreground/70">
                Recrutamento executivo para startups.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
