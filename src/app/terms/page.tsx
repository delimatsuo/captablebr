import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-icon.svg" alt="" width={28} height={28} className="rounded-md" />
            <span className="text-base font-semibold tracking-tight">Captable<span className="text-primary">BR</span></span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full px-5 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Voltar ao início
            </Button>
          </Link>
        </div>
      </header>

      {/* Document */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Document header */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">Termos de Uso</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Atualizado em Março 2026
              </span>
            </div>
          </div>

          {/* Document body */}
          <div className="bg-background rounded-2xl border border-border/60 shadow-sm p-6 sm:p-10">
            <div className="prose prose-neutral prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">

              <p className="text-base !text-foreground !leading-relaxed">
                Estes Termos de Uso (&quot;Termos&quot;) regulam o acesso e uso da plataforma{" "}
                <strong>CaptableBR</strong> (&quot;Plataforma&quot;), operada pela{" "}
                <strong>Ella Executive Search</strong> (&quot;Ella&quot;, &quot;nós&quot; ou
                &quot;nosso&quot;), empresa de recrutamento executivo com sede em São Paulo, Brasil.
              </p>
              <p>
                Ao acessar ou utilizar a Plataforma, você declara que leu, compreendeu e concorda com
                estes Termos. Se você não concordar, não utilize a Plataforma.
              </p>

              <h2>1. Sobre a Plataforma</h2>
              <p>
                O CaptableBR é uma ferramenta de benchmarking de compensação executiva que permite a
                executivos C-level e VPs de startups brasileiras compararem seus pacotes de
                remuneração (equity, salário e vesting) com dados anonimizados e agregados do mercado.
              </p>

              <h2>2. Elegibilidade</h2>
              <p>
                A Plataforma é destinada a executivos C-level e VPs de startups. Ao se cadastrar,
                você declara que:
              </p>
              <ul>
                <li>É maior de 18 anos</li>
                <li>Ocupa ou ocupou cargo de nível executivo (C-level ou VP) em uma startup</li>
                <li>As informações fornecidas no cadastro são verdadeiras e completas</li>
              </ul>

              <h2>3. Cadastro e verificação</h2>
              <p>
                O cadastro requer nome, email, URL do perfil do LinkedIn e cargo. Realizamos
                verificação automática do perfil do LinkedIn para garantir a qualidade dos dados
                da Plataforma. Reservamo-nos o direito de recusar cadastros que não atendam aos
                critérios de elegibilidade.
              </p>

              <h2>4. Acesso aos benchmarks</h2>
              <p>
                O acesso aos benchmarks da Plataforma é <strong>gratuito</strong>. Incentivamos os
                Usuários a contribuírem com seus próprios dados de compensação de forma anônima para
                fortalecer a base de dados, mas a contribuição não é obrigatória para visualizar
                os benchmarks.
              </p>

              <h2>5. Veracidade dos dados</h2>
              <p>
                Ao contribuir dados de compensação, você se compromete a fornecer informações
                verdadeiras e precisas. Dados falsos ou deliberadamente imprecisos prejudicam a
                qualidade dos benchmarks para toda a comunidade e podem resultar no cancelamento
                da sua conta.
              </p>

              <h2>6. Propriedade intelectual</h2>
              <p>
                Todo o conteúdo da Plataforma — incluindo design, código, textos, gráficos e
                benchmarks agregados — é de propriedade da Ella Executive Search ou licenciado por
                terceiros, e está protegido por leis de propriedade intelectual.
              </p>

              <h2>7. Uso permitido</h2>
              <p>Os benchmarks e dados da Plataforma são para <strong>uso pessoal e profissional</strong> do Usuário. É vedado:</p>
              <ul>
                <li>Reproduzir, distribuir ou comercializar os dados da Plataforma sem autorização</li>
                <li>Utilizar scraping, bots ou outros meios automatizados para coletar dados</li>
                <li>Tentar identificar outros Usuários a partir dos dados agregados</li>
                <li>Utilizar a Plataforma para fins ilegais ou antiéticos</li>
              </ul>

              <h2>8. Privacidade e proteção de dados</h2>
              <p>
                O tratamento dos seus dados pessoais é regido pela nossa{" "}
                <Link href="/privacy">Política de Privacidade</Link>
                , que faz parte integrante destes Termos. Ao aceitar estes Termos, você também
                concorda com a Política de Privacidade.
              </p>

              <h2>9. Isenção de responsabilidade</h2>
              <p>
                Os benchmarks são fornecidos como <strong>referência informativa</strong> e não
                constituem consultoria jurídica, financeira ou de remuneração. A Ella Executive
                Search não se responsabiliza por decisões tomadas com base nos dados da Plataforma.
              </p>
              <p>
                A Plataforma é fornecida &quot;como está&quot; (as is), sem garantias de qualquer
                tipo, expressas ou implícitas, incluindo garantias de precisão, completude ou
                adequação a uma finalidade específica.
              </p>

              <h2>10. Limitação de responsabilidade</h2>
              <p>
                Na extensão máxima permitida por lei, a Ella Executive Search não será responsável
                por danos diretos, indiretos, incidentais, consequenciais ou punitivos decorrentes
                do uso ou impossibilidade de uso da Plataforma.
              </p>

              <h2>11. Cancelamento e exclusão</h2>
              <p>
                Você pode solicitar o cancelamento da sua conta e a exclusão dos seus dados a
                qualquer momento, entrando em contato pelo email{" "}
                <a href="mailto:contact@ellaexecutivesearch.com">contact@ellaexecutivesearch.com</a>. Dados já
                anonimizados e incorporados aos benchmarks agregados não são identificáveis e
                permanecem na base.
              </p>

              <h2>12. Alterações nos Termos</h2>
              <p>
                Reservamo-nos o direito de alterar estes Termos a qualquer momento. Alterações
                significativas serão comunicadas por email ou notificação na Plataforma. O uso
                continuado após a notificação constitui aceitação dos novos Termos.
              </p>

              <h2>13. Legislação aplicável e foro</h2>
              <p>
                Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito
                o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer
                controvérsias decorrentes destes Termos.
              </p>

              <h2>14. Contato</h2>
              <p>
                Para dúvidas ou solicitações relacionadas a estes Termos:
              </p>
              <p>
                <strong>Ella Executive Search</strong><br />
                Email: <a href="mailto:contact@ellaexecutivesearch.com">contact@ellaexecutivesearch.com</a><br />
                São Paulo, Brasil
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              CaptableBR é um produto da{" "}
              <a href="https://ellaexecutivesearch.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
                Ella Executive Search
              </a>
            </p>
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-full px-5 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Voltar ao início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
