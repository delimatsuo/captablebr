import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">Política de Privacidade</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Atualizado em Março 2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                LGPD
              </span>
            </div>
          </div>

          {/* Document body */}
          <div className="bg-background rounded-2xl border border-border/60 shadow-sm p-6 sm:p-10">
            <div className="prose prose-neutral prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2 prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">

              <p className="text-base !text-foreground !leading-relaxed">
                A presente Política de Privacidade descreve como a{" "}
                <strong>Ella Executive Search</strong> (&quot;Ella&quot;, &quot;nós&quot; ou
                &quot;nosso&quot;), operadora da plataforma <strong>CaptableBR</strong>{" "}
                (&quot;Plataforma&quot;), coleta, utiliza, armazena e protege os dados pessoais dos
                usuários (&quot;Usuário&quot; ou &quot;você&quot;), em conformidade com a Lei Geral
                de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
              </p>

              <h2>1. Controlador dos dados</h2>
              <p>
                O controlador dos dados pessoais tratados nesta Plataforma é a{" "}
                <strong>Ella Executive Search</strong>, empresa de recrutamento executivo
                com sede em São Paulo, Brasil.
              </p>
              <p>
                Contato do Encarregado de Proteção de Dados (DPO):{" "}
                <a href="mailto:contact@ellaexecutivesearch.com">contact@ellaexecutivesearch.com</a>
              </p>

              <h2>2. Dados coletados</h2>
              <p>Coletamos as seguintes categorias de dados:</p>
              <h3>2.1 Dados de cadastro</h3>
              <ul>
                <li>Nome completo</li>
                <li>Endereço de email</li>
                <li>URL do perfil do LinkedIn</li>
                <li>Cargo executivo (C-level ou VP)</li>
              </ul>
              <h3>2.2 Dados de contexto da empresa</h3>
              <ul>
                <li>Estágio da startup (Seed, Series A, B, C+)</li>
                <li>Setor de atuação</li>
                <li>País e moeda</li>
              </ul>
              <h3>2.3 Dados de compensação</h3>
              <ul>
                <li>Salário anual</li>
                <li>Percentual de equity, tipo de instrumento (Stock Options, Phantom Shares, RSU, Cotas)</li>
                <li>Cronograma de vesting e cliff</li>
              </ul>
              <h3>2.4 Documentos (opcional)</h3>
              <p>
                Caso o Usuário opte pelo upload de documentos para extração automática via IA, os
                arquivos são processados e <strong>deletados imediatamente</strong> após a extração
                e confirmação dos dados, ou em no máximo 24 horas.
              </p>
              <h3>2.5 Dados de navegação</h3>
              <p>
                Cookies essenciais de sessão (autenticação) são utilizados. Não utilizamos cookies de
                rastreamento ou publicidade.
              </p>

              <h2>3. Finalidade do tratamento</h2>
              <p>Os dados pessoais são tratados para as seguintes finalidades:</p>
              <ul>
                <li>Verificação de identidade e cargo via perfil do LinkedIn</li>
                <li>Geração de benchmarks anonimizados e agregados de compensação executiva</li>
                <li>Manutenção da qualidade e integridade dos dados da Plataforma</li>
                <li>Comunicação com o Usuário sobre sua conta</li>
              </ul>

              <h2>4. Base legal</h2>
              <p>
                O tratamento dos dados pessoais é realizado com base no{" "}
                <strong>consentimento do Usuário</strong> (Art. 7º, I da LGPD), manifestado no
                momento do cadastro e da submissão dos dados de compensação.
              </p>

              <h2>5. Anonimização e agregação</h2>
              <p>
                Todos os benchmarks exibidos na Plataforma são <strong>anonimizados e agregados</strong>.
                Nenhum dado individual é exposto. Os benchmarks são calculados apenas quando há um
                mínimo de 10 executivos por segmento (cargo + estágio), garantindo que nenhum Usuário
                possa ser identificado.
              </p>

              <h2>6. Compartilhamento de dados</h2>
              <p>
                <strong>Não compartilhamos dados individuais com terceiros.</strong> Os dados são
                processados pelos seguintes serviços de infraestrutura:
              </p>
              <ul>
                <li>
                  <strong>Google Cloud Platform (GCP)</strong> — hospedagem, banco de dados e
                  processamento de IA (Vertex AI para extração de documentos)
                </li>
                <li>
                  <strong>Firebase (Google)</strong> — autenticação de usuários
                </li>
              </ul>
              <p>
                Esses provedores atuam como operadores de dados e estão sujeitos a seus próprios
                termos de privacidade e proteção de dados.
              </p>

              <h2>7. Armazenamento e segurança</h2>
              <p>
                Os dados são armazenados em servidores da Google Cloud Platform localizados nos
                Estados Unidos, com criptografia em trânsito (TLS) e em repouso. Adotamos medidas
                técnicas e organizacionais adequadas para proteger os dados contra acesso não
                autorizado, perda ou destruição.
              </p>

              <h2>8. Direitos do Usuário (LGPD)</h2>
              <p>
                Nos termos da LGPD, você tem direito a:
              </p>
              <ul>
                <li>Confirmar a existência de tratamento dos seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>Solicitar a portabilidade dos dados</li>
                <li>
                  <strong>Solicitar a exclusão completa dos seus dados</strong> a qualquer momento
                </li>
                <li>Revogar o consentimento</li>
              </ul>
              <p>
                Para exercer qualquer desses direitos, entre em contato pelo email{" "}
                <a href="mailto:contact@ellaexecutivesearch.com">contact@ellaexecutivesearch.com</a>.
                Responderemos em até 15 dias úteis.
              </p>

              <h2>9. Retenção de dados</h2>
              <p>
                Os dados pessoais são mantidos enquanto o Usuário possuir conta ativa na Plataforma.
                Após a exclusão da conta, os dados são removidos em até 30 dias, exceto dados já
                anonimizados e incorporados aos benchmarks agregados, que não são identificáveis.
              </p>

              <h2>10. Alterações nesta política</h2>
              <p>
                Reservamo-nos o direito de alterar esta política a qualquer momento. Alterações
                significativas serão comunicadas por email ou notificação na Plataforma.
              </p>

              <h2>11. Contato</h2>
              <p>
                Para dúvidas, reclamações ou solicitações relacionadas a esta Política de Privacidade:
              </p>
              <p>
                <strong>Ella Executive Search</strong><br />
                Email: <a href="mailto:contact@ellaexecutivesearch.com">contact@ellaexecutivesearch.com</a><br />
                São Paulo, Brasil
              </p>
              <p>
                Você também pode registrar reclamação junto à Autoridade Nacional de Proteção de
                Dados (ANPD) — <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a>.
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
